import './index.scss';

import React from 'react';
import Request from '../../js/request';

import { useParams } from 'react-router';

import { Container } from '../../components/ui';
import Matches from '../../components/matches';
import Page from '../../components/page';
import Menu from '../../components/menu';

import TourneySummary from '../../components/tourney-summary';

let Tourney = () => {
	const params = useParams();
	const [response, setResponse] = React.useState(null);

	async function fetch() {
		try {
			setResponse(null);

			let sql = '';
			let format = [];

			sql += `SELECT * FROM matches `;
			sql += `WHERE date = ? `;
			sql += `AND tournament = ? `;
			sql += `ORDER BY date DESC, `;
			sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'BR'); `;

			format = format.concat([params.date, params.tournament]);

			sql += `SELECT * FROM tournaments `;
			sql += `WHERE date = ? `;
			sql += `AND name = ? ;`;

			format = format.concat([params.date, params.tournament]);

			let resuest = new Request();
			let [matches, [tourney]] = await resuest.get('query', { database: 'atp', sql: sql, format: format });

			setResponse({ matches: matches, tourney: tourney });
		} catch (error) {
			console.log(error.message);
		}
	}

	React.useEffect(() => {
		if (response == null) {
			fetch();
		}
	});

	function Content() {
		if (response == null) {
			return;
		}

		let { matches, tourney } = response;

		return (
			<Container>
				<TourneySummary tourney={tourney} matches={matches} />
				<h2>
					<Matches></Matches>
				</h2>
				<Matches matches={matches} owner={`${params.date}/${params.tournament}`}></Matches>
			</Container>
		);
	}

	return (
		<>
			<Page id='tourney-page'>
				<Menu />
				<Container className='px-15'>
					<h1>{`${params.date} ${params.tournament}`}</h1>
					<Content />
				</Container>
			</Page>
		</>
	);
};

export default Tourney;
