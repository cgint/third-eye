const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const result = document.getElementById('result');
const loading = document.getElementById('loading');
let stream = null;

// Initially disable the capture button
captureBtn.disabled = true;

// Configure marked to allow HTML in markdown
marked.setOptions({
    sanitize: false,
    breaks: true
});

async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = stream;
        video.style.display = 'block';
        canvas.style.display = 'none';
        
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

captureBtn.addEventListener('click', async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    stopCamera();
    video.style.display = 'none';
    canvas.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline';
    loading.style.display = 'block';

    try {
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });

        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');

        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Convert markdown to HTML using marked.js
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
});

retakeBtn.addEventListener('click', () => {
    // Disable capture button initially
    captureBtn.disabled = true;
    canvas.style.display = 'none';
    captureBtn.style.display = 'inline';
    retakeBtn.style.display = 'none';
    result.innerHTML = '';
    initCamera();
});

// Initialize camera on page load
initCamera();