import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL_NAME, TALK_PASSWORD, remote_logger } from '$lib/constants';
import { ImageAnalyzer } from '$lib/services/imageAnalyzer';
import type { ProcessedImage } from '$lib/models/analysis';
import { logInfo, logError } from '$lib/logging/logFunctions';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
const imageAnalyzer = new ImageAnalyzer(model);

export async function POST({ request }: RequestEvent) {
    console.log('Request received');
    try {
        const { base64Image, mimeType, password, language = 'de', instructions = '', followup, previousAnalysis } = await request.json();

        // Trim passwords to handle any whitespace issues
        const submittedPassword = password?.toString().trim();
        const expectedPassword = TALK_PASSWORD?.toString().trim();

        if (submittedPassword !== expectedPassword) {
            console.error('Incorrect password');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return new Response('Unauthorized', { status: 401 });
        }

        if (!base64Image) {
            console.error('No image uploaded');
            return new Response('No image uploaded', { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            console.error('API key not configured');
            return new Response('API key not configured', { status: 500 });
        }

        try {
            console.log('About to analyze image');
            let result;
            const processedImage: ProcessedImage = {
                mimeType: mimeType,
                data: base64Image.split(',')[1] || base64Image // Remove data URL prefix if present
            };

            console.log('base64Image data size', processedImage.data.length);

            if (followup && previousAnalysis) {
                console.log('About to analyze followup question');
                result = await imageAnalyzer.analyzeFollowup(Promise.resolve(processedImage), previousAnalysis, followup, language, instructions);
            } else {
                result = await imageAnalyzer.analyze(Promise.resolve(processedImage), language, instructions);
            }
            await logInfo('Image analyzed successfully.', 'Followup: ' + Boolean(followup) + ' Size: ' + processedImage.data.length + ' bytes');
            return json(result);
        } catch (error) {
            await logError('Error analyzing image:', JSON.stringify(error));
            await logStackTrace(error as Error);
            return new Response(
                error instanceof Error ? error.message : 'Error analyzing image',
                { status: 500 }
            );
        }
    } catch (err) {
        await logError('Request processing error:', JSON.stringify(err));
        await logStackTrace(err as Error);
        return new Response(
            err instanceof Error ? err.message : 'Internal server error',
            { status: 500 }
        );
    }
}

async function logStackTrace(error: Error) {
    const stackTrace = error.stack || 'No stack trace available';
    const logMessage = 'Stack trace: ' + stackTrace;
    await logError('Error analyzing image:', logMessage);
}
