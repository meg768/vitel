import { defineConfig } from 'tailwindcss';
import { colors } from 'tailwindcss/colors';

export default defineConfig({
	theme: {
		extend: {
			colors: {
				clay: {
					50: 'rgb(var(--color-clay-50) / <alpha-value>)',
					100: 'rgb(var(--color-clay-100) / <alpha-value>)',
					200: 'rgb(var(--color-clay-200) / <alpha-value>)',
					300: 'rgb(var(--color-clay-300) / <alpha-value>)',
					400: 'rgb(var(--color-clay-400) / <alpha-value>)',
					500: 'rgb(var(--color-clay-500) / <alpha-value>)',
					600: 'rgb(var(--color-clay-600) / <alpha-value>)',
					700: 'rgb(var(--color-clay-700) / <alpha-value>)',
					800: 'rgb(var(--color-clay-800) / <alpha-value>)',
					900: 'rgb(var(--color-clay-900) / <alpha-value>)',
					950: 'rgb(var(--color-clay-950) / <alpha-value>)'
				}
			}
		}
	}
});
