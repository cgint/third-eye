import type { GenerativeModel, Part } from '@google/generative-ai';
import type { ProcessedImage, AnalysisResult } from '../models/analysis';

export class ImageAnalyzer {
    constructor(private aiModel: GenerativeModel) {}
    
    async processImage(imageData: ArrayBufferLike): Promise<ProcessedImage> {
        return {
            mimeType: 'image/jpeg',
            data: new Uint8Array(imageData)
        };
    }

    parseAiResponse(responseText: string | null): AnalysisResult {
        if (!responseText || responseText.trim() === '') {
            throw new Error('Failed to analyze image - no response text');
        }
        return { result_text: responseText };
    }

    async analyze(imageData: ArrayBufferLike): Promise<AnalysisResult> {
        try {
            const processedImage = await this.processImage(imageData);
            
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
                People should get a good idea of what the product is about and if it might be suitable for them.
            `;

            const parts: Part[] = [
                { text: prompt },
                {
                    inlineData: {
                        data: btoa(String.fromCharCode(...processedImage.data)),
                        mimeType: processedImage.mimeType
                    }
                }
            ];

            const result = await this.aiModel.generateContent(parts);
            const response = await result.response;
            return this.parseAiResponse(response.text());
        } catch (error) {
            if (error instanceof Error && error.message.includes('Failed to analyze image')) {
                throw error;
            }
            throw new Error(`Error analyzing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
