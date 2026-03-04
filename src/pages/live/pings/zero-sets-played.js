/*
Ping: zero-sets-played

Denna ping blir sann om score inte innehaller några sets.

*/

function getSetTokens(score) {
	if (!score) {
		return [];
	}

	return score
		.split(' ')
		.filter(token => token && !token.startsWith('['))
		.map(token => token.replace(/\(.+\)/, ''))
		.filter(token => /^\d+-\d+$/.test(token));
}

export default function ping(score) {
	const setTokens = getSetTokens(score);

	return setTokens.length === 0;
}
