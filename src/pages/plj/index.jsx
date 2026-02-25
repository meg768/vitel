import React from 'react';

import Page from '../../components/page';
import { Button } from '../../components/ui';
import Link from '../../components/ui/link';

const SHOWCASE_CARDS = [
	{
		id: 'pulse',
		title: 'Neon Pulse',
		tag: 'Synk',
		description: 'Mjuka glödskiftningar som ger sidan liv utan att störa läsbarheten.'
	},
	{
		id: 'speed',
		title: 'Arcade Tempo',
		tag: 'Rörelse',
		description: 'Subtila rörelser i bakgrunden som skapar en känsla av fart och energi.'
	},
	{
		id: 'finale',
		title: 'Final Burst',
		tag: 'Final',
		description: 'Fyrverkerierna markerar höjdpunkter och gör sidan mer minnesvärd.'
	}
];

const FIREWORKS = Array.from({ length: 20 }, (_, index) => ({
	id: `firework-${index}`,
	x: `${4 + ((index * 17) % 92)}%`,
	y: `${10 + ((index * 29) % 62)}%`,
	delay: `${(index % 7) * 0.35}s`,
	duration: `${2.8 + (index % 5) * 0.45}s`,
	size: `${10 + (index % 4) * 4}px`,
	hue: `${(index * 37) % 360}`
}));

function PLJ() {
	const [fireworksEnabled, setFireworksEnabled] = React.useState(true);
	const [activeCard, setActiveCard] = React.useState(SHOWCASE_CARDS[0].id);

	const selectedCard = SHOWCASE_CARDS.find(card => card.id === activeCard) || SHOWCASE_CARDS[0];

	function toggleFireworks() {
		setFireworksEnabled(current => !current);
	}

	return (
		<Page id='plj-page'>
			<Page.Menu />
			<Page.Content>
				<div className='plj-page'>
					<Page.Title className='plj-neon-pulse'>PLJ // Neon Court</Page.Title>
					<Page.Container className='space-y-5'>
						<p className='text-lg leading-relaxed'>
							Det här är en kreativ demosida med neon-arcade-känsla, byggd på samma struktur som övriga Vitel-sidor.
							Målet är att kännas levande, tydlig och lekfull utan att bli rörig.
						</p>

						<section className='plj-hero'>
							{fireworksEnabled && (
								<div className='plj-fireworks' aria-hidden='true'>
									{FIREWORKS.map(firework => (
										<div
											key={firework.id}
											className='plj-firework'
											style={{
												'--plj-x': firework.x,
												'--plj-y': firework.y,
												'--plj-delay': firework.delay,
												'--plj-duration': firework.duration,
												'--plj-size': firework.size,
												'--plj-hue': firework.hue
											}}
										>
											<span className='plj-firework-core'></span>
											<span className='plj-firework-trail'></span>
										</div>
									))}
								</div>
							)}

							<div className='relative z-10 space-y-4 bg-transparent'>
								<div className='text-xl md:text-2xl font-semibold'>En experimentyta för nya visuella idéer</div>
								<p className='max-w-2xl text-base md:text-lg'>
									Neonfärger, tydlig typografi och kontrollerad rörelse gör att sidan sticker ut utan att bryta mot
									appen som helhet.
								</p>
								<div className='flex flex-wrap gap-3 pt-1'>
									<Link to='/events' className='plj-cta'>
										Turneringar
									</Link>
									<Link to='/players' className='plj-cta'>
										Spelare
									</Link>
									<Link to='/live' className='plj-cta'>
										Live
									</Link>
								</div>
							</div>
						</section>

						<section className='space-y-4'>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								<div>
									<div className='text-lg font-semibold'>Interaktiv kontroll</div>
									<div className='text-sm opacity-85'>Stäng av eller slå på effektlagret när du vill.</div>
								</div>
								<Button type='button' onClick={toggleFireworks} className='plj-toggle-button'>
									Fyrverkeri: {fireworksEnabled ? 'På' : 'Av'}
								</Button>
							</div>

							<div className='grid gap-3 md:grid-cols-3'>
								{SHOWCASE_CARDS.map(card => {
									const active = card.id === selectedCard.id;

									return (
										<button
											key={card.id}
											type='button'
											aria-pressed={active}
											onClick={() => setActiveCard(card.id)}
											onMouseEnter={() => setActiveCard(card.id)}
											onFocus={() => setActiveCard(card.id)}
											className={`plj-showcase-card ${active ? 'plj-showcase-card-active' : ''}`}
										>
											<div className='flex items-center justify-between gap-2 bg-transparent'>
												<div className='text-lg font-semibold bg-transparent'>{card.title}</div>
												<span className='text-xs uppercase tracking-wide bg-transparent'>{card.tag}</span>
											</div>
											<p className='mt-2 text-sm leading-relaxed bg-transparent'>{card.description}</p>
										</button>
									);
								})}
							</div>

							<div className='plj-status-panel'>
								<div className='text-sm uppercase tracking-widest opacity-70 bg-transparent'>Aktivt läge</div>
								<div className='text-2xl font-semibold bg-transparent'>{selectedCard.title}</div>
								<p className='text-base leading-relaxed bg-transparent'>
									{selectedCard.description} Testa att byta kort och jämför hur sidan växlar fokus.
								</p>
							</div>
						</section>
					</Page.Container>
				</div>
			</Page.Content>
		</Page>
	);
}

export default PLJ;
