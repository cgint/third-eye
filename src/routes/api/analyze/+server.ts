import { error, json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL_NAME, TALK_PASSWORD } from '$lib/constants';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

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
            // Return 401 directly instead of throwing error
            return new Response('Unauthorized', { status: 401 });
        }

        if (!file || !(file instanceof File)) {
            return new Response('No file uploaded', { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return new Response('API key not configured', { status: 500 });
        }

        // Convert the file to base64 for the Gemini API
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = Buffer.from(uint8Array).toString('base64');

        // Generate the prompt for analysis
        const prompt = `
            Analyze this product image and provide:
            1. First an most important: Information regarding allergens and ingredients that could cause allergic reactions
              a. gluten
              b. dairy
              c. nuts
              d. soy
              e. other
            2. Information regarding the product's nutritional value, including calories, protein, carbohydrates, and fat
            2. Any relevant product details
            
            Please be specific and concise in your response.
            Poeple should get a good idea of what the product is about and if it might be suitable for them.
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

        try {
            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();

            return json({
                result_text: text
            });
        } catch (apiError) {
            console.error('Gemini API error:', apiError);
            return new Response('Error calling Gemini API', { status: 500 });
        }
    } catch (err) {
        console.error('Request processing error:', err);
        return new Response(
            err instanceof Error ? err.message : 'Internal server error', 
            { status: 500 }
        );
    }
}
