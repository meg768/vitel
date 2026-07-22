import CurrentEventPlayers from './current-event-players';
import EventSummary from './event-summary';
import Page from './page';
import Link from './ui/link';

const surfaceNames = {
	Clay: 'Grus',
	Grass: 'Gräs',
	Hard: 'Hardcourt',
	Carpet: 'Matta'
};

export function matchesCurrentEvent(event, searchTerm) {
	const normalizedTerm = searchTerm.trim().toLocaleLowerCase('sv-SE');

	if (!normalizedTerm) return true;

	const surfaceAliases = {
		grus: 'clay',
		gräs: 'grass',
		gras: 'grass',
		hardcourt: 'hard',
		matta: 'carpet'
	};
	const comparableTerm = surfaceAliases[normalizedTerm] ?? normalizedTerm;
	const values = [event.name, event.location, event.type, event.surface, surfaceNames[event.surface]];

	return values.some(value => value?.toLocaleLowerCase('sv-SE').includes(comparableTerm));
}

export default function CurrentEvents({ events }) {
	return (
		<div className='grid gap-4'>
			{events.map(event => (
				<section key={event.id} className='rounded-lg border border-primary-300 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-800'>
					<div className='bg-transparent'>
						<div className='min-w-0 bg-transparent'>
							<Link to={`/event/${event.id}`} className='text-lg font-semibold text-primary-900 dark:text-primary-50'>
								{event.name}
							</Link>
						</div>
					</div>
					<Page.Title level={4}>Översikt</Page.Title>
					<EventSummary event={event} matches={[]} hide={['name', 'winner']} />
					<Page.Title level={4}>Deltagare</Page.Title>
					<CurrentEventPlayers players={event.players} collapsible />
				</section>
			))}
		</div>
	);
}
