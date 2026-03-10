import clsx from 'clsx';

function toOddsPhaseLabel(state) {
	if (state === 'STARTED') {
		return 'LIVE';
	}

	if (state === 'NOT_STARTED') {
		return 'PRE';
	}

	return null;
}

function OddsetOddsLink({ href, odds = '-', oddsState = null, className }) {
	const phaseLabel = odds !== '-' ? toOddsPhaseLabel(oddsState) : null;
	const label = phaseLabel ? `ODDS ${phaseLabel} ${odds}` : `ODDS ${odds}`;

	return (
		<a
			href={href}
			target='_blank'
			rel='noreferrer'
			aria-label='Öppna Svenska Spel Oddset Tennis'
			title='Öppna Svenska Spel Oddset Tennis'
			className={clsx(
				'absolute top-3 left-3 z-10 rounded-sm border border-primary-300 bg-primary-50 px-2 py-1 text-xs font-semibold tracking-[0.08em] text-primary-700 transition-colors hover:bg-primary-100 hover:text-primary-800 dark:border-primary-500 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800 dark:hover:text-primary-100',
				className
			)}
		>
			{label}
		</a>
	);
}

export default OddsetOddsLink;
