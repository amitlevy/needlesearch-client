import Rate from "./components/Rate.svelte";
import SignIn from "./components/SignIn.svelte";
import Options from "./components/Options.svelte";

let signed_in;

chrome.runtime.onMessage.addListener(msg => {
    if (msg.msgType == "sign_in_status_changed") {
        // reload the page
        location.reload();
    }
    if (msg.msgType == "rating_processed" && msg.success) {
        location.reload();
    }
});

function chooseComponentBasedOnSignInStatus() {
    chrome.storage.sync.get(['signed_in'], async function(result) {
        signed_in = result.signed_in;

        let tabs = await chrome.tabs.query({active: true, currentWindow: true});
        let url = tabs[0].url;
        let is_google_url = url.includes("www.google.") || url.includes("chrome://");

        if (signed_in && !is_google_url){
            let app = new Rate({
                target: document.body,
                props: {},
                });
        }
        else if (signed_in) {
            let app = new Options({
                target: document.body,
                props: {},
                });
        }
        else {
            let app = new SignIn({
                target: document.body
            })
        }
    });
}

chooseComponentBasedOnSignInStatus();


