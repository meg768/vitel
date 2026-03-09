import React from 'react';

function RefreshCountdown({
	dataUpdatedAt,
	isFetching,
	intervalMs = 30 * 1000,
	steps = 6,
	labelUpdating = 'Uppdaterar live-sidan'
}) {
	const [now, setNow] = React.useState(Date.now());

	React.useEffect(() => {
		const timer = window.setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => window.clearInterval(timer);
	}, []);

	const remainingMs = dataUpdatedAt
		? Math.max(0, intervalMs - (now - dataUpdatedAt))
		: intervalMs;
	const elapsedMs = intervalMs - remainingMs;
	const filledSteps = isFetching
		? steps
		: Math.min(steps, Math.floor(elapsedMs / (intervalMs / steps)));
	const label = isFetching
		? labelUpdating
		: `Nästa uppdatering inom ${Math.ceil(remainingMs / 1000)} sekunder`;

	return (
		<div className='flex justify-center pt-4 pb-2' aria-label={label} title={label}>
			<div className='flex items-center gap-2'>
				{Array.from({ length: steps }, (_, index) => {
					const filled = index < filledSteps;

					return (
						<span
							key={index}
							className={[
								'h-2.5 w-2.5 rounded-full border border-primary-500 transition-colors duration-500',
								filled
									? 'bg-primary-600 dark:bg-primary-300'
									: 'bg-transparent dark:bg-transparent'
							].join(' ')}
						></span>
					);
				})}
			</div>
		</div>
	);
}

export default RefreshCountdown;
