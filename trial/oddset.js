#!/usr/bin/env node

import FetchOddset from './fetch-oddset.js';

async function main() {
	const oddset = new FetchOddset();
	const output = await oddset.fetch();

	process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch(error => {
	process.stderr.write(
		`${JSON.stringify({
			error: 'Kunde inte skapa Oddset-JSON',
			details: error.message
		})}\n`
	);
	process.exit(1);
});
