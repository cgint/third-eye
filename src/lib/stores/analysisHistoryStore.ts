import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface AnalysisEntry {
    imageUrl: string;
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
        addEntry: (imageUrl: string, analysisText: string) => {
            update(entries => {
                const newEntries = [{
                    imageUrl,
                    analysisText,
                    timestamp: Date.now()
                }, ...entries];
                
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