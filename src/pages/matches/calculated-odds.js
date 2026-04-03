import { theme } from '../../js/theme.js';
import { service } from '../../js/vitel.js';

const CALCULATED_ODDS_QUERY_KEY = ['odds', 'calculated', 'matches'];

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

function createMatchKey(row) {
	const playerAId = row?.playerA?.id ?? row?.player?.id ?? row?.playerAId ?? null;
	const playerBId = row?.playerB?.id ?? row?.opponent?.id ?? row?.playerBId ?? null;

	if (!playerAId || !playerBId) {
		return null;
	}

	return [playerAId, playerBId, resolveSurface(row)].join('::');
}

async function fetchCalculatedOddsForRow(row) {
	const playerAId = row?.playerA?.id ?? row?.player?.id ?? row?.playerAId ?? null;
	const playerBId = row?.playerB?.id ?? row?.opponent?.id ?? row?.playerBId ?? null;

	if (!playerAId || !playerBId) {
		return '-';
	}

	const surface = resolveSurface(row);
	const path = `players/odds/${encodeURIComponent(playerAId)}/${encodeURIComponent(playerBId)}?surface=${encodeURIComponent(surface)}`;

	try {
		const payload = await service.get(path);
		if (!Array.isArray(payload) || payload.length < 2) {
			return '-';
		}

		const [playerAOdds, playerBOdds] = payload;
		return `${formatOddsValue(playerAOdds)} - ${formatOddsValue(playerBOdds)}`;
	} catch {
		return '-';
	}
}

async function fetchCalculatedOddsForMatches(rows = []) {
	const entries = await Promise.all(
		rows.map(async row => {
			const key = createMatchKey(row);
			if (!key) {
				return null;
			}

			const odds = await fetchCalculatedOddsForRow(row);
			return [key, odds];
		})
	);

	return Object.fromEntries(entries.filter(Boolean));
}

function getCalculatedOddsForMatch(row, calculatedOddsByMatch) {
	const key = createMatchKey(row);
	if (!key) {
		return '-';
	}

	return calculatedOddsByMatch?.[key] ?? '-';
}

export { CALCULATED_ODDS_QUERY_KEY, fetchCalculatedOddsForMatches, getCalculatedOddsForMatch };
