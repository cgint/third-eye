import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export interface AnalysisEntry {
    imageData: string | string[]; // base64 string or array for comparison entries
    analysisText: string;
    timestamp: number;
    curImageQuality: number | null;
    chatHistory?: { question: string; answer: string }[];
}

interface AnalysisHistoryStore {
    subscribe: Writable<AnalysisEntry[]>['subscribe'];
    addEntry: (base64ImageData: string | string[], analysisText: string, curImageQuality: number | null) => void;
    deleteEntry: (timestamp: number) => void;
    clear: () => void;
    updateEntry: (entry: AnalysisEntry) => void;
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
            addEntry: (base64ImageData: string | string[], analysisText: string, curImageQuality: number | null) => {
                console.log('addEntry - base64ImageData - size', Array.isArray(base64ImageData) ? base64ImageData.length + ' images' : base64ImageData.length + ' bytes');

                update(entries => {
                    const newEntries = [{
                        imageData: base64ImageData,
                        analysisText,
                        timestamp: Date.now(),
                        curImageQuality: curImageQuality,
                        chatHistory: []
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
            },
            updateEntry: (entry: AnalysisEntry) => {
                update(entries => {
                    const newEntries = entries.map(e => e.timestamp === entry.timestamp ? entry : e);
                    if (browser) {
                        localStorage.setItem('analysisHistory', JSON.stringify(newEntries));
                    }
                    return newEntries;
                });
            }
        };
    }
    
    return analysisHistoryStore;
};

// Use in components:
// const analysisHistory = getAnalysisHistory();
// $analysisHistory