import adapter from '@sveltejs/adapter-auto';
//import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: {
			base: process.argv.includes('dev') ? '/planner-app' : '/planner-app',
			//base: process.env.NODE_ENV === 'production' ? '/planner-app' : '/planner-app',
		}
	}
};

export default config;
