export function clean_url(url) {
    // remove the prefix "https://" or "http://"
    url = url.replace(/^https?:\/\//, '');
    // remove everything after the fifth forward-slash.
    url = url.split("/").slice(0, 6).join("/");

    // check if the url is a youtube watch url since the parameter is important in that case
    if (url.includes("youtube.com/watch")) {
        // get the video id
        let video_id = url.split("v=")[1];
        // there might be more paramters, we need to remove them (everything after the first ampersand)
        video_id = video_id.split("&")[0];
        // change url to custom format
        url = "www.youtube.com/watch/" + video_id;
    }
    else {
        // remove everything after the question mark.
        url = url.split("?")[0];
        // remove everything after the hash, because it points to a specifc part of the page.
        url = url.split("#")[0];
    }

    // if the url ends with a forward-slash, remove it.
    if (url.endsWith("/")) {
        url = url.slice(0, -1);
    }

    return url;
}
export function encode_url(url){
    
    url = clean_url(url);

    let url_encoded = encodeURIComponent(url);
    // encoding all dots to %2E manually
    url_encoded = url_encoded.replace(/\./g, "%2E");

    return url_encoded;
}