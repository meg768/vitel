import clsx from 'clsx';

import EventLogo from '../../components/event-logo';
import Page from '../../components/page';
import Link from '../../components/ui/link';
import Table from '../../components/ui/data-table';
import { useRequest } from '../../js/vitel';

const CURRENT_EVENT_LOOKBACK_DAYS = 14;

function parseEventStartDate(value) {
	if (typeof value !== 'string' || value.trim() === '') {
		return null;
	}

	const parsed = new Date(value);

	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function startOfToday() {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function filterCurrentAndUpcomingEvents(events) {
	const today = startOfToday();
	const earliestCurrentStart = new Date(today);

	earliestCurrentStart.setDate(earliestCurrentStart.getDate() - CURRENT_EVENT_LOOKBACK_DAYS);

	return events.filter(event => {
		if (!event._startDate) {
			return true;
		}

		return event._startDate >= earliestCurrentStart;
	});
}

function sortEventsByStartDate(events) {
	return [...events].sort((a, b) => {
		const aTime = a._startDate ? a._startDate.getTime() : Number.MAX_SAFE_INTEGER;
		const bTime = b._startDate ? b._startDate.getTime() : Number.MAX_SAFE_INTEGER;

		return aTime - bTime;
	});
}

function getTypeBadgeParts({ type, name }) {
	switch (type) {
		case 'Masters':
			return {
				eyebrow: 'ATP',
				emphasis: 'M',
				caption: 'Masters',
				className: 'text-amber-300'
			};
		case 'ATP-500':
			return {
				eyebrow: 'ATP',
				emphasis: '500',
				caption: 'Series',
				className: 'text-sky-300'
			};
		case 'ATP-250':
			return {
				eyebrow: 'ATP',
				emphasis: '250',
				caption: 'Series',
				className: 'text-teal-300'
			};
		case 'Grand Slam':
			return {
				eyebrow: 'Major',
				emphasis: 'SLAM',
				caption: 'Grand Slam',
				className: 'text-yellow-300'
			};
		case 'United Cup':
			return {
				eyebrow: 'Team',
				emphasis: 'UNITED',
				caption: 'Cup',
				className: 'text-rose-300'
			};
		case 'Davis Cup':
			return {
				eyebrow: 'Team',
				emphasis: 'DAVIS',
				caption: 'Cup',
				className: 'text-emerald-300'
			};
		case 'Laver Cup':
			return {
				eyebrow: 'Team',
				emphasis: 'LAVER',
				caption: 'Cup',
				className: 'text-red-300'
			};
		case 'World Championship':
			return {
				eyebrow: 'ATP',
				emphasis: 'FINALS',
				caption: 'World Championship',
				className: 'text-fuchsia-300'
			};
		default:
			return {
				eyebrow: 'ATP',
				emphasis: (type || 'Event').replace(/^ATP[- ]?/i, '').slice(0, 8).toUpperCase(),
				caption: name || type || 'Event',
				className: 'text-primary-700 dark:text-primary-200'
			};
	}
}

function hasSvgTypeLogo(event) {
	if (!event) {
		return false;
	}

	switch (event.name) {
		case 'Nitto ATP Finals':
		case 'Wimbledon':
		case 'Roland Garros':
		case 'US Open':
		case 'Australian Open':
			return true;
	}

	switch (event.type) {
		case 'Laver Cup':
		case 'Rod Laver Cup':
		case 'Masters':
		case 'ATP-500':
		case 'ATP-250':
		case 'Davis Cup':
		case 'United Cup':
		case 'Next Gen Finals':
		case 'World Championship':
			return true;
		default:
			return false;
	}
}

function getTypeLogoClassName(event) {
	switch (event?.type) {
		case 'Davis Cup':
			return 'h-8 w-auto max-w-22';
		case 'United Cup':
			return 'h-8 w-auto max-w-22';
		case 'Laver Cup':
		case 'Rod Laver Cup':
			return 'h-8 w-auto max-w-20';
		case 'World Championship':
			return 'h-8 w-auto max-w-18';
		default:
			return 'h-8 w-auto max-w-16';
	}
}

function TypeBadge({ event }) {
	const { eyebrow, emphasis, caption, className } = getTypeBadgeParts(event);

	return (
		<div
			className={clsx(
				'inline-flex h-12 w-18 flex-col justify-between px-1 py-1',
				'leading-none whitespace-nowrap',
				className
			)}
			title={event.type}
		>
			<div className='bg-transparent text-[0.52rem] font-semibold uppercase tracking-[0.28em] opacity-80'>
				{eyebrow}
			</div>
			<div className='bg-transparent pt-0.5 text-[0.85rem] font-black uppercase tracking-[0.05em]'>
				{emphasis}
			</div>
			<div className='max-w-full truncate bg-transparent pt-0.5 text-[0.42rem] font-semibold uppercase tracking-[0.14em] opacity-85'>
				{caption}
			</div>
		</div>
	);
}

function TypeMark({ event }) {
	if (hasSvgTypeLogo(event)) {
		return (
			<div
				className={clsx(
					'inline-flex h-12 items-center justify-center px-1 py-1'
				)}
				title={event.type}
			>
				<EventLogo event={event} className={clsx('bg-transparent', getTypeLogoClassName(event))} />
			</div>
		);
	}

	return <TypeBadge event={event} />;
}

function CalendarTable({ rows }) {
	return (
		<Table rows={rows} className='striped [&_tbody_tr_*]:bg-transparent'>
			<Table.Column id='type' className='w-1 whitespace-nowrap'>
				<Table.Title>Typ</Table.Title>
				<Table.Cell>
					{({ row }) => {
						return <TypeMark event={row} />;
					}}
				</Table.Cell>
			</Table.Column>

			<Table.Column id='date' className='w-1 whitespace-nowrap'>
				<Table.Title>Datum</Table.Title>
			</Table.Column>

			<Table.Column id='location'>
				<Table.Title>Plats</Table.Title>
			</Table.Column>

			<Table.Column id='name' className='min-w-56'>
				<Table.Title>Turnering</Table.Title>
				<Table.Cell>
					{({ row, value }) => {
						return <Link to={`/event/${row.id}`}>{value}</Link>;
					}}
				</Table.Cell>
			</Table.Column>

		</Table>
	);
}

function normalizeCalendarPayload(payload) {
	if (!payload || typeof payload !== 'object' || !Array.isArray(payload.events)) {
		throw new Error('Calendar endpoint har oväntat format');
	}

	return payload.events.map(event => ({
		id: event.id ?? '',
		name: event.name ?? '-',
		date: event.date ?? '-',
		location: event.location ?? '-',
		type: event.type ?? '-',
		_startDate: parseEventStartDate(event.date)
	}));
}

function Component() {
	const { data: payload, error } = useRequest({
		path: 'calendar',
		method: 'GET',
		cache: 60 * 60 * 1000
	});

	function Content() {
		if (error) {
			return <Page.Error>Misslyckades med att läsa in kalendern - {error.message}</Page.Error>;
		}

		if (!payload) {
			return <Page.Loading />;
		}

		let events = [];

		try {
			events = sortEventsByStartDate(filterCurrentAndUpcomingEvents(normalizeCalendarPayload(payload)));
		} catch (normalizeError) {
			return <Page.Error>Misslyckades med att läsa in kalendern - {normalizeError.message}</Page.Error>;
		}

		return (
			<>
				<Page.Title>Kalender</Page.Title>
				<Page.Container className='space-y-4'>
					{events.length > 0 ? (
						<CalendarTable rows={events} />
					) : (
						<Page.Information>Inga kommande eller pågående turneringar hittades just nu.</Page.Information>
					)}
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='calendar-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
