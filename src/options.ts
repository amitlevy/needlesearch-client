import Options from "./components/Options.svelte";

function restoreOptions() {
    const app = new Options({
        target: document.body,
        props: { },
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
