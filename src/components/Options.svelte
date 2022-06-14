<script lang="ts">
    import Logo from './Logo.svelte';

    function signOut() {
        chrome.runtime.sendMessage({
            msgType: "sign_out"
        })
    }
</script>

<style>
    a {
        text-decoration: none;
        cursor: pointer;
    }
    .container {
        min-width: 250px;
    }

    button {
        border-radius: 2px;
        background-color: #FFFFFF;
        color: #000000;
        transition: background-color 0.3s;
        padding: 5px 10px;
        border: none;
        display: block;
        margin: 0 auto;
        cursor: pointer;
    }

    #SignOut:hover,
    #SignOut:focus {
        background-color: red;
    }

    #About:hover,
    #About:focus {
        background-color: #1565c0;
    }
</style>

<div class="container">
    <Logo />
    <a href="https://needlesearch.carrd.co/" target="_blank"><button id="About">About</button></a>
    <button id="SignOut" on:click={signOut}>Sign Out</button>
</div>




