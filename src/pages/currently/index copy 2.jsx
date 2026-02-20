import React from 'react';
import Page from '../../components/page';

import { useSQL } from '../../js/vitel.js';

let Component = () => {
function Content() {
	let sql = `SELECT * FROM currently`;
	let { data, error } = useSQL({ sql, cache: 1000 * 60 * 5 });

	if (error) {
		return <Page.Error>Misslyckades med att läsa in aktuella turneringar - {error.message}</Page.Error>;
	}

	if (!data) {
		return <Page.Loading>Läser in...</Page.Loading>;
	}

	// Grupp per event_name
	const grouped = data.reduce((acc, row) => {
		const key = row.event_name ?? '(okänt event)';
		(acc[key] ??= []).push(row);
		return acc;
	}, {});

	// Stabil ordning på eventen (senaste event_date först om den finns)
	const eventNames = Object.keys(grouped).sort((a, b) => {
		const aDate = grouped[a][0]?.event_date ?? '';
		const bDate = grouped[b][0]?.event_date ?? '';
		if (aDate !== bDate) return String(bDate).localeCompare(String(aDate));
		return a.localeCompare(b);
	});

	return (
		<>
			<Page.Title>Pågående turneringar</Page.Title>

			<Page.Container>
				{eventNames.map(eventName => {
					const rows = grouped[eventName];

					// Sortera spelare inom event (rank -> namn)
					const players = [...rows].sort((x, y) => {
						const rx = x.player_rank ?? 99999;
						const ry = y.player_rank ?? 99999;
						if (rx !== ry) return rx - ry;
						return String(x.player).localeCompare(String(y.player));
					});

					const lastDate = rows.reduce((max, r) => (String(r.event_date) > String(max) ? r.event_date : max), rows[0]?.event_date);

					return (
						<div key={eventName} className='mb-8'>
							<div className='flex items-baseline justify-between gap-4'>
								<h2 className='text-xl font-semibold'>{eventName}</h2>
								<div className='text-sm opacity-70 whitespace-nowrap'>
									{lastDate ? `Senast: ${lastDate}` : null}
									{` • Kvar: ${rows.length}`}
								</div>
							</div>

							<ul className='mt-3 space-y-1'>
								{players.map(p => (
									<li
										key={`${p.player_id}`}
										className='flex items-center justify-between rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10'
									>
										<div className='flex items-center gap-3'>
											<span className='w-14 text-sm opacity-70'>{p.player_rank ? `#${p.player_rank}` : ''}</span>
											<span>{p.player}</span>
										</div>

										<span className='text-sm opacity-70'>{p.round}</span>
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</Page.Container>
		</>
	);
}	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
