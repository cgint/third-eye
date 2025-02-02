<script lang="ts">
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { getPasswordStore } from '$lib/stores/passwordStore';
    import { getLanguageStore } from '$lib/stores/languageStore';
    import { getCameraConsent } from '$lib/stores/consentStore';
    import { IMAGE_MIME_TYPE, IMAGE_EXTENSION, IMAGE_QUALITY_MAX, IMAGE_WIDTH, IMAGE_HEIGHT } from '$lib/constants';
    import { getScenarioStores } from '$lib/stores/scenarioStore';
    import { getCustomInstructions } from '$lib/stores/customInstructionsStore';
    import { getAnalysisHistory } from '$lib/stores/analysisHistoryStore';
    import { clearAllStores } from '$lib/stores/allStoresRemover';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import type { AnalysisResult } from '$lib/models/analysis';
    
    export let instructions: string;

    const password = getPasswordStore();
    const language = getLanguageStore();
    const cameraConsent = getCameraConsent();
    const { scenarios, selectedScenarioId } = getScenarioStores();
    const customInstructions = getCustomInstructions();
    const analysisHistory = getAnalysisHistory();
    let chatHistories: Record<number, { question: string, answer: string }[]> = {};
    let followupQuestions: Record<number, string> = {};
    let lastBlobLocal: Blob | null = null;
    let lastAnalysisText = '';

    $: scenarioName = $scenarios.find(s => s.id === $selectedScenarioId)?.name || '';
    $: isCustomScenario = $selectedScenarioId === 'custom';
    $: effectiveInstructions = isCustomScenario ? $customInstructions : instructions;

    let video: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let captureBtn: HTMLButtonElement;
    let retakeBtn: HTMLButtonElement;
    let analyzeBtn: HTMLButtonElement;
    let loading: HTMLDivElement;
    let error: HTMLDivElement;
    let stream: MediaStream | null = null;

    let showDeleteHistoryConfirm = false;
    let showDeleteEntryConfirm = false;
    let entryToDelete: number | null = null;
    let showRevokeConsentConfirm = false;

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
        showRevokeConsentConfirm = true;
    }

    function confirmRevokeConsent() {
        $cameraConsent = false;
        clearAllStores();
        showRevokeConsentConfirm = false;
    }

    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: IMAGE_WIDTH },
                    height: { ideal: IMAGE_HEIGHT }
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
            displayError('Error accessing camera. Please ensure you have granted camera permissions.');
            captureBtn.disabled = true;
        }
    }

    function displayError(message: string) {
        error.innerHTML = message;
        error.style.display = 'block';
    }

    function hideError() {
        error.innerHTML = '';
        error.style.display = 'none';
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }

    interface AnalysisResultWithBlob extends AnalysisResult {
        blob: Blob;
    }

    async function analyzeImageInternal(curImageQuality: number): Promise<AnalysisResultWithBlob> {            
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), IMAGE_MIME_TYPE, curImageQuality);
        });
        console.log('blob size', blob.size);

        const formData = new FormData();
        formData.append('mimeType', IMAGE_MIME_TYPE);
        formData.append('file', blob, `image.${IMAGE_EXTENSION}`);
        formData.append('password', $password);
        formData.append('language', $language);
        formData.append('curImageQuality', curImageQuality.toString());
        formData.append('instructions', effectiveInstructions);
        const apiResponse = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (apiResponse.status === 401) {
            console.error('Access denied. Please check that you have entered the correct password.');
            displayError('Access denied. Please check that you have entered the correct password.');
            throw new Error('Access denied. Please check that you have entered the correct password.');
        }

        if (!apiResponse.ok) {
            throw new Error(`HTTP error! status: ${apiResponse.status} - ${await apiResponse.text()}`);
        }

        const result = await apiResponse.json() as AnalysisResult;
        return {
            ...result,
            blob: blob
        } as AnalysisResultWithBlob;
    }

    async function analyzeImage() {
        loading.style.display = 'block';
        hideError();
        try {
            let curImageQuality = IMAGE_QUALITY_MAX;
            do {
                try {
                    console.log('Analyzing image with quality', curImageQuality);
                    const data = await analyzeImageInternal(curImageQuality);
                    const noneEmptyContent = data.result_text || 'No additional information available'; 
                    // Store the analysis with the blob directly
                     lastBlobLocal = data.blob;
                     lastAnalysisText = data.result_text || '';
                    await analysisHistory.addEntry(data.blob, noneEmptyContent, curImageQuality);
                    break;
                } catch (err) {
                    if( (err as Error).message.includes('Maximum call stack size exceeded')) {
                        curImageQuality -= 0.1;
                        console.error('Error analyzing image (retrying with lower quality):', err);
                    } else {
                        throw err;
                    }
                }
            } while (curImageQuality >= 0.1);    
        } catch (err) {
            console.error('Error analyzing image:', err);
            displayError('Error analyzing image. Please try again. - ' + err);
        } finally {
            loading.style.display = 'none';
        }
    }

    function base64ToBlob(base64: string, mimeType: string): Blob {
        // Remove data URL prefix if present
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
        
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: mimeType });
        } catch (error) {
            console.error('Error converting base64 to blob:', error);
            throw new Error('Invalid base64 data');
        }
    }

    async function handleFollowupForEntry(timestamp: number) {
        const question = followupQuestions[timestamp];
        if (!question || question.trim() === '') {
            displayError('Please enter a followup question.');
            return;
        }
        const entry = $analysisHistory.find((e: any) => e.timestamp === timestamp);
        if (!entry) {
            displayError('Analysis entry not found.');
            return;
        }
        const blob = base64ToBlob(entry.imageData, IMAGE_MIME_TYPE);
        const formData = new FormData();
        formData.append('mimeType', IMAGE_MIME_TYPE);
        formData.append('file', blob, `image.${IMAGE_EXTENSION}`);
        formData.append('password', $password);
        formData.append('language', $language);
        formData.append('instructions', effectiveInstructions);
        formData.append('followup', question);
        formData.append('previousAnalysis', entry.analysisText);
        try {
            const apiResponse = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });
            if (!apiResponse.ok) {
                throw new Error(`HTTP error! status: ${apiResponse.status} - ${await apiResponse.text()}`);
            }
            const result = await apiResponse.json();
            if (!chatHistories[timestamp]) {
                chatHistories[timestamp] = [];
            }
            chatHistories[timestamp] = [...chatHistories[timestamp], { question, answer: result.result_text || '' }];
            followupQuestions[timestamp] = '';
        } catch (err) {
            console.error('Error asking followup for entry', timestamp, err);
            displayError('Error asking followup. Please try again.');
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
        loading.style.display = 'none';
        hideError();
        initCamera();
    }

    function handleDeleteHistory() {
        showDeleteHistoryConfirm = true;
    }

    function handleDeleteEntry(timestamp: number) {
        entryToDelete = timestamp;
        showDeleteEntryConfirm = true;
    }

    function confirmDeleteHistory() {
        analysisHistory.clear();
        showDeleteHistoryConfirm = false;
    }

    function confirmDeleteEntry() {
        if (entryToDelete !== null) {
            analysisHistory.deleteEntry(entryToDelete);
            entryToDelete = null;
        }
        showDeleteEntryConfirm = false;
    }
</script>

<!-- Rest of the file remains the same as in the previous submission -->
<div class="top-section">
    <p>Take a photo for {scenarioName}</p>
    <div class="password-input">
        Password: <input type="password" bind:value={$password} />
        <button on:click={revokeConsent} title="Revoke camera access and local storage consent" style="width: 24px; height: 24px; padding: 0; font-size: 12px;">&#x26A0;</button>
        Answer: <select bind:value={$language}>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
        </select>
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
        <canvas bind:this={canvas} id="canvas" aria-label="Captured photo"></canvas>
    </div>

    {#if isCustomScenario}
        <div class="custom-instructions">
            <strong>Custom Instructions</strong>
            <textarea
                bind:value={$customInstructions}
                placeholder="Enter your custom instructions for analyzing the image..."
                rows="2"
                style="width: 350px;"
            ></textarea>
        </div>
    {/if}

    <div>
        <button 
            bind:this={captureBtn} 
            id="captureBtn" 
            on:click={handleCapture}
            disabled
        >
            Take Photo and Analyze
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
    <div bind:this={error} id="error" class="error"></div>
</div>

<ConfirmDialog
    show={showRevokeConsentConfirm}
    title="Revoke Consent"
    message="Are you sure you want to revoke camera access and clear all local data? This action cannot be undone."
    onConfirm={confirmRevokeConsent}
    onCancel={() => showRevokeConsentConfirm = false}
/>

<ConfirmDialog
    show={showDeleteHistoryConfirm}
    title="Delete All History"
    message="Are you sure you want to delete all analysis history? This action cannot be undone."
    onConfirm={confirmDeleteHistory}
    onCancel={() => showDeleteHistoryConfirm = false}
/>

<ConfirmDialog
    show={showDeleteEntryConfirm}
    title="Delete Entry"
    message="Are you sure you want to delete this analysis entry? This action cannot be undone."
    onConfirm={confirmDeleteEntry}
    onCancel={() => {
        showDeleteEntryConfirm = false;
        entryToDelete = null;
    }}
/>

{#if $analysisHistory.length > 0}
<div class="history-section">
    <div class="history-header">
        <div class="history-title">History<span class="history-subtitle">(Stored in your browser)</span></div>
        <button class="clear-history" on:click={handleDeleteHistory}>Delete All</button>
    </div>
    
    {#each $analysisHistory as entry}
        <div class="result-entry">
            <div class="entry-header">
                <div class="timestamp">{new Date(entry.timestamp).toLocaleString()}{entry.curImageQuality ? " (Q=" + entry.curImageQuality + ")" : ''}</div>
                <button 
                    class="delete-entry" 
                    on:click={() => handleDeleteEntry(entry.timestamp)}
                    title="Delete this entry"
                >
                    Delete
                </button>
            </div>
            <div class="result-entry-image">
                <!-- svelte-ignore a11y_img_redundant_alt -->
                <img src={entry.imageData} alt="Analyzed image" />
            </div>
            <h3>Analysis Results:</h3>
            <div class="result-entry-content">
                {@html marked.parse(entry.analysisText)}
                <div class="followup-section" style="margin-top:8px;">
                    <input type="text" bind:value={followupQuestions[entry.timestamp]} placeholder="Enter followup question" style="width: 300px; padding: 8px; margin-right: 8px;" />
                    <button on:click={() => handleFollowupForEntry(entry.timestamp)} style="padding: 8px 12px;">Ask Followup</button>
                    {#if chatHistories[entry.timestamp]}
                        <div class="chat-history" style="margin-top: 8px; font-size: 0.9rem; border-top: 1px solid #ccc; padding-top: 8px;">
                            {#each chatHistories[entry.timestamp] as chat}
                                <div class="chat-message">
                                    <strong>Q:</strong> {chat.question}<br/>
                                    <strong>A:</strong> {@html marked.parse(chat.answer)}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>
{/if}

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

    .top-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .top-section p {
        margin: 0px;
    }

    .password-input input {
        width: 50px;
    }

    .camera-container {
        margin: 0px auto;
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

    .result-entry {
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

    .result-entry:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 24px -5px rgba(0, 0, 0, 0.12), 
                    0 6px 16px -5px rgba(0, 0, 0, 0.06);
    }

    .result-entry .result-entry-image {
        text-align: center;
        margin-bottom: 1rem;
    }

    .result-entry .result-entry-content {
        margin-top: 1rem;
    }

    .result-entry img {
        max-width: 320px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .result-entry .timestamp {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .history-section {
        margin-top: 2rem;
    }

    .clear-history {
        background-color: #ef4444;
    }

    .clear-history:hover {
        background-color: #dc2626;
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
        .result-entry:hover {
            transform: none;
        }
    }

    .custom-instructions {
        width: 100%;
        max-width: 500px;
        margin: 20px auto;
    }

    .custom-instructions textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-family: inherit;
        font-size: 1rem;
        line-height: 1.5;
        resize: vertical;
        transition: border-color 0.2s ease;
    }

    .custom-instructions textarea:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .delete-entry {
        background-color: #ef4444;
        padding: 4px 8px;
        font-size: 0.875rem;
    }

    .delete-entry:hover {
        background-color: #dc2626;
    }

    .history-header {
        padding: 0px 8px;
        border-radius: 16px;
        background-color: rgba(200, 200, 200, 0.5);
        text-align: left;
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08), 
                    0 4px 12px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }   

    .history-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary-color);
    }

    .history-subtitle {
        font-size: 0.666rem;
        color: #666;
        font-style: italic;
    }
</style>