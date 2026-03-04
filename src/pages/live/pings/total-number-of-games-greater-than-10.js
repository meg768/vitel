/*

Ping: total-number-of-games-greater-than-10

Denna ping blir sann om det totala antalet spelade game i de avslutade seten är större än 10.

Exempel:
- "6-4 6-3" => true (totalt 19 game)
- "7-5 6-7 7-6" => true (totalt 39 game)
- "6-0 6-0" => false (totalt 12 game)
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

	return totalGames > 10;
}
