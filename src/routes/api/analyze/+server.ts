import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL_NAME, TALK_PASSWORD, remote_logger } from '$lib/constants';
import { ImageAnalyzer } from '$lib/services/imageAnalyzer';
import type { ProcessedImage } from '$lib/models/analysis';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
const imageAnalyzer = new ImageAnalyzer(model);

export async function POST({ request }: RequestEvent) {
    console.log('Request received');
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const mimeType = formData.get('mimeType') as string;
        const password = formData.get('password') as string;
        const language = formData.get('language') as string || 'de';
        const instructions = formData.get('instructions')?.toString() || '';

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
            const followup = formData.get('followup')?.toString();
            const previousAnalysis = formData.get('previousAnalysis')?.toString();
            let result;
            if (followup && previousAnalysis) {
                console.log('About to analyze followup question');
                result = await imageAnalyzer.analyzeFollowup(getStringFromFile(file, mimeType), previousAnalysis, followup, language, instructions);
            } else {
                result = await imageAnalyzer.analyze(getStringFromFile(file, mimeType), language, instructions);
            }
            console.log('Image analyzed');
            return json(result);
        } catch (error) {
            logError('Error analyzing image:', JSON.stringify(error));
            logStackTrace(error as Error);
            return new Response(
                error instanceof Error ? error.message : 'Error analyzing image',
                { status: 500 }
            );
        }
    } catch (err) {
        logError('Request processing error:', JSON.stringify(err));
        logStackTrace(err as Error);
        return new Response(
            err instanceof Error ? err.message : 'Internal server error',
            { status: 500 }
        );
    }
}

function logError(title: string, message: string) {
    const logMessage = message.slice(0, 1000);
    console.error(title, logMessage);
    remote_logger.log('error', logMessage);
}

function logStackTrace(error: Error) {
    const stackTrace = error.stack || 'No stack trace available';
    const logMessage = 'Stack trace: ' + stackTrace;
    console.error(logMessage);
    remote_logger.log('error', logMessage);
}

async function getStringFromFile(file: File, mimeType: string): Promise<ProcessedImage> {
    const buf: ArrayBuffer = await file.arrayBuffer();
    console.log('getStringFromFile - buf-size', buf.byteLength);
    const array = new Uint8Array(buf);
    const array_base64 = btoa(String.fromCharCode(...array))
    console.log('getStringFromFile - array_base64-size', array_base64.length);
    return {
        mimeType: mimeType,
        data: array_base64
    };
}