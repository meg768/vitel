
import React from 'react';
import mysql from '../../js/atp-service';

import { useParams } from 'react-router';

import { Container } from '../../components/ui';
import Players from '../../components/players';
import Page from '../../components/page';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';


let Component = () => {
	const queryKey = `players`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let sql = '';

			sql += `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;

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
			<Page.Container>
				<Page.Title>{`Spelare`}</Page.Title>
				<Container>
					<Players players={players} />
				</Container>
			</Page.Container	>
		);
	}

	return (
		<>
			<Page id='players-page'>
				<Menu spinner={isPending} />
				<Content />
			</Page>
		</>
	);
};

export default Component;
