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
        const formData = await request.formData();
        const file = formData.get('file');
        const password = formData.get('password');

        // Trim passwords to handle any whitespace issues
        const submittedPassword = password?.toString().trim();
        const expectedPassword = TALK_PASSWORD?.toString().trim();

        if (submittedPassword !== expectedPassword) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return new Response('Unauthorized', { status: 401 });
        }

        if (!file || !(file instanceof File)) {
            return new Response('No file uploaded', { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return new Response('API key not configured', { status: 500 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        try {
            const result = await imageAnalyzer.analyze(buffer.buffer);
            return json(result);
        } catch (error) {
            return new Response(
                error instanceof Error ? error.message : 'Error analyzing image',
                { status: 500 }
            );
        }
    } catch (err) {
        console.error('Request processing error:', err);
        return new Response(
            err instanceof Error ? err.message : 'Internal server error', 
            { status: 500 }
        );
    }
}
