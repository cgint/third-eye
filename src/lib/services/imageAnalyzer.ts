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

    async analyzeComparison(
        entries: { imageData: string; analysisText: string; }[],
        language: string,
        instructions: string
    ): Promise<AnalysisResult> {
        try {
            if (entries.length < 2) {
                throw new Error('At least two entries are required for comparison.');
            }

            // Construct parts for multi-modal input
            const parts: Part[] = [];
            let combinedPrompt = `${instructions}\n\n`;
            combinedPrompt += `Please compare the following products based on their images and provided previous analysis results. Provide a concise summary of key differences and similarities, especially focusing on nutritional information, allergens, and general healthiness if applicable. Ensure your answer is in ${this.getLanguagePrompt(language).replace('It is of highest importance for the user that you use the following language for your answer: ', '')}.\n\n`;

            entries.forEach((entry, index) => {
                const mimeType = entry.imageData.split(',')[0].split(':')[1].split(';')[0]; // Extract mimeType from data URL
                const data = entry.imageData.split(',')[1]; // Extract base64 data
                parts.push({ text: `Product ${index + 1} (Image ${index + 1}):\nPrevious Analysis: ${entry.analysisText}\n\n` });
                parts.push({ inlineData: { data: data, mimeType: mimeType } });
            });

            // Prepend the main prompt as the first part
            parts.unshift({ text: combinedPrompt });

            const result = await this.aiModel.generateContent(parts);
            const response = result.response;
            return await this.parseAiResponse(response.text());
        } catch (error) {
            if (error instanceof Error && error.message.includes('Failed to analyze image')) {
                throw error;
            }
            throw new Error(`Error analyzing comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
