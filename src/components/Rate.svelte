<script lang="ts">
    import {encode_url, clean_url} from "../url_encode";
    import {get_score_color} from "../utils";
    import Logo from './Logo.svelte';
    import { onMount } from "svelte";

    let promise = chrome.tabs.query({active: true, currentWindow: true});
    let score;
    let total;
    let like_image = "images/like.png";
    let dislike_image = "images/dislike.png";
    

    function url_ratio(url:string) {
        chrome.runtime.sendMessage({
            msgType: "get_url_ratio",
            url: url
        }, (response) => {
            score = response['score'] + "%";
            if (response['overloaded'])
            {
                score += "*";
            }
            total = response['total'];
        });
    }

    onMount(async() => {
        score = "??%";
        promise.then(tabs => {url_ratio(tabs[0].url)});
    })
    
    function updateImages() {
        // update between like.png and active_like.png based on chrome sync storage. Meaning if url_encoded key has action = like, like image becomes active_like
        promise.then((tabs) => {
            let url_encoded = encode_url(tabs[0].url);
            chrome.storage.sync.get(url_encoded, (result) => {
                if (result[url_encoded] == "like") {
                    like_image = "images/active_like.png";
                    dislike_image = "images/dislike.png";
                } else if (result[url_encoded] == "dislike") {
                    like_image = "images/like.png";
                    dislike_image = "images/active_dislike.png";
                }
                else {
                    like_image = "images/like.png";
                    dislike_image = "images/dislike.png";
                }
            });
        });
    }

    function handleAction(action: string) {
        promise.then((tabs) => {
            let url_encoded = tabs[0].url;
            url_encoded = encode_url(url_encoded);
            // sync to chrome storage that the url was liked/disliked
            chrome.storage.sync.set({[url_encoded]: action});
            updateImages();

            chrome.runtime.sendMessage({
                msgType: "rating",
                url: url_encoded,
                action: action
            })
        });
    };

    function handleLike() {
        handleAction("like");
    };

    function handleDislike() {
        handleAction("dislike");
    };
    
    updateImages();

    function shorten_url(cleaned_url:string) {
        // gets cleaned url
        // if length is less than 51 characters, do nothing. Otherwise shorten to 48 characters and add ...
        if (cleaned_url.length > 50) {
            cleaned_url = cleaned_url.substring(0, 48) + "...";
        }
        return cleaned_url;
    }

</script>

<style>
    .container {
        min-width: 250px;
    }

    p {
        text-align: center;
        font-size: large;
    }

    button {
        background-color: #2ecc71;
        color: #ecf0f1;
        transition: background-color 0.3s;
        padding: 5px 10px;
        border: none;
        cursor: pointer;
    }

    button:hover,
    button:focus {
        background-color: #27ae60;
    }
</style>

<div class="container">
    <Logo />
    <!-- Show the pages url, without the http:// https://, and limiting to 30 characters-->
    {#await promise then tabs}
        <p style = "font-size:9px">{shorten_url(clean_url(tabs[0].url).replace("http://", "").replace("https://", ""))}</p>
    {/await}

    <!-- A centered div for both buttons-->
    <div style="margin: 0 auto; width: 128px; display: block;">
        <button on:click={handleLike} style="margin: 5px; background-color: white; background-image: url({like_image}); background-size: contain; background-repeat: no-repeat; background-position: center; width: 50px; height: 50px;"></button>
        
        <!-- And a dislike, which is a flipped version of the same image-->
        <button on:click={handleDislike} style="margin: 5px; background-color: white; background-image: url({dislike_image}); background-size: contain; background-repeat: no-repeat; background-position: center; width: 50px; height: 50px;"></button>
    </div>

    {#if (score == "??%" || !score)}
        <p style="color:black; margin: 4px 0;">Loading...</p>
    {:else if (score == "No ratings%")}
        <p style ="margin: 4px 0;"> No ratings </p>
    {:else if (parseInt(score.replace("%", "").replace("*","")) > 85)}
        <p style="color:#1EA896; margin: 4px 0;">{score} <span style="color:black">({total})</span></p>
    {:else if (parseInt(score.replace("%", "").replace("*","")) > 65)}
        <p style="color:#E8871E; margin: 4px 0;">{score} <span style="color:black">({total})</span></p>
    {:else}
        <p style="color:#C62828; margin: 4px 0;">{score} <span style="color:black">({total})</span></p>
    {/if}



    {#if (score && score.includes("*"))}
        <p style="font-size: 9px">*Ratio estimated from a higher level url.</p>
    {:else}
        <p style="font-size: 9px; visibility:hidden;">easter egg?</p>
    {/if}
</div>




