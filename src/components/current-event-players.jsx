import React from 'react';

import ChevronDownIcon from '../assets/radix-icons/chevron-down.svg?react';
import ChevronUpIcon from '../assets/radix-icons/chevron-up.svg?react';
import StarIcon from '../assets/radix-icons/star.svg?react';
import StarFilledIcon from '../assets/radix-icons/star-filled.svg?react';
import Flag from './flag';
import Link from './ui/link';
import { getFavoritePlayerIds, setFavoritePlayerIds } from '../js/player-favorites';
import { useSQL } from '../js/vitel';

const DEFAULT_PLAYER_COUNT = 16;

export default function CurrentEventPlayers({ players = [], collapsible = false }) {
	const [expanded, setExpanded] = React.useState(false);
	const [favoritePlayerIds, setFavoriteIds] = React.useState(getFavoritePlayerIds);
	const playerIds = players.map(player => player.id).filter(Boolean);
	const placeholders = playerIds.map(() => '?').join(', ');
	const { data: playerRows = [] } = useSQL({
		sql: playerIds.length
			? `SELECT id, rank FROM players WHERE id IN (${placeholders})`
			: 'SELECT id, rank FROM players WHERE 1 = 0',
		format: playerIds
	});
	const ranks = new Map(playerRows.map(player => [player.id, player.rank]));
	const canExpand = collapsible && players.length > DEFAULT_PLAYER_COUNT;
	const visiblePlayers = canExpand && !expanded ? players.slice(0, DEFAULT_PLAYER_COUNT) : players;

	function toggleFavorite(playerId) {
		const nextPlayerIds = favoritePlayerIds.includes(playerId)
			? favoritePlayerIds.filter(id => id !== playerId)
			: [...favoritePlayerIds, playerId];

		setFavoritePlayerIds(nextPlayerIds);
		setFavoriteIds(nextPlayerIds);
	}

	return (
		<div className='overflow-hidden rounded-lg border border-primary-200 dark:border-primary-700'>
			<div className='grid gap-px bg-primary-200 sm:grid-cols-2 lg:grid-cols-4 dark:bg-primary-700'>
				{visiblePlayers.map(player => {
					const isFavorite = favoritePlayerIds.includes(player.id);
					const rank = ranks.get(player.id);

					return (
					<div
						key={player.id ?? `${player.name}-${player.seed}`}
						className='flex min-w-0 items-center gap-2 bg-primary-50 px-3 py-2 text-sm dark:bg-primary-900'
					>
						<span className='w-6 shrink-0 text-center text-xs font-semibold text-primary-500 dark:text-primary-400'>
							{player.seed ?? '–'}
						</span>
						<Flag className='h-5! w-5! shrink-0' country={player.country} />
						{player.id ? (
							<Link className='min-w-0 truncate text-primary-800 dark:text-primary-100' to={`/player/${player.id}`}>
								{player.name}{rank ? ` (#${rank})` : ''}
							</Link>
						) : (
							<span className='min-w-0 truncate text-primary-800 dark:text-primary-100'>
								{player.name}{rank ? ` (#${rank})` : ''}
							</span>
						)}
						{player.id ? (
							<button
								type='button'
								onClick={() => toggleFavorite(player.id)}
								className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-transparent text-primary-700 transition-colors hover:bg-primary-200 hover:text-primary-900 dark:text-primary-300 dark:hover:bg-primary-700 dark:hover:text-primary-100'
								aria-label={isFavorite ? `Ta bort ${player.name} från favoriter` : `Lägg till ${player.name} i favoriter`}
								aria-pressed={isFavorite}
								title={isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
							>
								{isFavorite ? <StarFilledIcon className='h-4.5 w-4.5 bg-transparent' /> : <StarIcon className='h-4.5 w-4.5 bg-transparent' />}
							</button>
						) : null}
						{player.entry ? (
							<span className='ml-auto shrink-0 rounded bg-primary-200 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-700 dark:text-primary-100'>
								{player.entry}
							</span>
						) : null}
					</div>
					);
				})}
			</div>
			{canExpand ? (
				<button
					type='button'
					onClick={() => setExpanded(value => !value)}
					className='flex w-full items-center justify-center gap-2 border-t border-primary-200 bg-primary-100 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-200 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-200 dark:hover:bg-primary-700'
					aria-expanded={expanded}
				>
					{expanded ? 'Visa färre' : `Visa alla ${players.length}`}
					{expanded ? <ChevronUpIcon className='h-4 w-4 bg-transparent' /> : <ChevronDownIcon className='h-4 w-4 bg-transparent' />}
				</button>
			) : null}
		</div>
	);
}
