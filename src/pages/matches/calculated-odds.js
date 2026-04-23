import { theme } from '../../js/theme.js';
import { service } from '../../js/vitel.js';

const MATCH_ODDS_QUERY_KEY = ['odds', 'matches'];

function normalizeKeyPart(value) {
	return String(value || '')
		.trim()
		.toLowerCase();
}

function formatOddsValue(odds) {
	if (typeof odds === 'number' && Number.isFinite(odds)) {
		return odds.toFixed(2);
	}

	if (typeof odds === 'string' && odds.trim() !== '') {
		const parsed = Number(odds);
		if (Number.isFinite(parsed)) {
			return parsed.toFixed(2);
		}
	}

	return '-';
}

function toSurfaceLabel(surface) {
	const value = String(surface || '').trim().toLowerCase();

	switch (value) {
		case 'hard':
			return 'Hard';
		case 'clay':
			return 'Clay';
		case 'grass':
			return 'Grass';
		default:
			return 'Hard';
	}
}

function resolveSurface(row) {
	if (row?.surface) {
		return toSurfaceLabel(row.surface);
	}

	const timestamp = Number.isFinite(row?._startTimestamp) ? row._startTimestamp : Date.now();
	return toSurfaceLabel(theme.getAutomaticSurface(new Date(timestamp)));
}

function resolvePlayerTerm(row, side = 'A') {
	if (side === 'A') {
		return row?.playerA?.id
			?? row?.player?.id
			?? row?.playerAId
			?? row?.playerA?.name
			?? row?.player?.name
			?? null;
	}

	return row?.playerB?.id
		?? row?.opponent?.id
		?? row?.playerBId
		?? row?.playerB?.name
		?? row?.opponent?.name
		?? null;
}

function createMatchKey(row) {
	const playerATerm = resolvePlayerTerm(row, 'A');
	const playerBTerm = resolvePlayerTerm(row, 'B');

	if (!playerATerm || !playerBTerm) {
		return null;
	}

	return [normalizeKeyPart(playerATerm), normalizeKeyPart(playerBTerm), resolveSurface(row)].join('::');
}

function formatOddsPair(odds) {
	if (!Array.isArray(odds) || odds.length < 2) {
		return '-';
	}

	const [playerAOdds, playerBOdds] = odds;
	return `${formatOddsValue(playerAOdds)} - ${formatOddsValue(playerBOdds)}`;
}

async function fetchOddsForRow(row) {
	const playerATerm = resolvePlayerTerm(row, 'A');
	const playerBTerm = resolvePlayerTerm(row, 'B');

	if (!playerATerm || !playerBTerm) {
		return { computedOdds: '-', tennisAbstractOdds: '-' };
	}

	const surface = resolveSurface(row);
	const query = new URLSearchParams({
		playerA: String(playerATerm).trim(),
		playerB: String(playerBTerm).trim(),
		surface
	});
	const path = `odds?${query.toString()}`;

	try {
		const payload = await service.get(path);
		return {
			computedOdds: formatOddsPair(payload?.computedOdds),
			tennisAbstractOdds: formatOddsPair(payload?.tennisAbstractOdds)
		};
	} catch {
		return { computedOdds: '-', tennisAbstractOdds: '-' };
	}
}

async function fetchMatchOddsForMatches(rows = []) {
	const entries = await Promise.all(
		rows.map(async row => {
			const key = createMatchKey(row);
			if (!key) {
				return null;
			}

			const odds = await fetchOddsForRow(row);
			return [key, odds];
		})
	);

	return Object.fromEntries(entries.filter(Boolean));
}

function getMatchOddsForRow(row, matchOddsByKey) {
	const key = createMatchKey(row);
	if (!key) {
		return { computedOdds: '-', tennisAbstractOdds: '-' };
	}

	return matchOddsByKey?.[key] ?? { computedOdds: '-', tennisAbstractOdds: '-' };
}

export {
	MATCH_ODDS_QUERY_KEY,
	fetchMatchOddsForMatches,
	getMatchOddsForRow
};
