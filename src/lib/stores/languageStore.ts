import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

let languageStore: Writable<string> | null = null;

const DEFAULT_LANGUAGE = 'en';

export const getLanguageStore = () => {
    if (!languageStore) {
        const storedLanguage = browser ? localStorage.getItem('siteLanguage') : null;
        languageStore = writable(storedLanguage || DEFAULT_LANGUAGE);
        
        // Set up subscription only once when store is created
        languageStore.subscribe((value) => {
            if (browser) {
                if (value == DEFAULT_LANGUAGE) {
                    localStorage.removeItem('siteLanguage');
                } else {
                    localStorage.setItem('siteLanguage', value);
                }
            }
        });
    }
    
    return languageStore;
};

// Use in components:
// const language = getLanguageStore();
// $language