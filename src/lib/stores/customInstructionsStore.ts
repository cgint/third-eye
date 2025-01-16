import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedInstructions = browser ? localStorage.getItem('customInstructions') : null;
export const customInstructions = writable(storedInstructions || '');

customInstructions.subscribe((value) => {
    if (browser) {
        localStorage.setItem('customInstructions', value);
    }
}); 