/*
Ping: won-first-set

Denna ping blir sann om spelaren har vunnit det forsta avslutade setet.

Exempel:
- "6-0 0-0 [0-0]" => true
- "7-5 3-2 [15-15]" => true
- "4-6 6-0 [0-0]" => false
- "[15-15]" => false
*/

function getFirstSet(score) {
	if (!score) {
		return null;
	}

	const firstSet = score
		.split(' ')
		.filter(token => token && !token.startsWith('['))
		.map(token => token.replace(/\(.+\)/, ''))
		.find(token => /^\d+-\d+$/.test(token));

	if (!firstSet) {
		return null;
	}

	const [playerGames, opponentGames] = firstSet.split('-').map(Number);

	return { playerGames, opponentGames };
}

export default function ping(score) {
	const firstSet = getFirstSet(score);

	return Boolean(firstSet && firstSet.playerGames > firstSet.opponentGames);
}
