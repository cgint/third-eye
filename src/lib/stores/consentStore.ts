import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const storedConsent = browser ? localStorage.getItem('cameraConsent') === 'true' : false;
export const cameraConsent = writable<boolean>(storedConsent);

cameraConsent.subscribe((value) => {
    if (browser) {
        localStorage.setItem('cameraConsent', value.toString());
    }
}); 