import { useState } from 'react';

import ActivityIcon from '../../assets/radix-icons/activity-log.svg?react';
import BarChartIcon from '../../assets/radix-icons/bar-chart.svg?react';
import BellIcon from '../../assets/radix-icons/bell.svg?react';
import CheckIcon from '../../assets/radix-icons/check.svg?react';
import ClockIcon from '../../assets/radix-icons/clock.svg?react';
import LightningIcon from '../../assets/radix-icons/lightning-bolt.svg?react';
import MagicWandIcon from '../../assets/radix-icons/magic-wand.svg?react';
import MagnifyingGlassIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import StarIcon from '../../assets/radix-icons/star-filled.svg?react';
import UpdateIcon from '../../assets/radix-icons/update.svg?react';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Tabs from '../../components/ui/tabs';
import ToggleGroup from '../../components/ui/toggle-group';

const palette = [
	['50', 'bg-primary-50'], ['100', 'bg-primary-100'], ['200', 'bg-primary-200'],
	['300', 'bg-primary-300'], ['400', 'bg-primary-400'], ['500', 'bg-primary-500'],
	['600', 'bg-primary-600'], ['700', 'bg-primary-700'], ['800', 'bg-primary-800'],
	['900', 'bg-primary-900'], ['950', 'bg-primary-950']
];

function Card({ className = '', children }) {
	return <div className={`rounded-lg border border-primary-300 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-900 ${className}`}>{children}</div>;
}

function Badge({ children, tone = 'primary' }) {
	const tones = {
		primary: 'border-primary-400 bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100',
		success: 'border-success-400 bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100',
		warning: 'border-warning-500 bg-warning-100 text-warning-900 dark:bg-warning-900 dark:text-warning-100',
		error: 'border-error-400 bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100'
	};
	return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${tones[tone]}`}>{children}</span>;
}

function Metric({ label, value, detail, icon: Icon, trend }) {
	return (
		<Card className='relative overflow-hidden'>
			<div className='absolute -right-5 -top-6 h-24 w-24 rounded-full bg-primary-200/60 dark:bg-primary-700/35' />
			<div className='relative flex items-start justify-between gap-3 bg-transparent'>
				<div className='bg-transparent'>
					<div className='text-xs font-bold uppercase tracking-[0.12em] text-primary-600 dark:text-primary-300'>{label}</div>
					<div className='mt-2 text-3xl font-bold tracking-tight text-primary-950 dark:text-primary-50'>{value}</div>
					<div className='mt-1 text-sm text-primary-700 dark:text-primary-300'>{detail}</div>
				</div>
				<Icon className='h-7 w-7 bg-transparent text-primary-600 dark:text-primary-300' />
			</div>
			{trend ? <div className='relative mt-3 bg-transparent text-xs font-semibold text-success-700 dark:text-success-300'>↗ {trend}</div> : null}
		</Card>
	);
}

function Progress({ value, label, tone = 'bg-primary-600' }) {
	return (
		<div className='space-y-1.5'>
			<div className='flex justify-between gap-3 bg-transparent text-sm font-semibold'><span>{label}</span><span>{value}%</span></div>
			<div className='h-2 overflow-hidden rounded-full bg-primary-200 dark:bg-primary-800'>
				<div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
			</div>
		</div>
	);
}

export default function TrialPage() {
	const [density, setDensity] = useState('comfortable');
	const [favorite, setFavorite] = useState(false);

	return (
		<Page id='trial-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='justify-between gap-3'>
					<div className='flex items-center gap-2 bg-transparent'>
						<MagicWandIcon className='h-7 w-7 shrink-0 bg-transparent' aria-hidden='true' />
						<span className='bg-transparent'>Tailwind-labbet</span>
					</div>
					<Badge>Experimentyta</Badge>
				</Page.Title>

				<Page.Container className='space-y-8 pb-10!'>
					<section className='grid gap-4 lg:grid-cols-[1.35fr_0.65fr]'>
						<div className='relative overflow-hidden rounded-xl border border-primary-700 bg-primary-900 p-6 text-primary-50 shadow-lg md:p-8'>
							<div className='absolute -right-20 -top-24 h-72 w-72 rounded-full border-[3rem] border-primary-700/50 bg-transparent' />
							<div className='relative max-w-2xl bg-transparent'>
								<Badge success='true'>UI playground</Badge>
								<h2 className='mt-5 bg-transparent text-3xl font-bold leading-tight tracking-tight md:text-5xl'>Här får formen ta lite mer plats.</h2>
								<p className='mt-4 max-w-xl bg-transparent text-base leading-relaxed text-primary-200 md:text-lg'>Ett koncentrat av komponenter, rytm, färg, hierarki och små interaktioner som kan flytta in i Vitel när de passar.</p>
								<div className='mt-6 flex flex-wrap gap-2 bg-transparent'>
									<Button link='/matches'>Till matcher</Button>
									<Button link='/settings' className='border-primary-400! bg-transparent!'>Inställningar</Button>
								</div>
							</div>
						</div>
						<Card className='flex flex-col justify-between'>
							<div className='bg-transparent'>
								<div className='flex items-center justify-between bg-transparent'><Badge tone='success'>Live</Badge><span className='text-xs text-primary-600 dark:text-primary-300'>21:42:18</span></div>
								<div className='mt-6 text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-300'>Center Court</div>
								<div className='mt-2 text-2xl font-bold'>Sinner <span className='font-normal text-primary-500'>mot</span> Alcaraz</div>
								<div className='mt-1 text-sm text-primary-700 dark:text-primary-300'>Final · Hardcourt</div>
							</div>
							<div className='mt-8 flex items-end justify-between bg-transparent'>
								<div className='font-mono text-4xl font-bold'>6–4 <span className='text-primary-400'>3–2</span></div>
								<span className='text-3xl'>🎾</span>
							</div>
						</Card>
					</section>

					<section>
						<Page.Title level={2}>Överblick och nyckeltal</Page.Title>
						<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
							<Metric icon={ActivityIcon} label='Livematcher' value='4' detail='Tre turneringar' trend='2 sedan senast' />
							<Metric icon={BarChartIcon} label='Träffsäkerhet' value='68%' detail='Senaste 30 dagarna' trend='4,2 procentenheter' />
							<Metric icon={StarIcon} label='Favoriter' value='12' detail='Aktiva spelare' />
							<Metric icon={ClockIcon} label='Nästa start' value='14 min' detail='Båstad · Center Court' />
						</div>
					</section>

					<section className='grid gap-5 xl:grid-cols-2'>
						<div>
							<Page.Title level={2}>Status och återkoppling</Page.Title>
							<div className='space-y-2'>
								<Page.Information>Ny ranking är inläst. 523 spelare uppdaterades.</Page.Information>
								<Page.Warning>Oddset saknas för två kommande matcher.</Page.Warning>
								<Page.Error>ATP-flödet svarade inte. Tidigare data visas.</Page.Error>
								<div className='flex items-center gap-3 rounded-lg border border-success-400 bg-success-50 p-3 text-success-900 dark:bg-success-950 dark:text-success-100'>
									<CheckIcon className='h-7 w-7 shrink-0 bg-transparent' />
									<div className='bg-transparent'><div className='font-bold'>Allt klart</div><div className='text-sm opacity-80'>Importen slutfördes på 55 minuter.</div></div>
								</div>
							</div>
						</div>
						<div>
							<Page.Title level={2}>Progress och belastning</Page.Title>
							<Card className='space-y-5'>
								<Progress label='Import av matcher' value={82} />
								<Progress label='Modellberäkningar' value={61} tone='bg-info-500' />
								<Progress label='Databas' value={34} tone='bg-warning-500' />
								<div className='grid grid-cols-3 gap-2 border-t border-primary-300 pt-4 text-center dark:border-primary-700'>
									{[['CPU', '18%'], ['Minne', '42%'], ['Disk', '67%']].map(([label, value]) => <div key={label} className='bg-transparent'><div className='text-xl font-bold'>{value}</div><div className='text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300'>{label}</div></div>)}
								</div>
							</Card>
						</div>
					</section>

					<section>
						<Page.Title level={2}>Kontroller och states</Page.Title>
						<Card className='grid gap-6 lg:grid-cols-3'>
							<div className='space-y-3'>
								<Page.Title level={4} className='p-0!'>Pills och knappar</Page.Title>
								<div className='flex flex-wrap gap-2'><Button>Primär</Button><Button size='compact'>Kompakt</Button><Button disabled>Inaktiv</Button></div>
								<div className='flex flex-wrap gap-2'><Badge>Normal</Badge><Badge tone='success'>Klar</Badge><Badge tone='warning'>Väntar</Badge><Badge tone='error'>Fel</Badge></div>
							</div>
							<div className='space-y-3'>
								<Page.Title level={4} className='p-0!'>Segment</Page.Title>
								<ToggleGroup value={density} onChange={setDensity}><ToggleGroup.Item value='compact'>Tät</ToggleGroup.Item><ToggleGroup.Item value='comfortable'>Luftig</ToggleGroup.Item><ToggleGroup.Item value='large'>Stor</ToggleGroup.Item></ToggleGroup>
								<button onClick={() => setFavorite(value => !value)} className='flex items-center gap-2 bg-transparent text-sm font-semibold'><StarIcon className={`h-6 w-6 bg-transparent ${favorite ? 'text-warning-500' : 'text-primary-400'}`} />{favorite ? 'Favorit markerad' : 'Markera favorit'}</button>
							</div>
							<div className='space-y-3'>
								<Page.Title level={4} className='p-0!'>Sökfält</Page.Title>
								<label className='flex items-center gap-2 rounded-full border border-primary-400 bg-primary-100 px-4 py-2 dark:bg-primary-800'><MagnifyingGlassIcon className='h-5 w-5 bg-transparent' /><input className='min-w-0 flex-1 bg-transparent' placeholder='Sök spelare…' /></label>
								<div className='flex items-center gap-2 text-sm text-primary-600 dark:text-primary-300'><BellIcon className='h-4 w-4 bg-transparent' /> Notiser aktiverade</div>
							</div>
						</Card>
					</section>

					<section className='grid gap-5 xl:grid-cols-[0.8fr_1.2fr]'>
						<div>
							<Page.Title level={2}>Färgskala</Page.Title>
							<Card>
								<div className='grid grid-cols-6 overflow-hidden rounded-lg sm:grid-cols-11'>
									{palette.map(([label, color]) => <div key={label} className={`${color} flex aspect-square items-end justify-center p-1 text-[9px] font-bold ${Number(label) >= 600 ? 'text-white' : 'text-primary-950'}`}>{label}</div>)}
								</div>
								<p className='mt-3 text-sm text-primary-700 dark:text-primary-300'>Samma skala byter karaktär mellan hardcourt, grus och gräs.</p>
							</Card>
						</div>
						<div>
							<Page.Title level={2}>Flikar och innehåll</Page.Title>
							<Card>
								<Tabs.Root defaultValue='form'>
									<Tabs.List><Tabs.Trigger value='form'>Form</Tabs.Trigger><Tabs.Trigger value='serve'>Serve</Tabs.Trigger><Tabs.Trigger value='history'>Historik</Tabs.Trigger></Tabs.List>
									<Tabs.Content value='form'><div className='grid gap-3 pt-2 sm:grid-cols-3'>{[['5–0', 'Senaste fem'], ['71%', 'Vinstprocent'], ['+8', 'Rankingtrend']].map(([value, label]) => <div key={label} className='rounded-lg bg-primary-100 p-4 dark:bg-primary-800'><div className='text-2xl font-bold'>{value}</div><div className='text-xs text-primary-600 dark:text-primary-300'>{label}</div></div>)}</div></Tabs.Content>
									<Tabs.Content value='serve'><p className='py-4 text-primary-700 dark:text-primary-300'>Förstaserve 68% · vunna servepoäng 74% · ess per match 9,2</p></Tabs.Content>
									<Tabs.Content value='history'><p className='py-4 text-primary-700 dark:text-primary-300'>Tre tidigare möten, två vunna av den högre rankade spelaren.</p></Tabs.Content>
								</Tabs.Root>
							</Card>
						</div>
					</section>

					<section>
						<Page.Title level={2}>Aktivitetsflöde</Page.Title>
						<Card className='p-0!'>
							{[
								['21:42', 'Matchlistan uppdaterades', 'Fyra live och elva kommande matcher.', UpdateIcon],
								['21:40', 'Ny skräll registrerad', 'Rankad 84 slog världstian i tre set.', LightningIcon],
								['21:37', 'Modelloddsen är klara', 'TA och GPT beräknades för 15 matcher.', BarChartIcon]
							].map(([time, title, text, Icon], index) => (
								<div key={time} className='grid grid-cols-[3.5rem_2rem_1fr] gap-3 border-b border-primary-300 px-4 py-4 last:border-0 dark:border-primary-700'>
									<div className='pt-1 font-mono text-xs text-primary-600 dark:text-primary-300'>{time}</div>
									<div className='relative flex justify-center bg-transparent'><span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-700'><Icon className='h-4 w-4 bg-transparent' /></span>{index < 2 ? <span className='absolute top-8 h-8 w-px bg-primary-300 dark:bg-primary-700' /> : null}</div>
									<div className='bg-transparent'><div className='font-bold'>{title}</div><div className='mt-0.5 text-sm text-primary-700 dark:text-primary-300'>{text}</div></div>
								</div>
							))}
						</Card>
					</section>
				</Page.Container>
			</Page.Content>
			<Page.StatusBar status='info'>Lekstugan är lokal för Vitel och kan ändras utan att påverka övriga sidor.</Page.StatusBar>
		</Page>
	);
}
