// Comment showing usage
/**
 * Password store singleton
 * Usage:
 * import { getPasswordStore } from '$lib/stores/passwordStore';
 * const password = getPasswordStore();
 */

import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

let passwordStore: Writable<string> | null = null;

export const getPasswordStore = () => {
  if (!passwordStore) {
    const storedPassword = browser ? localStorage.getItem('sitePassword') : null;
    passwordStore = writable(storedPassword || '');

    // Set up subscription only once when store is created
    passwordStore.subscribe((value) => {
      if (browser) {
        if (value.trim() !== '') {
          localStorage.setItem('sitePassword', value);
        } else {
          localStorage.removeItem('sitePassword');
        }
      }
    });
  }
  
  return passwordStore;
};

// Use in components:
// const password = getPasswordStore();
// $password