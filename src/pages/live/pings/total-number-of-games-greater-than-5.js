/*

Ping: total-number-of-games-greater-than-5

Denna ping blir sann om det totala antalet spelade game i de avslutade seten är större än 5.

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
	const totalGames = getCompletedSets(score).reduce((sum, set) => {
		return sum + set.playerGames + set.opponentGames;
	}, 0);

	return totalGames > 5;
}
