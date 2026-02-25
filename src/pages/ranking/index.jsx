
import { useQuery } from '@tanstack/react-query';

import Menu from '../../components/menu';
import Page from '../../components/page';
import Players from '../../components/players';
import { Container } from '../../components/ui';
import mysql from '../../js/service';


let Component = () => {
	const queryKey = `ranking`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let sql = '';

			sql += `SELECT * FROM players WHERE rank > 0 AND rank <= 100 ORDER BY rank ASC `;

			let players = await mysql.query({ sql });

			return { players };
		} catch (error) {
			console.log(error.message);
			return null;
		}
	}

	function Content() {
		if (response == null) {
			return;
		}

		let { players } = response;


		return (
			<Container className='px-15'>
				<h1>{`Spelare topp 100`}</h1>
				<Container>
					<Players players={players} />
				</Container>
			</Container>
		);
	}

	return (
		<>
			<Page id='ranking-page'>
				<Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
