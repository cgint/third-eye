<script lang="ts">
    import { cameraConsent } from '$lib/stores/consentStore';

    function handleConsent() {
        $cameraConsent = true;
    }
</script>

<div class="consent-screen">
    <h1>Welcome to Third Eye</h1>
    
    <div class="content">
        <h2>Before we begin</h2>
        <p>
            This application uses your device's camera to provide image analysis for your daily needs.
            Therefore you will be asked to grant access to the camera.
        </p>
        <p>
            Your permission is required to:
        </p>
        
        <ul>
            <li>Capture pictures of the object in question</li>
        </ul>

        <button on:click={handleConsent} class="consent-button">
            I understand and want to proceed
        </button>

        <p><i>
            Your privacy is important.
            The camera feed is processed locally and we don't store any images or video data permanently.
        </i></p>

        <p><i>
            Yet the image is sent to Google's servers for analysis.
            So please use this tool for the purpose it is intended for only.
        </i></p>
    </div>
</div>

<style>
    .consent-screen {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }

    .content {
        text-align: left;
        margin-top: 2rem;
    }

    ul {
        margin: 1rem 0;
        padding-left: 2rem;
    }

    .consent-button {
        margin-top: 2rem;
        padding: 12px 24px;
        font-size: 1.1rem;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .consent-button:hover {
        background-color: var(--primary-hover);
    }
</style> 