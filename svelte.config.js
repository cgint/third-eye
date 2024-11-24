import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// See https://kit.svelte.dev/docs/adapter-cloudflare for config options
		}),
		csrf: {
			checkOrigin: false // Required for Cloudflare Pages
		}
	},
	preprocess: vitePreprocess()
};

export default config;
