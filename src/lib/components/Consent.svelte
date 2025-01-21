<script lang="ts">
    import { getCameraConsent } from '$lib/stores/consentStore';

    const cameraConsent = getCameraConsent();

    function handleConsent() {
        $cameraConsent = true;
    }
</script>

<div class="consent-screen">
    
    <div class="content">
        <div class="more-info-box">
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
            <p>
                <strong>
                    You can revoke access to the camera and local storage at any time by pressing the icon left of the language selection.
                </strong>
            </p>
        </div>
        
        <div class="more-info-box">
            <p>
                <strong>A little more information as your privacy is important to us!</strong>
            </p>
            <p>
                The camera feed is processed locally and we don't store any images or video data permanently on our servers.
                <br/>
                <i>
                    Yet the image is sent to Google's servers for analysis.
                    So please use this tool for the purpose it is intended for only.
                </i>
            </p>

            <p>
                The images, historic analysis results and your custom scenario instructions are stored in your browser's local storage.
            </p>
        </div>

    </div>
</div>

<style>
    .more-info-box {
        margin-top: 2rem;
        padding: 0rem 1rem;
        border: 1px solid var(--primary-color);
        border-radius: 20px;
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
        margin-top: 0rem;
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