import React from 'react';

function Countdown({
	dataUpdatedAt,
	isFetching,
	intervalMs = 30 * 1000,
	steps = 6,
	labelUpdating = 'Uppdaterar live-sidan',
	inline = false
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
	const rootClassName = inline ? 'flex justify-end py-0' : 'flex justify-center pt-4 pb-2';
	const dotsClassName = inline ? 'flex items-center gap-1.5' : 'flex items-center gap-2';
	const dotSizeClassName = inline ? 'h-2 w-2' : 'h-2.5 w-2.5';

	return (
		<div className={rootClassName} aria-label={label} title={label}>
			<div className={dotsClassName}>
				{Array.from({ length: steps }, (_, index) => {
					const filled = index < filledSteps;

					return (
						<span
							key={index}
							className={[
								`${dotSizeClassName} rounded-full border border-current transition-colors duration-500`,
								filled
									? 'bg-current'
									: 'bg-transparent'
							].join(' ')}
						></span>
					);
				})}
			</div>
		</div>
	);
}

export default Countdown;
