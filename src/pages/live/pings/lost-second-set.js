/*
Ping: lost-second-set

Denna ping blir sann om spelaren har forlorat det andra avslutade setet.

Exempel:
- "6-4 0-6 [0-0]" => true
- "7-5 5-7 [15-15]" => true
- "4-6 6-3 [0-0]" => false
- "6-4 [30-30]" => false
*/

function getSecondSet(score) {
	if (!score) {
		return null;
	}

	const secondSet = score
		.split(' ')
		.filter(token => token && !token.startsWith('['))
		.map(token => token.replace(/\(.+\)/, ''))
		.filter(token => /^\d+-\d+$/.test(token))[1];

	if (!secondSet) {
		return null;
	}

	const [playerGames, opponentGames] = secondSet.split('-').map(Number);

	return { playerGames, opponentGames };
}

export default function ping(score) {
	const secondSet = getSecondSet(score);

	return Boolean(secondSet && secondSet.playerGames < secondSet.opponentGames);
}
