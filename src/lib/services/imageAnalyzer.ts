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
        entries: { imageData: string | string[]; analysisText: string; }[],
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
            combinedPrompt += `Please compare the following based on their images and provided previous analysis results. Provide a concise summary of key differences and similarities. Use a table comparison format if applicable. ${this.getLanguagePrompt(language)}.\n\n`;

            entries.forEach((entry, index) => {
                // Handle both single string and array of strings for imageData
                const imageDataArray = Array.isArray(entry.imageData) ? entry.imageData : [entry.imageData];
                
                imageDataArray.forEach((imageData, imageIndex) => {
                    // Enhanced validation with better error messages
                    if (!imageData) {
                        throw new Error(`Entry ${index + 1}, image ${imageIndex + 1}: imageData is null or undefined`);
                    }
                    
                    if (typeof imageData !== 'string') {
                        throw new Error(`Entry ${index + 1}, image ${imageIndex + 1}: imageData must be a string, got ${typeof imageData}`);
                    }
                    
                    if (!imageData.includes(',')) {
                        throw new Error(`Entry ${index + 1}, image ${imageIndex + 1}: imageData does not contain comma separator. Expected data URL format like 'data:image/jpeg;base64,<data>'. Got: ${imageData.substring(0, 100)}...`);
                    }
                    
                    // Try to extract MIME type and data safely
                    const imageParts = imageData.split(',');
                    if (imageParts.length !== 2) {
                        throw new Error(`Entry ${index + 1}, image ${imageIndex + 1}: imageData should have exactly one comma separator. Found ${imageParts.length - 1} commas`);
                    }
                    
                    const dataPart = imageParts[0];
                    const base64Data = imageParts[1];
                    
                    if (!dataPart.includes(':') || !dataPart.includes(';')) {
                        throw new Error(`Entry ${index + 1}, image ${imageIndex + 1}: invalid data URL header format. Expected 'data:mime/type;base64' but got: ${dataPart}`);
                    }
                    
                    if (!base64Data || base64Data.length === 0) {
                        throw new Error(`Entry ${index + 1}, image ${imageIndex + 1}: base64 data part is empty`);
                    }
                    
                    const mimeType = dataPart.split(':')[1].split(';')[0]; // Extract mimeType from data URL
                    
                    const imageLabel = imageDataArray.length > 1 
                        ? `Product ${index + 1} (Image ${imageIndex + 1})` 
                        : `Product ${index + 1}`;
                    
                    parts.push({ text: `${imageLabel}:\nPrevious Analysis: ${entry.analysisText}\n\n` });
                    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                });
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
