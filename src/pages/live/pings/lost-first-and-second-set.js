/*
Ping: lost-first-and-second-set

Denna ping blir sann om spelaren har förlorat de två första avslutade seten.

*/

function getCompletedSets(score) {
	if (!score) {
		return [];
	}

	return score
		.split(' ')
		.filter(token => token && !token.startsWith('['))
		.map(token => token.replace(/\(.+\)/, ''))
		.filter(token => /^\d+-\d+$/.test(token))
		.slice(0, 2)
		.map(token => {
			const [playerGames, opponentGames] = token.split('-').map(Number);

			return { playerGames, opponentGames };
		});
}

export default function ping(score) {
	const [firstSet, secondSet] = getCompletedSets(score);

	return Boolean(
		firstSet &&
		secondSet &&
		firstSet.playerGames < firstSet.opponentGames &&
		secondSet.playerGames < secondSet.opponentGames
	);
}
