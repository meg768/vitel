// AtpTourLogo.jsx

/**
 * ================================================================
 * HOW TO USE CHATGPT TO CONVERT A NEW SVG NEXT TIME
 * ================================================================
 *
 * 1. Copy the entire SVG file.
 *
 * 2. Ask ChatGPT something like:
 *
 *    "Convert this SVG to a clean React JSX component.
 *     - Remove XML/doctype
 *     - Fix attribute names to camelCase
 *     - Keep the original viewBox
 *     - Remove width/height
 *     - Replace fixed fill colors with currentColor
 *     - Add proper accessibility (title + aria handling)
 *     - Add explanatory comments in English"
 *
 * 3. Paste the SVG.
 *
 * 4. Copy the resulting JSX file.
 *
 * 5. Done.
 *
 * Optional:
 *    Add: "Optimize and simplify the SVG paths if possible."
 *
 * That’s it. No SVGR required.
 *
 * ================================================================
 */

export default function AtpTourLogo({ title = 'ATP Tour', className = '', ...props }) {
	// Accessibility handling:
	// If title exists, expose as image.
	// Otherwise hide from screen readers.
	const ariaProps = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };

	return (
		<svg
			{...ariaProps}
			viewBox='0 0 1000 296' // Keep original viewBox
			xmlns='http://www.w3.org/2000/svg'
			fill='currentColor' // Enables Tailwind color control
			className={className}
			{...props}
		>
			<g>
				<path d='M999.9,92C999.9,18.2 921.6,0 867.2,0L768.1,0L749.7,68.6C792.5,67.9 836.5,68.2 881.5,69.8C899.6,70.7 913.3,77.3 917,90.4C920.7,103.6 914.1,118.4 900.5,128C891.4,134.4 881,138.1 863,138.1C845,138.1 756.2,137.3 731.1,137.9L688.9,295.2L787.5,295.2L809,215.1L850.7,215.1C944.3,215.1 999.9,165.8 999.9,92Z' />
				<path d='M415.3,94.5C350,103.2 281.2,114.3 213.3,128.6L301.6,0L401.2,0L415.4,94.5L415.3,94.5Z' />
				<path d='M445.5,295.1L340.5,295.1L334.1,243.4L240.1,243.4L206.5,295.1L99,295.1L134.3,243.4L0,243.4C130.8,204.1 287.1,177.3 425.3,160.5L445.5,295.1Z' />
				<path d='M520.9,150.2C557.2,146.7 591.1,144.1 621.7,142.1L580.6,295.2L482,295.2L520.9,150.3L520.9,150.2Z' />
				<path d='M745.8,0L727.3,68.8C664.2,70.2 563.8,76.3 450,90.1L474.3,0L745.8,0Z' />
			</g>
		</svg>
	);
}
