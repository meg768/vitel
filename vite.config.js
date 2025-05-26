// This Vite configuration file sets up a React project with Tailwind CSS and SVGR for SVG handling.

import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss()
	],

	base: './'
});
