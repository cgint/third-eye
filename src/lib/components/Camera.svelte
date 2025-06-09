<script lang="ts">
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { getPasswordStore } from '$lib/stores/passwordStore';
    import { getLanguageStore } from '$lib/stores/languageStore';
    import { getCameraConsent } from '$lib/stores/consentStore';
    import { IMAGE_MIME_TYPE, IMAGE_EXTENSION, IMAGE_QUALITY_MAX, IMAGE_WIDTH, IMAGE_HEIGHT } from '$lib/constants';
    import { getScenarioStores } from '$lib/stores/scenarioStore';
    import { getCustomInstructions } from '$lib/stores/customInstructionsStore';
    import { getAnalysisHistory, type AnalysisEntry } from '$lib/stores/analysisHistoryStore';
    import { clearAllStores } from '$lib/stores/allStoresRemover';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import CompareDialog from './CompareDialog.svelte';
    import type { AnalysisResult } from '$lib/models/analysis';
    
    let { instructions } = $props();

    const password = getPasswordStore();
    const language = getLanguageStore();
    const cameraConsent = getCameraConsent();
    const { scenarios, selectedScenarioId } = getScenarioStores();
    const customInstructions = getCustomInstructions();
    const analysisHistory = getAnalysisHistory();
    let followupQuestions: Record<number, string> = $state({});
    let isFollowupLoading: Record<number, boolean> = $state({});

    const scenarioName = $derived($scenarios.find(s => s.id === $selectedScenarioId)?.name || '');
    const isCustomScenario = $derived($selectedScenarioId === 'custom');
    const effectiveInstructions = $derived(isCustomScenario ? $customInstructions : instructions);

    let video: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let captureBtn: HTMLButtonElement;
    let retakeBtn: HTMLButtonElement;
    let analyzeBtn: HTMLButtonElement;
    let loading: HTMLDivElement;
    let error: HTMLDivElement;
    let stream: MediaStream | null = null;

    // Camera selection state
    let availableCameras: MediaDeviceInfo[] = $state([]);
    let selectedCameraId: string = $state('');
    let isMobile: boolean = $state(false);

    let showDeleteHistoryConfirm = $state(false);
    let showDeleteEntryConfirm = $state(false);
    let entryToDelete: number | null = $state(null);
    let showRevokeConsentConfirm = $state(false);
    let showCompareDialog = $state(false);

    // Configure marked to allow HTML in markdown
    marked.setOptions({
        breaks: true
    });

    onMount(() => {
        isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

    async function enumerateCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            availableCameras = devices.filter(device => device.kind === 'videoinput');
            
            // Auto-select preference: avoid OBS if Mac camera available, otherwise use first available
            const macCamera = availableCameras.find(cam => 
                cam.label.includes('FaceTime') || cam.label.includes('Built-in')
            );
            
            if (!selectedCameraId) {
                selectedCameraId = macCamera?.deviceId || availableCameras[0]?.deviceId || '';
            }
        } catch (err) {
            console.error('Error enumerating cameras:', err);
        }
    }

    async function switchCamera(newCameraId: string) {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            selectedCameraId = newCameraId;
            await initCameraWithDevice();
        } catch (err) {
            console.error('Error switching camera:', err);
            displayError('Error switching camera. Please try again.');
        }
    }

    function toggleMobileCamera() {
        if (availableCameras.length <= 1) return;
        
        const currentIndex = availableCameras.findIndex(cam => cam.deviceId === selectedCameraId);
        const nextIndex = (currentIndex + 1) % availableCameras.length;
        switchCamera(availableCameras[nextIndex].deviceId);
    }

    async function initCamera() {
        try {
            // First enumerate cameras to get permissions and device list
            await enumerateCameras();
            await initCameraWithDevice();
        } catch (err) {
            console.error('Error initializing camera:', err);
            displayError('Error accessing camera. Please ensure you have granted camera permissions.');
            captureBtn.disabled = true;
        }
    }

    async function initCameraWithDevice() {
        try {
            const constraints = selectedCameraId ? {
                video: {
                    deviceId: { exact: selectedCameraId },
                    width: { ideal: IMAGE_WIDTH },
                    height: { ideal: IMAGE_HEIGHT }
                }
            } : {
                video: {
                    facingMode: 'environment', // fallback
                    width: { ideal: IMAGE_WIDTH },
                    height: { ideal: IMAGE_HEIGHT }
                }
            };

            stream = await navigator.mediaDevices.getUserMedia(constraints);
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

    async function analyzeImageInternal(curImageQuality: number): Promise<AnalysisResult & { base64ImageData: string }> {
        const base64ImageData = canvas.toDataURL(IMAGE_MIME_TYPE, curImageQuality);
        
        const apiResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                base64Image: base64ImageData,
                mimeType: IMAGE_MIME_TYPE,
                password: $password,
                language: $language,
                curImageQuality: curImageQuality,
                instructions: effectiveInstructions
            })
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
            base64ImageData
        };
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
                    await analysisHistory.addEntry(data.base64ImageData, noneEmptyContent, curImageQuality);
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
        try {
            isFollowupLoading[timestamp] = true;
            const apiResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base64Image: entry.imageData,
                    mimeType: IMAGE_MIME_TYPE,
                    password: $password,
                    language: $language,
                    instructions: effectiveInstructions,
                    followup: question,
                    previousAnalysis: entry.analysisText
                })
            });
            if (!apiResponse.ok) {
                throw new Error(`HTTP error! status: ${apiResponse.status} - ${await apiResponse.text()}`);
            }
            const result = await apiResponse.json();
            const updatedEntry = { ...entry, chatHistory: [...(entry.chatHistory || []), { question, answer: result.result_text || '' }] };
            analysisHistory.updateEntry(updatedEntry);
            followupQuestions[timestamp] = '';
        } catch (err) {
            console.error('Error asking followup for entry', timestamp, err);
            displayError('Error asking followup. Please try again.');
        } finally {
            isFollowupLoading[timestamp] = false;
        }
    }

    async function handleComparisonConfirmed(entriesToCompare: AnalysisEntry[]) {
        if (entriesToCompare.length < 2) {
            displayError('Please select at least two entries for comparison.');
            return;
        }

        loading.style.display = 'block';
        hideError();
        showCompareDialog = false;
        
        try {
            const apiResponse = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    entriesToCompare, 
                    password: $password, 
                    language: $language, 
                    instructions: effectiveInstructions 
                })
            });
            
            if (!apiResponse.ok) {
                throw new Error(`HTTP error! status: ${apiResponse.status} - ${await apiResponse.text()}`);
            }
            
            const result = await apiResponse.json() as AnalysisResult;
            
            // Add comparison result to history with copies of all compared images
            const comparedImages: string[] = [];
            entriesToCompare.forEach(entry => {
                if (Array.isArray(entry.imageData)) {
                    comparedImages.push(...entry.imageData);
                } else {
                    comparedImages.push(entry.imageData);
                }
            });
            await analysisHistory.addEntry(
                comparedImages, // Array of all images from compared entries
                'Comparison: ' + result.result_text, 
                null
            );
        } catch (err) { 
            displayError('Error comparing images: ' + err); 
            console.error(err); 
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

    function markedParseSimplify(plainText: string): string {
        const parsed = (marked.parse(plainText) as string).trim();
        console.log('markedParseSimplify - parsed', parsed);
        if (parsed.startsWith('<p>') && parsed.endsWith('</p>')) {
            return parsed.slice(3, -4);
        }
        return parsed;
    }
</script>

<!-- Rest of the file remains the same as in the previous submission -->
<div class="top-section">
    <p>Take a photo for {scenarioName}</p>
    <div class="password-input">
        <label for="password-input">Password:</label>
        <input type="password" id="password-input" bind:value={$password} />
        <button onclick={revokeConsent} title="Revoke camera access and local storage consent" style="width: 24px; height: 24px; padding: 0; font-size: 12px;">&#x26A0;</button>
        <label for="language-select">Answer language:</label>
        <select id="language-select" bind:value={$language}>
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
        
        <!-- Camera controls overlay -->
        {#if availableCameras.length > 1}
            {#if isMobile}
                <button 
                    class="camera-toggle-mobile"
                    onclick={toggleMobileCamera}
                    title="Switch camera"
                    aria-label="Switch between front and back camera"
                >
                    🔄
                </button>
            {:else}
                <div class="camera-selector-desktop">
                    <select 
                        bind:value={selectedCameraId}
                        onchange={() => switchCamera(selectedCameraId)}
                        title="Select camera source"
                        aria-label="Select camera source"
                    >
                        {#each availableCameras as camera}
                            <option value={camera.deviceId}>
                                {camera.label || `Camera ${camera.deviceId.slice(0,8)}`}
                            </option>
                        {/each}
                    </select>
                </div>
            {/if}
        {/if}
    </div>

    {#if isCustomScenario}
        <div class="custom-instructions">
            <label for="custom-instructions-textarea"><strong>Custom Instructions</strong></label>
            <textarea
                id="custom-instructions-textarea"
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
            onclick={handleCapture}
            disabled
        >
            Take Photo and Analyze
        </button>
        <button 
            bind:this={retakeBtn} 
            id="retakeBtn" 
            onclick={handleRetake}
            style="display: none;"
        >
            Retake Photo
        </button>
        <button
            bind:this={analyzeBtn}
            id="analyzeBtn"
            onclick={analyzeImage}
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
    confirm={confirmRevokeConsent}
    cancel={() => showRevokeConsentConfirm = false}
/>

<ConfirmDialog
    show={showDeleteHistoryConfirm}
    title="Delete All History"
    message="Are you sure you want to delete all analysis history? This action cannot be undone."
    confirm={confirmDeleteHistory}
    cancel={() => showDeleteHistoryConfirm = false}
/>

<ConfirmDialog
    show={showDeleteEntryConfirm}
    title="Delete Entry"
    message="Are you sure you want to delete this analysis entry? This action cannot be undone."
    confirm={confirmDeleteEntry}
    cancel={() => {
        showDeleteEntryConfirm = false;
        entryToDelete = null;
    }}
/>

<CompareDialog
    show={showCompareDialog}
    historyEntries={$analysisHistory.filter(entry => !Array.isArray(entry.imageData))}
    confirm={handleComparisonConfirmed}
    cancel={() => showCompareDialog = false}
/>

{#if $analysisHistory.length > 0}
<div class="history-section">
    <div class="history-header">
        <div class="history-title">History<span class="history-subtitle">(Stored in your browser)</span></div>
        <div class="history-buttons">
            {#if $analysisHistory.filter(entry => !Array.isArray(entry.imageData)).length >= 2}
            <button
                onclick={() => showCompareDialog = true}
                title="Compare selected analysis entries"
                class="compare-btn"
            >
                Compare
            </button>
            {/if}
            <button class="clear-history" onclick={handleDeleteHistory}>Delete All</button>
        </div>
    </div>
    
    {#each $analysisHistory as entry}
        <div class="result-entry" class:comparison-entry={Array.isArray(entry.imageData)}>
            <div class="entry-header">
                <div class="timestamp">
                    {#if Array.isArray(entry.imageData)}
                        <span class="entry-type-badge">Comparison</span>
                    {/if}
                    {new Date(entry.timestamp).toLocaleString()}{entry.curImageQuality ? " (Q=" + entry.curImageQuality + ")" : ''}
                </div>
                <button 
                    class="delete-entry" 
                    onclick={() => handleDeleteEntry(entry.timestamp)}
                    title="Delete this entry"
                >
                    Delete
                </button>
            </div>
            <div class="result-entry-image">
                {#if Array.isArray(entry.imageData)}
                    <!-- Multiple images for comparison entries -->
                    <div class="comparison-images">
                        {#each entry.imageData as imageData, index}
                            <img src={imageData} alt="Comparison image {index + 1}" class="comparison-img" width="160" height="120" />
                        {/each}
                    </div>
                {:else}
                    <!-- Single image for regular entries -->
                    <img src={entry.imageData} alt="This is the analyzed source" width="320" height="240" />
                {/if}
            </div>
            <h2>Analysis Results:</h2>
            <div class="result-entry-content">
                {@html markedParseSimplify(entry.analysisText)}
                <div class="followup-section">
                    <div class="followup-input">
                        <label for="followup-{entry.timestamp}" class="sr-only">Follow-up question for analysis entry</label>
                        <input type="text" id="followup-{entry.timestamp}" bind:value={followupQuestions[entry.timestamp]} placeholder="Enter followup question" 
                            onkeydown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFollowupForEntry(entry.timestamp);
                                }
                            }}
                        />
                        {#if isFollowupLoading[entry.timestamp]}
                            <div class="loading" style="display: inline-block; margin: 0;">Answering</div>
                        {:else}
                            <button onclick={() => handleFollowupForEntry(entry.timestamp)}>Ask Followup</button>
                        {/if}
                    </div>
                    {#if entry.chatHistory && entry.chatHistory.length > 0}
                        <div class="followup-history">
                            {#each entry.chatHistory as chat}
                                <div class="chat-message">
                                    <strong>Q:</strong> {chat.question}<br/>
                                    <strong>A:</strong> {@html markedParseSimplify(chat.answer)}
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
    .followup-section {
        margin-top: 8px;
    }

    .followup-input {
        display: flex;
        align-items: center;
        height: 46px;
    }

    .followup-input input {
        width: 60%;
        padding: 8px;
        margin-right: 8px;
    }

    .followup-input button {
        padding: 8px 12px;
    }

    .followup-history {
        margin-top: 8px;
        font-size: 0.9rem;
        border-top: 1px solid #ccc;
        padding-top: 8px;
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

    .result-entry.comparison-entry {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-left: 4px solid #0ea5e9;
        border-color: #0ea5e9;
    }

    .result-entry.comparison-entry:hover {
        box-shadow: 0 14px 24px -5px rgba(14, 165, 233, 0.15), 
                    0 6px 16px -5px rgba(14, 165, 233, 0.08);
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
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .entry-type-badge {
        background-color: #0ea5e9;
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .history-section {
        margin-top: 2rem;
    }

    .clear-history {
        background-color: #dc2626;
    }

    .clear-history:hover {
        background-color: #b91c1c;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
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
        background-color: #dc2626;
        padding: 4px 8px;
        font-size: 0.875rem;
    }

    .delete-entry:hover {
        background-color: #b91c1c;
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

    .history-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .compare-btn {
        background-color: var(--primary-color);
        color: white;
        font-size: 0.9rem;
        padding: 6px 12px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .compare-btn:hover {
        background-color: var(--primary-hover);
    }

    .comparison-images {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        max-width: 320px;
        margin: 0 auto;
    }

    .comparison-img {
        width: 100%;
        height: auto;
        max-height: 150px;
        object-fit: contain;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    /* Camera selection controls */
    .camera-toggle-mobile {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(4px);
        z-index: 10;
    }

    .camera-toggle-mobile:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: scale(1.05);
    }

    .camera-selector-desktop {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 10;
    }

    .camera-selector-desktop select {
        font-size: 11px;
        padding: 4px 6px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        backdrop-filter: blur(4px);
        max-width: 140px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .camera-selector-desktop select:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    .camera-selector-desktop select option {
        background: #333;
        color: white;
        padding: 4px;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
        .camera-selector-desktop select {
            max-width: 120px;
            font-size: 10px;
        }
    }
</style>