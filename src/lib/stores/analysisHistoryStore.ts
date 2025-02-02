import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export interface AnalysisEntry {
    imageData: string; // base64 string
    analysisText: string;
    timestamp: number;
    curImageQuality: number | null;
    chatHistory?: { question: string; answer: string }[];
}

interface AnalysisHistoryStore {
    subscribe: Writable<AnalysisEntry[]>['subscribe'];
    addEntry: (base64ImageData: string, analysisText: string, curImageQuality: number) => void;
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
            addEntry: (base64ImageData: string, analysisText: string, curImageQuality: number) => {
                console.log('addEntry - base64ImageData - size', base64ImageData.length);

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