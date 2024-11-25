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

    async analyze(imageDataBase64: Promise<ProcessedImage>, language: string): Promise<AnalysisResult> {
        try {
            const languagePrompt = language === 'de' ? 'German' : 'English';
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
            
            Start with a very short and easy to grasp table with two columns where the first names the allergen or ingredient
            and the second column contains very short information if the product contains the allergen or ingredient.
            Please be specific and concise in your response.
            People should get a good idea of what the product is about and if it might be suitable for them.
            
            It is of highes importance for the user that you use the following language for your answer: ${languagePrompt}
            `;
            
            const processedImage = await imageDataBase64;
            const parts: Part[] = [
                { text: prompt },
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
        } catch (error) {
            if (error instanceof Error && error.message.includes('Failed to analyze image')) {
                throw error;
            }
            throw new Error(`Error analyzing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
