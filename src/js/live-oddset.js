const LIVE_ODDSET_ATP_URL =
	'https://eu1.offering-api.kambicdn.com/offering/v2018/svenskaspel/listView/tennis/atp/all/all/matches.json?channel_id=1&client_id=200&lang=sv_SE&market=SE&useCombined=true&useCombinedLive=true';

const LIVE_ODDSET_QUERY_KEY = ['oddset', 'live', 'atp'];

function normalizeName(name = '') {
	return String(name)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function createPlayersKey(playerAName, playerBName) {
	const playerA = normalizeName(playerAName);
	const playerB = normalizeName(playerBName);

	if (!playerA || !playerB) {
		return null;
	}

	return [playerA, playerB].sort().join('::');
}

function toDecimalOdds(odds) {
	if (typeof odds !== 'number') {
		return '-';
	}

	return (odds / 1000).toFixed(2);
}

function getMatchOddsOffer(event) {
	return event.betOffers?.find(offer => offer.criterion?.label === 'Matchodds' || offer.criterion?.englishLabel === 'Match Odds');
}

async function fetchLiveOddsetOddsByPlayers() {
	const response = await fetch(LIVE_ODDSET_ATP_URL);

	if (response.status === 404) {
		return {};
	}

	if (!response.ok) {
		throw new Error(`Kunde inte läsa oddset (${response.status})`);
	}

	const payload = await response.json();
	const oddsByPlayers = {};

	for (const item of payload.events || []) {
		if (item.event?.state !== 'STARTED') {
			continue;
		}

		const offer = getMatchOddsOffer(item);
		if (!offer) {
			continue;
		}

		const one = offer.outcomes?.find(outcome => outcome.type === 'OT_ONE');
		const two = offer.outcomes?.find(outcome => outcome.type === 'OT_TWO');
		const oneName = one?.label || item.event?.homeName;
		const twoName = two?.label || item.event?.awayName;
		const key = createPlayersKey(oneName, twoName);

		if (!key) {
			continue;
		}

		oddsByPlayers[key] = {
			[normalizeName(oneName)]: toDecimalOdds(one?.odds),
			[normalizeName(twoName)]: toDecimalOdds(two?.odds)
		};
	}

	return oddsByPlayers;
}

function formatLiveOddsetOddsForMatch(match, oddsByPlayers) {
	const key = createPlayersKey(match.player?.name, match.opponent?.name);
	if (!key) {
		return '-';
	}

	const oddsForMatch = oddsByPlayers?.[key];
	if (!oddsForMatch) {
		return '-';
	}

	const playerOdds = oddsForMatch[normalizeName(match.player?.name)] ?? '-';
	const opponentOdds = oddsForMatch[normalizeName(match.opponent?.name)] ?? '-';

	if (playerOdds === '-' && opponentOdds === '-') {
		return '-';
	}

	return `${playerOdds} - ${opponentOdds}`;
}

export { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers, formatLiveOddsetOddsForMatch };
