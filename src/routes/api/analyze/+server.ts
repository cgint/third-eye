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

        // Get ArrayBuffer directly from the file
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer obtained');
        try {
            const result = await imageAnalyzer.analyze(arrayBuffer);
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
