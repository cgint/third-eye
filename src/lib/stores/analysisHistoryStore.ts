import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export interface AnalysisEntry {
    imageData: string; // base64 string
    analysisText: string;
    timestamp: number;
    curImageQuality: number | null;
}

interface AnalysisHistoryStore {
    subscribe: Writable<AnalysisEntry[]>['subscribe'];
    addEntry: (blob: Blob, analysisText: string, curImageQuality: number) => Promise<void>;
    deleteEntry: (timestamp: number) => void;
    clear: () => void;
}

let analysisHistoryStore: AnalysisHistoryStore | null = null;

export const getAnalysisHistory = () => {
    if (!analysisHistoryStore) {
        // Initialize from localStorage if available
        const initialValue: AnalysisEntry[] = browser 
            ? JSON.parse(localStorage.getItem('analysisHistory') || '[]')
            : [];

        const { subscribe, set, update } = writable<AnalysisEntry[]>(initialValue);

        analysisHistoryStore = {
            subscribe,
            addEntry: async (blob: Blob, analysisText: string, curImageQuality: number) => {
                // Convert blob to base64
                const base64String = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result as string;
                        resolve(base64);
                    };
                    reader.readAsDataURL(blob);
                });
                console.log('addEntry - blob - size', blob.size);
                console.log('addEntry - base64String - size', base64String.length);

                update(entries => {
                    const newEntries = [{
                        imageData: base64String,
                        analysisText,
                        timestamp: Date.now(),
                        curImageQuality: curImageQuality
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
    
    return analysisHistoryStore;
};

// Use in components:
// const analysisHistory = getAnalysisHistory();
// $analysisHistory 