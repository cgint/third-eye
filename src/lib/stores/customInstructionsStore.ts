import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

let instructionsStore: Writable<string> | null = null;

export const getCustomInstructions = () => {
    if (!instructionsStore) {
        const storedInstructions = browser ? localStorage.getItem('customInstructions') : null;
        instructionsStore = writable(storedInstructions || '');
        
        // Set up subscription only once when store is created
        instructionsStore.subscribe((value) => {
            if (browser) {
                if (value) {
                    localStorage.setItem('customInstructions', value);
                } else {
                    localStorage.removeItem('customInstructions');
                }
            }
        });
    }
    return instructionsStore;
};

// Use in components:
// const customInstructions = getCustomInstructions();
// $customInstructions 