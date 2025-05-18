import { useParams } from 'react-router';
import mysql from '../../js/atp-service';

import QueryPage from '../../components/query-page';
import Matches from '../../components/matches';
import EventLogo from '../../components/event-logo';
import EventSummary from '../../components/event-summary';
import Page from '../../components/page';
import { Container } from '../../components/ui';
import Link from '../../components/ui/link';

export default function EventPage() {
	const { id } = useParams();

	const queryKey = [`event/${id}`];

	const queryFn = async () => {
		let sql = `
			SELECT * FROM flatly WHERE event_id = ? 
			ORDER BY event_date DESC,
			FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'BR');

			SELECT * FROM events WHERE id = ?
		`;
		let [matches, [event]] = await mysql.query({ sql, format: [id, id] });
		return { matches, event };
	};

	// ✅ JSX Component for rendering content
	const Content = ({ matches, event }) => {
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

				<Container>
					<Page.Title level={2}>Översikt</Page.Title>
					<EventSummary event={event} matches={matches} />

					<Page.Title level={2}>Matcher</Page.Title>
					<Matches matches={matches} owner={id} />
				</Container>
			</>
		);
	};

	return (
		<QueryPage id='event-page' queryKey={queryKey} queryFn={queryFn}>
			{Content}
		</QueryPage>
	);
}
