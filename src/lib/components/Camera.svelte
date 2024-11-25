<script lang="ts">
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { password } from '$lib/stores/passwordStore';
    import { cameraConsent } from '$lib/stores/consentStore';

    let video: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let captureBtn: HTMLButtonElement;
    let retakeBtn: HTMLButtonElement;
    let analyzeBtn: HTMLButtonElement;
    let result: HTMLDivElement;
    let loading: HTMLDivElement;
    let stream: MediaStream | null = null;

    const mimeType = 'image/webp';
    const extension = 'webp';
    const imageWidth = 2048;
    const imageHeight = 2048;

    // Configure marked to allow HTML in markdown
    marked.setOptions({
        breaks: true
    });

    onMount(() => {
        initCamera();
        return () => {
            stopCamera();
        };
    });

    function revokeConsent() {
        $cameraConsent = false;
    }

    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: imageWidth },
                    height: { ideal: imageHeight }
                }
            });
            video.srcObject = stream;
            video.style.display = 'block';
            canvas.style.display = 'none';
            analyzeBtn.style.display = 'none';
            
            // Enable the capture button only when video is actually playing
            video.addEventListener('loadeddata', () => {
                captureBtn.disabled = false;
            });
        } catch (err) {
            console.error('Error accessing camera:', err);
            result.innerHTML = 'Error accessing camera. Please ensure you have granted camera permissions.';
            captureBtn.disabled = true;
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }

    async function analyzeImage() {
        loading.style.display = 'block';
        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((b) => resolve(b!), mimeType, 0.8);
            });

            const formData = new FormData();
            formData.append('mimeType', mimeType);
            formData.append('file', blob, `image.${extension}`);
            formData.append('password', $password);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (response.status === 401) {
                result.innerHTML = 'Access denied. Please check that you have entered the correct password.';
                console.error('Access denied. Please check that you have entered the correct password.');
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const convertedContent = marked.parse(data.result_text || 'No additional information available');
            
            result.innerHTML = `
                <h3>Analysis Results:</h3>
                <p><strong>Additional Information:</strong></p>
                <div>${convertedContent}</div>
            `;
        } catch (err) {
            console.error('Error analyzing image:', err);
            result.innerHTML = 'Error analyzing image. Please try again.';
        } finally {
            loading.style.display = 'none';
        }
    }

    async function handleCapture() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        
        stopCamera();
        video.style.display = 'none';
        canvas.style.display = 'block';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline';
        analyzeBtn.style.display = 'inline';

        await analyzeImage();
    }

    function handleRetake() {
        captureBtn.disabled = true;
        canvas.style.display = 'none';
        captureBtn.style.display = 'inline';
        retakeBtn.style.display = 'none';
        analyzeBtn.style.display = 'none';
        result.innerHTML = '';
        initCamera();
    }
</script>

<div class="top_section">
    <h1>Third Eye</h1>
    <p>Take a photo of a grocery product to analyze its nutritional information</p>
    <div class="password-input">Password:
        <input type="password" bind:value={$password} />
        <button on:click={revokeConsent} title="Revoke camera access consent" style="width: 24px; height: 24px; padding: 0; font-size: 12px;">&#x26A0;</button>
    </div>
    <div class="camera-container">
        <video 
            bind:this={video} 
            id="video" 
            autoplay 
            playsinline
            aria-label="Camera feed"
        >
            <track kind="captions" label="Camera feed captions" />
        </video>
        <canvas
            bind:this={canvas}
            id="canvas"
            aria-label="Captured photo"
        ></canvas>
    </div>

    <div>
        <button 
            bind:this={captureBtn} 
            id="captureBtn" 
            on:click={handleCapture}
            disabled
        >
            Take Photo
        </button>
        <button 
            bind:this={retakeBtn} 
            id="retakeBtn" 
            on:click={handleRetake}
            style="display: none;"
        >
            Retake Photo
        </button>
        <button
            bind:this={analyzeBtn}
            id="analyzeBtn"
            on:click={analyzeImage}
            style="display: none;"
        >
            Analyze Again
        </button>
    </div>

    <div bind:this={loading} id="loading" class="loading">Analyzing</div>
</div>
<div bind:this={result} id="result"></div>

<style>
    :root {
        --primary-color: #6366F1;
        --primary-hover: #4F46E5;
        --background-color: #F8FAFC;
        --text-color: #1F2937;
        --border-color: #E2E8F0;
    }

    p {
        color: #64748B;
        margin-bottom: 2.5rem;
        font-size: 1.125rem;
    }

    .top_section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .top_section p {
        margin: 5px;
    }

    .password-input input {
        width: 50px;
    }

    .camera-container {
        margin: 24px auto;
        position: relative;
        width: 320px;
        height: 240px;
        border: 2px solid var(--border-color);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.08), 
                    0 4px 8px -4px rgba(0, 0, 0, 0.03);
        background-color: white;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .camera-container:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 20px -4px rgba(0, 0, 0, 0.12), 
                    0 6px 10px -4px rgba(0, 0, 0, 0.04);
    }

    #video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    #canvas {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: none;
    }

    #result {
        margin-top: 24px;
        padding: 24px;
        border-radius: 16px;
        background-color: white;
        text-align: left;
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08), 
                    0 4px 12px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border-color);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    #result:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 24px -5px rgba(0, 0, 0, 0.12), 
                    0 6px 16px -5px rgba(0, 0, 0, 0.06);
    }

    .loading {
        display: none;
        margin: 24px auto;
        font-weight: 600;
        color: var(--primary-color);
        position: relative;
        font-size: 1.125rem;
    }

    .loading:after {
        content: "";
        animation: dots 1.4s infinite;
        position: absolute;
        margin-left: 4px;
    }

    @keyframes dots {
        0%, 20% { content: ""; }
        40% { content: "."; }
        60% { content: ".."; }
        80% { content: "..."; }
    }

    @media (hover: none) {
        button:hover:not(:disabled),
        .camera-container:hover,
        #result:hover {
            transform: none;
        }
    }
</style>