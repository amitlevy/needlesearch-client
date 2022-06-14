import {encode_url} from './url_encode';

chrome.runtime.onInstalled.addListener(() => {
    // if storage signed_in is undefined, set it to false
    chrome.storage.sync.get(['signed_in'], function(result) {
        if (result.signed_in === undefined) {
            chrome.storage.sync.set({ signed_in: false });
        }
    });

    let externalUrl = "https://needlesearch.carrd.co/";

    chrome.tabs.create({ url: externalUrl });
});


chrome.runtime.setUninstallURL(
  "https://docs.google.com/forms/d/e/1FAIpQLScbVMjX-D0T4kRaMlpp_XrTcwuBCS8TyKv4sX3vId5doAn8fQ/viewform?usp=sf_link"
)

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, getAuth } from 'firebase/auth';
import { getDatabase, get, ref } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    // kept hidden for security reasons
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.msgType == "rating") {
        handleRating(msg);
    }
    else if (msg.msgType == "sign_in_google") {
        handleGoogleSignIn();
    }
    else if (msg.msgType == "sign_out") {
        handleSignOut();
    }
    else if (msg.msgType == "get_url_ratio") {
        getURLRatio(msg).then(res => {
            sendResponse({"score": res['score'], "overloaded": res['overloaded'], "total": res['total']});
            
        });
    }
    else if (msg.msgType == "set_badge") {
        setBadge(msg);
    }
    else {
        console.log("background.js ignoring message: " + msg.msgType);
    }

    return true;
})

function setBadge(msg) {
    // set the badge for the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.action.setBadgeText({text: msg.text, tabId: tabs[0].id});
    });
}

function handleRating(msg) {
    // asks CF to update RTDB with rating
    let url = msg.url;
    let action = msg.action;

    var unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            user.getIdToken().then(idToken => {
                fetch('https://us-central1-needlesearch-9962b.cloudfunctions.net/handleRating', {
                    method: 'POST',
                    headers: {
                        Authorization: idToken,
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        url: url,
                        action: action
                    })
                })
                .then(res => res.json())
                .then(data => {console.log(data); chrome.runtime.sendMessage({msgType: "rating_processed", "success": data.success});})
            });

            unsubscribe();
        } 
    });
}

async function getURLRatio(msg) {
    if (getApps().length < 1) {
        initializeApp(firebaseConfig);
      }
    let encoded_url = encode_url(msg.url);
    let snapshot;
    let i = 0;
    let overloaded = false;
    while ((!snapshot || (!snapshot.exists())) && i < 4) {
        if (i > 0) {
            overloaded = true;
        }
        let urlRefRatings = ref(database, 'urls/' + encoded_url +"/ratings");
        snapshot = await get(urlRefRatings);
        // remove everything after the final backslash in the encoded_url
        if (!encoded_url.includes("%2F")) {
            break;
        }
        encoded_url = encoded_url.split("%2F").slice(0, -1).join("%2F");
        i++;
    }

    if (snapshot.exists())
    {
        let data = snapshot.val();
        let likes = data.likes;
        let dislikes = data.dislikes;
        let total = likes + dislikes;
        if (total == 0) {
            let score = "50";

            return {"score": score, "overloaded": overloaded, "total": total};
        }
        let score = likes/total*1000;
        score = Math.round(score);
        score /= 10;
        let str_score = score.toString();

        return {"score": str_score, "overloaded": overloaded, "total": total};
    }

    let str_score = "No ratings";

    return {"score": str_score, "overloaded": false, "total": 0};
}

function handleGoogleSignIn() {
    chrome.identity.getAuthToken({interactive : true}, (token) => {
        var credential = GoogleAuthProvider.credential(null, token);
        signInWithCredential(auth, credential).then((userCred) => {
            userCred.user.getIdToken(true).then((idToken) => {
                fetch('https://us-central1-needlesearch-9962b.cloudfunctions.net/hW', {
                    headers: {
                        'Authorization': idToken
                    }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success == true) {
                        chrome.storage.sync.set({ signed_in: true });
                        chrome.runtime.sendMessage({
                            msgType: "sign_in_status_changed",
                        })
                    }
                    else {
                        console.log("sign in failed");
                    }
                })
            })
        }).catch(console.error);
    });
}

function handleSignOut() {
    auth.signOut().then(function() {
        chrome.storage.sync.set({ signed_in: false });
        chrome.runtime.sendMessage({
            msgType: "sign_in_status_changed",
        });
      }, function(error) {
        console.error('Sign Out Error', error);
      });
}

