import type { GenerativeModel, Part } from '@google/generative-ai';
import type { ProcessedImage, AnalysisResult } from '../models/analysis';

export class ImageAnalyzer {
    constructor(private aiModel: GenerativeModel) {}

    async parseAiResponse(responseText: string | null): Promise<AnalysisResult> {
        if (!responseText || responseText.trim() === '') {
            throw new Error('Failed to analyze image - no response text');
        }
        return { result_text: responseText };
    }

    getLanguagePrompt(language: string): string {
        const lang_to_answer = language === 'de' ? 'German' : 'English';
        return `It is of highest importance for the user that you use the following language for your answer: ${lang_to_answer}`;
    }

    async analyzeThis(imageDataBase64: Promise<ProcessedImage>, prompt: string, language: string): Promise<AnalysisResult> {
        const processedImage = await imageDataBase64;
        const parts: Part[] = [
            { text: prompt + '\n\n' + this.getLanguagePrompt(language) },
            {
                inlineData: {
                    data: processedImage.data,
                    mimeType: processedImage.mimeType
                }
            }
        ];
        const result = await this.aiModel.generateContent(parts);
        const response = result.response;
        return await this.parseAiResponse(response.text());
    }

    async analyze(imageDataBase64: Promise<ProcessedImage>, language: string, instructions: string): Promise<AnalysisResult> {
        try {
            const prompt = `${instructions}
            
            If appropriate also help with clarifying if the product name is in a different language or it might be unclear what the main ingredient or use/purpose of the product is.
            `;
            return await this.analyzeThis(imageDataBase64, prompt, language);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Failed to analyze image')) {
                throw error;
            }
            throw new Error(`Error analyzing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async analyzeFollowup(imageDataBase64: Promise<ProcessedImage>, previousAnalysis: string, followupQuestion: string, language: string, instructions: string): Promise<AnalysisResult> {
        try {
            const prompt = `${instructions}
            
Previous analysis: ${previousAnalysis}

Followup question: ${followupQuestion}

Please answer the followup question using the above information.`;
            return await this.analyzeThis(imageDataBase64, prompt, language);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Failed to analyze image')) {
                throw error;
            }
            throw new Error(`Error analyzing image followup: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
