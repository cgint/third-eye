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
    let mockFormData: FormData;
    let mockRequest: Request;

    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();
        
        // Reset mock analyze function's default behavior
        mockAnalyze.mockResolvedValue({
            result_text: "Mock analysis result for testing"
        });
        
        // Create test image and form data
        const imageBuffer = await createTestImage();
        const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const imageFile = new File([imageBlob], 'test.jpg', { type: 'image/jpeg' });
        
        mockFormData = new FormData();
        mockFormData.append('file', imageFile);
        mockFormData.append('password', TALK_PASSWORD || '');
        
        mockRequest = new Request('http://localhost/api/analyze', {
            method: 'POST',
            body: mockFormData
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
        mockFormData.set('password', 'wrong-password');
        mockRequest = new Request('http://localhost/api/analyze', {
            method: 'POST',
            body: mockFormData
        });

        const response = await POST({ request: mockRequest } as any);
        expect(response.status).toBe(401);
    });

    it('should return 400 when no file is uploaded', async () => {
        mockFormData.delete('file');
        mockRequest = new Request('http://localhost/api/analyze', {
            method: 'POST',
            body: mockFormData
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
