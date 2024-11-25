import { describe, it, expect, beforeEach } from 'vitest';
import { ImageAnalyzer } from '../imageAnalyzer';
import { MockAIModel, createTestImage } from './test-helpers';

describe('ImageAnalyzer', () => {
    let mockAiModel: MockAIModel;
    let analyzer: ImageAnalyzer;

    beforeEach(() => {
        mockAiModel = new MockAIModel();
        analyzer = new ImageAnalyzer(mockAiModel as any);
    });

    describe('AnalysisResult', () => {
        it('should parse valid AI response', async () => {
            const result = await analyzer.parseAiResponse("Test result");
            expect(result).toEqual({ result_text: "Test result" });
        });

        it('should handle null response', async () => {
            await expect(analyzer.parseAiResponse(null))
                .rejects.toThrow('Failed to analyze image - no response text');
        });

        it('should handle empty response', async () => {
            await expect(analyzer.parseAiResponse(""))
                .rejects.toThrow('Failed to analyze image - no response text');
        });

        it('should handle whitespace-only response', async () => {
            await expect(analyzer.parseAiResponse("   "))
                .rejects.toThrow('Failed to analyze image - no response text');
        });
    });

    describe('analyze', () => {
        it('should analyze an image successfully', async () => {
            mockAiModel = new MockAIModel('Mock analysis result for testing');
            analyzer = new ImageAnalyzer(mockAiModel as any);
            const testImage = await createTestImage();
            const result = await analyzer.analyze(
                Promise.resolve(Buffer.from(testImage).toString('base64'))
            );
            expect(result.result_text).toBe('Mock analysis result for testing');
        });

        it('should throw error when AI response is empty', async () => {
            mockAiModel = new MockAIModel('');  // Empty response
            analyzer = new ImageAnalyzer(mockAiModel as any);
            const testImage = await createTestImage();
            await expect(analyzer.analyze(
                Promise.resolve(Buffer.from(testImage).toString('base64'))
            ))
                .rejects.toThrow('Failed to analyze image - no response text');
        });

        it('should handle AI model errors', async () => {
            mockAiModel = new MockAIModel();
            mockAiModel.generateContent = async () => {
                throw new Error('Error analyzing image');
            };
            analyzer = new ImageAnalyzer(mockAiModel as any);
            const testImage = await createTestImage();
            await expect(analyzer.analyze(
                Promise.resolve(Buffer.from(testImage).toString('base64'))
            ))
                .rejects.toThrow('Error analyzing image');
        });
    });
});
