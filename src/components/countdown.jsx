import React from 'react';

import UpdateIcon from '../assets/radix-icons/update.svg?react';

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function Countdown({
	dataUpdatedAt,
	isFetching,
	intervalMs = 30 * 1000,
	labelUpdating = 'Uppdaterar live-sidan',
	inline = false,
	onRefresh,
	disabled = false
}) {
	const [now, setNow] = React.useState(Date.now());

	React.useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(timer);
	}, []);

	const remainingMs = dataUpdatedAt
		? Math.max(0, intervalMs - (now - dataUpdatedAt))
		: intervalMs;
	const elapsedRatio = isFetching ? 1 : Math.min(1, Math.max(0, (intervalMs - remainingMs) / intervalMs));
	const dashOffset = CIRCUMFERENCE * (1 - elapsedRatio);
	const label = isFetching
		? labelUpdating
		: `Nästa uppdatering inom ${Math.ceil(remainingMs / 1000)} sekunder`;
	const rootClassName = inline ? 'flex justify-end py-0' : 'flex justify-center pt-4 pb-2';
	const controlClassName = [
		'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-transparent text-primary-100',
		onRefresh ? 'transition-colors hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60' : ''
	].join(' ');

	const content = (
		<>
			<svg className='absolute inset-0 h-10 w-10 -rotate-90 bg-transparent' viewBox='0 0 36 36' aria-hidden='true'>
				<circle cx='18' cy='18' r={RADIUS} fill='none' strokeWidth='1.5' className='stroke-current opacity-45' />
				<circle
					cx='18'
					cy='18'
					r={RADIUS}
					fill='none'
					strokeWidth='2.5'
					strokeLinecap='round'
					strokeDasharray={CIRCUMFERENCE}
					strokeDashoffset={dashOffset}
					className='stroke-current transition-[stroke-dashoffset] duration-300'
				/>
			</svg>
			<UpdateIcon className={`relative h-4.5 w-4.5 bg-transparent ${isFetching ? 'animate-spin' : ''}`} aria-hidden='true' />
		</>
	);

	return (
		<div className={rootClassName} title={label}>
			{onRefresh ? (
				<button type='button' onClick={onRefresh} disabled={disabled} className={controlClassName} aria-label={`${label}. Uppdatera nu.`}>
					{content}
				</button>
			) : (
				<div className={controlClassName} aria-label={label}>{content}</div>
			)}
		</div>
	);
}

export default Countdown;
