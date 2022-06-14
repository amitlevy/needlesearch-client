<script lang="ts">
    import Logo from './Logo.svelte';
    
    function signIn() {
        chrome.runtime.sendMessage({
            msgType: "sign_in_google"
        })
    }
</script>

<style>

    .container {
        min-width: 250px;
    }

    p {
        text-align: center;
        font-size: small;
        margin: 10px;
    }

</style>

<div class="container">
    <Logo />

    <p>In order to rate pages, you need to login:</p>

    <div on:click={signIn} class="col s12 m6 offset-m3 center-align" style="margin: 20px auto;">
        <a class="oauth-container btn darken-4 white black-text" role="button" style="text-transform:none">
            <div class="left">
                <img width="20px" style="margin-top:7px; margin-right:8px" alt="Google sign-in" 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
            </div>
            Login with Google
        </a>
    </div>
    
    <!-- Compiled and minified CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css">
</div>




