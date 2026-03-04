/*
Ping: lost-first-set

Denna ping blir sann om spelaren har forlorat det forsta avslutade setet.

Exempel:
- "0-6 0-0 [0-0]" => true
- "5-7 2-1 [30-30]" => true
- "6-4 0-0 [0-0]" => false
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

	return Boolean(firstSet && firstSet.playerGames < firstSet.opponentGames);
}
