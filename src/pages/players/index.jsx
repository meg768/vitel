import { useSearchParams } from 'react-router';

import Page from '../../components/page';
import Players from '../../components/players';
import { useSQL } from '../../js/vitel.js';

export default function PlayersPage() {
	const [searchParams] = useSearchParams();
	let query = searchParams.get('query') || {};

	if (query) {
		try {
			query = JSON.parse(decodeURIComponent(query));
		} catch (error) {
			query = {};
		}
	}

	let { sql, format } = query;

	if (!sql) {
		sql = `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;
	}

	const { data: players, error } = useSQL({ sql, format });

	function Content() {
		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!players) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}

		return (
			<>
				<Page.Title>{query.title ? query.title : 'Spelare'}</Page.Title>
				<Page.Container>
					<Players players={players} rankFirst />
				</Page.Container>
			</>
		);
	}

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}
