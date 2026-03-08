import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';

function createLocalStorageMock(initial: Record<string, string> = {}) {
    let store: Record<string, string> = { ...initial };

    return {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
}

describe('scenarioStore default scenarios', () => {
    beforeEach(() => {
        vi.resetModules();
        (globalThis as any).localStorage = createLocalStorageMock();
    });

    afterEach(() => {
        delete (globalThis as any).localStorage;
    });

    it('includes the Text Extraction (OCR) scenario by default', async () => {
        vi.doMock('$app/environment', () => ({ browser: true }));

        const { getScenarioStores } = await import('../scenarioStore');

        const { scenarios } = getScenarioStores();
        const list = get(scenarios);

        const ocr = list.find((s) => s.id === 'text-extraction');
        expect(ocr).toBeTruthy();
        expect(ocr?.name).toBe('Text Extraction (OCR)');
        expect(ocr?.displayInManageView).toBe(true);
        expect(ocr?.isEditable).toBe(false);
        expect(ocr?.instructions).toContain('Output ONLY the extracted text');
    });
});
