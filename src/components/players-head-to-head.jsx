import React from 'react';

import TriangleRightIcon from '../assets/radix-icons/triangle-right.svg?react';
import Flag from './flag';
import Link from './ui/link';

function formatPlayerLabel(player = {}) {
	if (!player.country) {
		return player.name || '-';
	}

	const ranking = player.rank ? ` #${player.rank}` : '';
	return `${player.name || '-'} (${player.country})${ranking}`;
}

function renderPlayerName(player = {}) {
	const label = formatPlayerLabel(player);

	if (!player.id) {
		return <span>{label}</span>;
	}

	return (
		<Link className='bg-transparent' to={`/player/${player.id}`}>
			{label}
		</Link>
	);
}

function ComparePlayersLink({ playerA = {}, playerB = {} }) {
	if (!playerA?.id || !playerB?.id) {
		return null;
	}

	const compareLink = `/head-to-head/${playerA.id}/${playerB.id}`;
	const ariaLabel = `Jämför ${playerA.name} mot ${playerB.name}`;

	return (
		<Link
			to={compareLink}
			className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-primary-900 dark:text-primary-100'
			aria-label={ariaLabel}
			title='Jämför spelare'
		>
			<TriangleRightIcon className='block h-full w-full' />
		</Link>
	);
}

function PlayersHeadToHead({ playerA = {}, playerB = {} }) {
	return (
		<div className='flex items-center gap-2 bg-transparent'>
			{playerA.country ? <Flag className='w-5! h-5! border-primary-800 dark:border-primary-200' country={playerA.country} /> : null}
			{renderPlayerName(playerA)}
			<span>vs</span>
			{playerB.country ? <Flag className='w-5! h-5! border-primary-800 dark:border-primary-200' country={playerB.country} /> : null}
			{renderPlayerName(playerB)}
			<ComparePlayersLink playerA={playerA} playerB={playerB} />
		</div>
	);
}

export default PlayersHeadToHead;
