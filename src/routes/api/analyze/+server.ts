import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL_NAME, TALK_PASSWORD } from '$lib/constants';
import { ImageAnalyzer } from '$lib/services/imageAnalyzer';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
const imageAnalyzer = new ImageAnalyzer(model);

export async function POST({ request }: RequestEvent) {
    try {
        console.log('Request received');
        const formData = await request.formData();
        const file = formData.get('file');
        const password = formData.get('password');

        // Trim passwords to handle any whitespace issues
        const submittedPassword = password?.toString().trim();
        const expectedPassword = TALK_PASSWORD?.toString().trim();

        if (submittedPassword !== expectedPassword) {
            console.error('Incorrect password');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return new Response('Unauthorized', { status: 401 });
        }

        if (!file || !(file instanceof File)) {
            console.error('No file uploaded');
            return new Response('No file uploaded', { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            console.error('API key not configured');
            return new Response('API key not configured', { status: 500 });
        }

        try {
            console.log('About to analyze image');
            const result = await imageAnalyzer.analyze(readFileAsBase64(file));
            console.log('Image analyzed');
            return json(result);
        } catch (error) {
            console.error('Error analyzing image:', error);
            const stackTrace = error instanceof Error ? error.stack : 'No stack trace available';
            console.error('Stack trace:', stackTrace);
            return new Response(
                error instanceof Error ? error.message : 'Error analyzing image',
                { status: 500 }
            );
        }
    } catch (err) {
        console.error('Request processing error:', err);
        const stackTrace = err instanceof Error ? err.stack : 'No stack trace available';
        console.error('Stack trace:', stackTrace);
        return new Response(
            err instanceof Error ? err.message : 'Internal server error',
            { status: 500 }
        );
    }
}

async function readFileAsBase64(file: File): Promise<string> {
    // Use a stream reader to process the file in chunks
    // We can not use Buffer on Cloudflare
    // Memory efficiency
    let result = '';
    const reader = file.stream().getReader();
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Convert chunk to base64 directly
            const chunk = new Uint8Array(value);
            const binary = String.fromCharCode(...chunk);
            result += btoa(binary);
        }
        return result;
    } finally {
        reader.releaseLock();
    }
}