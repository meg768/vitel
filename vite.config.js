// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

function magnusPlugin() {
	return {
		name: 'magnus-plugin',

		// Körs när Vite försöker resolve:a en import
		resolveId(source, importer) {
			console.log('🔍 Magnus försöker resolve:a:', source, 'importerat av:', importer);
			return null; // låt övriga plugins fortsätta
		},

		// Körs när filen laddas
		load(id) {
			console.log('📂 Magnus laddar fil:', id);
			return null;
		},

		// Körs när kod transformeras
		transform(code, id) {
			console.log('⚡ Magnus transformerar kod i fil:', id);
			return null; // vi modifierar inget ännu
		}
	};
}

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),

        // Konfigurera SVGR-pluginen för att lägga till fill="currentColor" som standard på alla SVG-komponenter
        // Detta gör att alla SVG-komponenter som importeras med ?react kommer att ha fill="currentColor" som standard, vilket gör att de kan ärva färg från CSS.
		svgr({
			svgrOptions: {
				svgProps: {
                    // Lägg till fill="currentColor" som standard på alla SVG-komponenter
					fill: 'currentColor'
				}
			}
		})
	],
	base: './'
});
