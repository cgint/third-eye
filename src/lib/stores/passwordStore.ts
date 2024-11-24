import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedPassword = browser ? localStorage.getItem('sitePassword') : null;
export const password = writable(storedPassword || '');

password.subscribe((value) => {
  if (browser) {
    localStorage.setItem('sitePassword', value);
  }
});