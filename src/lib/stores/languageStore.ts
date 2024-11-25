import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedLanguage = browser ? localStorage.getItem('siteLanguage') : null;
export const language = writable(storedLanguage || 'en');

language.subscribe((value) => {
  if (browser) {
    localStorage.setItem('siteLanguage', value);
  }
});