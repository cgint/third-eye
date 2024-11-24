import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL_NAME } from '$lib/constants';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

export async function POST({ request }: RequestEvent) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            throw error(400, 'No file uploaded');
        }

        // Convert the file to base64 for the Gemini API
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = Buffer.from(uint8Array).toString('base64');

        // Generate the prompt for analysis
        const prompt = `
            Analyze this product image and provide:
            1. Comprehensive nutritional information
            2. Any relevant product details
            
            Please be specific and concise in your response.
        `;

        // Create parts array with text prompt and image
        const parts: Part[] = [
            { text: prompt },
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                }
            }
        ];

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        return json({
            result_text: text
        });
    } catch (err) {
        console.error('Error processing image:', err);
        throw error(500, {
            message: err instanceof Error ? err.message : 'Error processing image'
        });
    }
}
