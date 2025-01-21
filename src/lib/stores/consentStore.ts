import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

let consentStore: Writable<boolean> | null = null;

/**
 * Gets the camera consent store singleton
 * Usage:
 *   import { getCameraConsent } from '$lib/stores/consentStore';
 *   const cameraConsent = getCameraConsent();
 */
export const getCameraConsent = () => {
    if (!consentStore) {
        const storedConsent = browser ? localStorage.getItem('cameraConsent') === 'true' : false;
        consentStore = writable<boolean>(storedConsent);
        
        // Set up subscription only once when store is created
        consentStore.subscribe((value) => {
            if (browser) {
                localStorage.setItem('cameraConsent', value.toString());
            }
        });
    }
    
    return consentStore;
};

// Use in components:
// const cameraConsent = getCameraConsent();
// $cameraConsent