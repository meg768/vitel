import clsx from 'clsx';

import WikipediaLogo from '../assets/logos/wikipedia.svg?react';
import Flag from './flag';
import Link from './ui/link';

function Component({ player, className, nameTo, nameTarget }) {
	if (!player) {
		return null;
	}

	let hasWikipedia = player.wikipedia != null && player.wikipedia !== '';

	nameTo = nameTo ?? `https://www.atptour.com/en/players/X/${player.id}/overview`;
	nameTarget = nameTarget === undefined ? '_blank' : nameTarget;

		return (
			<div className={clsx('flex justify-left items-center gap-2', className)}>
				<Flag className='h-10! border-1 border-current' country={player.country}></Flag>
				<div className='bg-transparent leading-tight'>
					<div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
						<div className='inline-flex items-center'>
							<Link target={nameTarget} to={nameTo}>
								{player.name}
							</Link>
							{`, ${player.country}`}
						</div>
						{hasWikipedia ? (
							<Link
								target='_blank'
								to={player.wikipedia}
								className='inline-flex items-center justify-center rounded-full border border-primary-300! bg-primary-100! p-2 transition-opacity hover:opacity-80 dark:border-primary-200! dark:bg-primary-600!'
								title='Wikipedia'
								aria-label={`Wikipedia for ${player.name}`}
							>
								<WikipediaLogo className='h-5 w-5 text-primary-950 [fill:currentColor] dark:text-primary-50' />
							</Link>
						) : null}
				</div>
			</div>
		</div>
	);
}

export default Component;
