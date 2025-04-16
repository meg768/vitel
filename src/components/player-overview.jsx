import React from 'react';

import PlayerSummary from './player-summary';
import PlayerDetails from './player-details';

let Component = ({ player, matches }) => {
	let src = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;

	return (
		<div className='border-none-200 border-0 rounded-none flex p-0'>
			<div className='w-40 self-center p-4'>
				<img className='border-none-300	bg-primary-900 border-4 rounded-full' src={src} />
			</div>
			<div className='flex-1 p-3'>
				<PlayerSummary player={player} matches={matches} />
			</div>
		</div>
	);
};

export default Component;
