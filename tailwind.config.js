const colors = require('tailwindcss/colors');

console.log(colors);
module.exports = {
	darkMode: 'class',

	theme: {
		// Some useful comment
		fontFamily: {
			nunito: ['lato', 'sans-serif'],
			MyFont: ['"My Font"', 'serif'] // Ensure fonts with spaces have " " surrounding it.
		},

	}
};
