import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface AnalysisEntry {
    imageData: string; // base64 string
    analysisText: string;
    timestamp: number;
}

function createAnalysisHistoryStore() {
    // Initialize from localStorage if available
    const initialValue: AnalysisEntry[] = browser 
        ? JSON.parse(localStorage.getItem('analysisHistory') || '[]')
        : [];

    const { subscribe, set, update } = writable<AnalysisEntry[]>(initialValue);

    return {
        subscribe,
        addEntry: async (blob: Blob, analysisText: string) => {
            // Convert blob to base64
            const base64String = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    resolve(base64);
                };
                reader.readAsDataURL(blob);
            });

            update(entries => {
                const newEntries = [{
                    imageData: base64String,
                    analysisText,
                    timestamp: Date.now()
                }, ...entries];
                
                if (browser) {
                    localStorage.setItem('analysisHistory', JSON.stringify(newEntries));
                }
                return newEntries;
            });
        },
        deleteEntry: (timestamp: number) => {
            update(entries => {
                const newEntries = entries.filter(entry => entry.timestamp !== timestamp);
                if (browser) {
                    localStorage.setItem('analysisHistory', JSON.stringify(newEntries));
                }
                return newEntries;
            });
        },
        clear: () => {
            set([]);
            if (browser) {
                localStorage.removeItem('analysisHistory');
            }
        }
    };
}

export const analysisHistory = createAnalysisHistoryStore(); 