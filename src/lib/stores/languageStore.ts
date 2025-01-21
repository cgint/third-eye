import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

let languageStore: Writable<string> | null = null;

export const getLanguageStore = () => {
    if (!languageStore) {
        const storedLanguage = browser ? localStorage.getItem('siteLanguage') : null;
        languageStore = writable(storedLanguage || 'en');
        
        // Set up subscription only once when store is created
        languageStore.subscribe((value) => {
            if (browser) {
                localStorage.setItem('siteLanguage', value);
            }
        });
    }
    
    return languageStore;
};

// Use in components:
// const language = getLanguageStore();
// $language