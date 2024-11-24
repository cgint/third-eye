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
        it('should parse valid AI response', () => {
            const result = analyzer.parseAiResponse("Test result");
            expect(result).toEqual({ result_text: "Test result" });
        });

        it('should handle null response', () => {
            expect(() => analyzer.parseAiResponse(null))
                .toThrow('Failed to analyze image - no response text');
        });

        it('should handle empty response', () => {
            expect(() => analyzer.parseAiResponse(""))
                .toThrow('Failed to analyze image - no response text');
        });

        it('should handle whitespace-only response', () => {
            expect(() => analyzer.parseAiResponse("   "))
                .toThrow('Failed to analyze image - no response text');
        });
    });

    describe('analyze', () => {
        it('should successfully analyze image', async () => {
            const testImage = await createTestImage();
            const result = await analyzer.analyze(testImage);
            
            expect(result).toBeDefined();
            expect(result.result_text).toBe("Mock analysis result for testing");
        });

        it('should handle analysis errors', async () => {
            mockAiModel = new MockAIModel("");
            analyzer = new ImageAnalyzer(mockAiModel as any);
            
            const testImage = await createTestImage();
            await expect(analyzer.analyze(testImage))
                .rejects.toThrow('Failed to analyze image - no response text');
        });

        it('should handle AI model errors', async () => {
            mockAiModel = new MockAIModel();
            mockAiModel.generateContent = async () => { throw new Error('AI model error'); };
            analyzer = new ImageAnalyzer(mockAiModel as any);
            
            const testImage = await createTestImage();
            await expect(analyzer.analyze(testImage))
                .rejects.toThrow('Error analyzing image');
        });
    });
});
