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
        let initialValue: AnalysisEntry[] = browser
            ? JSON.parse(localStorage.getItem('analysisHistory') || '[]')
            : [];

        // Validate and filter out corrupted entries
        if (browser && initialValue.length > 0) {
            const validEntries = initialValue.filter(entry => {
                // Validate imageData format
                if (Array.isArray(entry.imageData)) {
                    // For comparison entries, validate each image in the array
                    return entry.imageData.every(imageData => 
                        typeof imageData === 'string' && 
                        imageData.includes(',') && 
                        imageData.startsWith('data:')
                    );
                } else {
                    // For single entries, validate the imageData
                    return typeof entry.imageData === 'string' && 
                           entry.imageData.includes(',') && 
                           entry.imageData.startsWith('data:');
                }
            });

            // If we filtered out invalid entries, update localStorage
            if (validEntries.length !== initialValue.length) {
                console.log(`Filtered out ${initialValue.length - validEntries.length} corrupted analysis entries from localStorage`);
                localStorage.setItem('analysisHistory', JSON.stringify(validEntries));
                initialValue = validEntries;
            }
        }

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