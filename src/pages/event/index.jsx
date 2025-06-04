import { useParams } from 'react-router';
import {useSQL} from '../../js/vitel';

import Link from '../../components/ui/link';

import Matches from '../../components/matches';
import EventLogo from '../../components/event-logo';
import EventSummary from '../../components/event-summary';
import Page from '../../components/page';
import Menu from '../../components/menu';

export default function EventPage() {

	function fetch() {
		const { id } = useParams();

		let sql = `
			SELECT * FROM flatly WHERE event_id = ? 
			ORDER BY event_date DESC,
			FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'BR');

			SELECT * FROM events WHERE id = ?
		`;

		let format = [id, id];

		return useSQL({ sql, format, cache: 1000 * 60 * 5 });

	}

	function Content() {
		const { id } = useParams();

		let { data:response, error } = fetch();

		if (error) {
			return <Page.Error>Misslyckades med att läsa in turnering - {error.message}</Page.Error>;
		}

		if (!response) {
			return <Page.Loading>Läser in turnering...</Page.Loading>;
		}

		let matches = response[0];
		let event = response[1][0];

		if (!event) {
			return (
				<Page.Error>
					<p className='font-bold text-xl'>Kunde inte hitta turnering med ID '{id}'.</p>
					<p>Antagligen är det en ny turnering som ännu inte importerats.</p>
				</Page.Error>
			);
		}

		const year = new Date(event.date).getFullYear();

		return (
			<>
				<Page.Title className='flex items-center'>
					<div className='flex-none bg-transparent'>
						<Link target='_blank' to={event.url}>
							{event.name}
						</Link>{' '}
						{year}
					</div>
					<div className='flex-grow' />
					<div className='flex-none bg-transparent'>
						<EventLogo className='max-h-15' event={event} />
					</div>
				</Page.Title>

				<Page.Container>
					<Page.Title level={2}>Översikt</Page.Title>
					<EventSummary event={event} matches={matches} />

					<Page.Title level={2}>Matcher</Page.Title>
					<Matches matches={matches} owner={id} hide={['event_date', 'event_name', 'event_surface']}/>
				</Page.Container>
			</>
		);
	};

	return (
		<Page id='event-page'>
			<Page.Menu></Page.Menu>
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}
