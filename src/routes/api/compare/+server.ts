import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, GEMINI_MODEL_NAME, TALK_PASSWORD } from '$lib/constants';
import { ImageAnalyzer } from '$lib/services/imageAnalyzer';
import { logInfo, logError } from '$lib/logging/logFunctions';
import type { AnalysisEntry } from '$lib/stores/analysisHistoryStore';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
const imageAnalyzer = new ImageAnalyzer(model);

export async function POST({ request }: RequestEvent) {
    console.log('Comparison request received');
    try {
        const { entriesToCompare, password, language = 'de', instructions = '' } = await request.json();

        // Trim passwords to handle any whitespace issues
        const submittedPassword = password?.toString().trim();
        const expectedPassword = TALK_PASSWORD?.toString().trim();

        if (submittedPassword !== expectedPassword) {
            console.error('Incorrect password for comparison');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return new Response('Unauthorized', { status: 401 });
        }

        if (!entriesToCompare || !Array.isArray(entriesToCompare) || entriesToCompare.length < 2) {
            console.error('Insufficient entries for comparison');
            return new Response('At least two entries are required for comparison.', { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            console.error('API key not configured for comparison');
            return new Response('API key not configured', { status: 500 });
        }

        try {
            console.log(`About to analyze comparison for ${entriesToCompare.length} entries`);
            const result = await imageAnalyzer.analyzeComparison(entriesToCompare, language, instructions);
            await logInfo('Comparison analyzed successfully.', `Number of entries: ${entriesToCompare.length}`);
            return json(result);
        } catch (error) {
            await logError('Error analyzing comparison:', JSON.stringify(error));
            await logStackTrace(error as Error);
            return new Response(
                error instanceof Error ? error.message : 'Error analyzing comparison',
                { status: 500 }
            );
        }
    } catch (err) {
        await logError('Comparison request processing error:', JSON.stringify(err));
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
    await logError('Comparison Error:', logMessage);
} 