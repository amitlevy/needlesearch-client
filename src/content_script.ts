import {get_score_color} from "./utils";

let removed_results = 0;

var observer = new MutationObserver(onMutation);
observer.observe(document, {
  childList: true, // report added/removed nodes
  subtree: true,   // observe any descendant elements
});

function onMutation(mutations) {
    if (mutations.length === 1) {
        // optimize the most frequent scenario: one element is added/removed
        const added = mutations[0].addedNodes[0];
        if (!added || (added.localName !== 'a' && !added.firstElementChild)) {
          return;
        }
      }
    // loop on all mutations, then loop over all added nodes in each mutation
    for (let mutation of mutations) {
        for (let element of mutation.addedNodes) {
            // TODO: What if it is a child? Use getElementsByTagName
            if (element.localName === 'a') {
                perAnchorElement(element);
            }
        }
    }

    if (removed_results > 0) {
        // send message to background script
        chrome.runtime.sendMessage({msgType: "set_badge", "text": removed_results.toString()});
    }
}


function url_ratio(url:string, h3:any) {
    chrome.runtime.sendMessage({
        msgType: "get_url_ratio",
        url: url
    }, (response) => {
        /*if (response['score'] < 50 && response['total'] > 0)
        {
            // just remove the h3's ancestor with the class "g tF2Cxc"
            // we will do that by looking at the parent element, until we found one with that class. Then we remove it. If we can't find it, then give up.
            let parent = h3.parentElement;
            while (parent && !parent.classList.contains("g")) {
                parent = parent.parentElement;
            }
            if (parent) {
                parent.remove();
                removed_results += 1;
            }
        }*/
        if (response['score'] == "No ratings")
        {
        }
        else if (!response['overloaded'])
        {
            h3.innerHTML += " <span style='color:" + get_score_color(response['score'])+";'>"+response['score']+"%</span>"
        }
        else
        {
            h3.innerHTML += " <span style='color:" + get_score_color(response['score'])+";'>"+response['score']+"%*</span>"
        }
    });
}

function perAnchorElement(element)
{
    if (!element.href.includes("www.google.com")) {
        // get the h3 inside the anchor
        check_h3: try {
            var h3 = element.getElementsByTagName("h3")[0];
            if (h3) {
                url_ratio(element.href, h3);
            }
            else {
                break check_h3;
            }
        } catch {}

    }
}
