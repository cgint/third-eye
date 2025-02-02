import { vi } from 'vitest';

// Use vi.hoisted to ensure the mock is available during module initialization
const mockAnalyze = vi.hoisted(() => vi.fn().mockResolvedValue({
    result_text: "Mock analysis result for testing"
}));

// Mock modules before any other imports
vi.mock('$lib/services/imageAnalyzer', () => ({
    ImageAnalyzer: vi.fn().mockImplementation(() => ({
        analyze: mockAnalyze
    }))
}));

vi.mock('$lib/constants', async () => {
    const actual = await vi.importActual('$lib/constants');
    return {
        ...actual,
        GEMINI_API_KEY: 'mock-key'
    };
});

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../+server';
import { TALK_PASSWORD } from '$lib/constants';
import { createTestImage } from '../../../../lib/services/__tests__/test-helpers';

describe('POST /api/analyze', () => {
    let mockRequestBody: any;
    let mockRequest: Request;

    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();
        
        // Reset mock analyze function's default behavior
        mockAnalyze.mockResolvedValue({
            result_text: "Mock analysis result for testing"
        });
        
        // Create test image and convert to base64
        const imageBuffer = await createTestImage();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        mockRequestBody = {
            base64Image: `data:image/jpeg;base64,${base64Image}`,
            mimeType: 'image/jpeg',
            password: TALK_PASSWORD || '',
            language: 'en'
        };
        
        mockRequest = new Request('http://localhost/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockRequestBody)
        });
    });

    it('should successfully analyze image with valid password', async () => {
        const response = await POST({ request: mockRequest } as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            result_text: "Mock analysis result for testing"
        });
    });

    it('should return 401 for invalid password', async () => {
        mockRequestBody.password = 'wrong-password';
        mockRequest = new Request('http://localhost/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockRequestBody)
        });

        const response = await POST({ request: mockRequest } as any);
        expect(response.status).toBe(401);
    });

    it('should return 400 when no image is provided', async () => {
        mockRequestBody.base64Image = undefined;
        mockRequest = new Request('http://localhost/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockRequestBody)
        });

        const response = await POST({ request: mockRequest } as any);
        expect(response.status).toBe(400);
    });

    it('should handle analysis errors', async () => {
        // Make the mock analyze function reject
        mockAnalyze.mockRejectedValueOnce(new Error('Analysis failed'));

        const response = await POST({ request: mockRequest } as any);
        expect(response.status).toBe(500);
        const text = await response.text();
        expect(text).toBe('Analysis failed');
    });
});
