import { useParams } from 'react-router';

import Flag from '../../components/flag';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import { buildHeadToHeadQueryBatch, headToHeadQueries } from './queries';
import { useSQL } from '../../js/vitel';

function formatValue(value) {
	if (value == null) {
		return '-';
	}

	if (typeof value === 'number') {
		return value.toLocaleString('sv-SE');
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();

		if (trimmed === '') {
			return '-';
		}

		if (/^\d{4}-\d{2}-\d{2}(?:[ T].*)?$/.test(trimmed)) {
			const date = new Date(trimmed);

			if (!Number.isNaN(date.getTime())) {
				return date.toLocaleDateString('sv-SE');
			}
		}

		if (/^-?\d+(?:[.,]\d+)?$/.test(trimmed)) {
			const numericValue = Number(trimmed.replace(',', '.'));

			if (Number.isFinite(numericValue)) {
				return numericValue.toLocaleString('sv-SE');
			}
		}

		return trimmed;
	}

	return String(value);
}

function DetailsTable({ rows, playerOne, playerTwo }) {
	return (
		<Table rows={rows}>
			<Table.Column id='question'>
				<Table.Title>Fråga</Table.Title>
			</Table.Column>

			<Table.Column id='playerOneValue'>
				<Table.Title>{playerOne.name}</Table.Title>
			</Table.Column>

			<Table.Column id='playerTwoValue'>
				<Table.Title>{playerTwo.name}</Table.Title>
			</Table.Column>
		</Table>
	);
}

function formatPlayerTitle(player) {
	if (player.rank == null) {
		return player.name;
	}

	return `${player.name} (#${player.rank})`;
}

function Title({ playerOne, playerTwo }) {
	return (
		<Page.Title className='flex flex-wrap items-center gap-3'>
			<div className='flex items-center gap-2 bg-transparent'>
				<Flag className='w-8! h-8! border-1 border-current' country={playerOne.country} />
				<span className='bg-transparent'>{formatPlayerTitle(playerOne)}</span>
			</div>
			<span className='bg-transparent'>vs</span>
			<div className='flex items-center gap-2 bg-transparent'>
				<Flag className='w-8! h-8! border-1 border-current' country={playerTwo.country} />
				<span className='bg-transparent'>{formatPlayerTitle(playerTwo)}</span>
			</div>
		</Page.Title>
	);
}

function Component() {
	const params = useParams();
	const detailsQueryBatch = buildHeadToHeadQueryBatch({ playerA: params.A, playerB: params.B });

	let sql = '';
	let format = [];

	sql += 'SELECT id, name, country, rank FROM players WHERE id = ?; ';
	format = format.concat([params.A]);

	sql += 'SELECT id, name, country, rank FROM players WHERE id = ?; ';
	format = format.concat([params.B]);

	sql += detailsQueryBatch.sql;
	format = format.concat(detailsQueryBatch.format);

	const { data, error } = useSQL({ sql, format });

	if (error) {
		return (
			<Page id='head-to-head-details-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in head-to-head-fördjupning - {error.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!data) {
		return (
			<Page id='head-to-head-details-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in head-to-head-fördjupning...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	if (headToHeadQueries.length === 0) {
		return (
			<Page id='head-to-head-details-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Information>Det finns inga head-to-head-frågor ännu.</Page.Information>
				</Page.Content>
			</Page>
		);
	}

	const [[playerOne], [playerTwo], ...queryResults] = data;

	if (!playerOne || !playerTwo) {
		return (
			<Page id='head-to-head-details-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Information>Spelarna hittades inte ({params.A}, {params.B}).</Page.Information>
				</Page.Content>
			</Page>
		);
	}

	const rows = headToHeadQueries.map((query, index) => {
		const resultRow = queryResults[index]?.[0] ?? {};

		return {
			question: query.title,
			playerOneValue: formatValue(resultRow.player_a_value),
			playerTwoValue: formatValue(resultRow.player_b_value)
		};
	});

	return (
		<Page id='head-to-head-details-page'>
			<Page.Menu />
			<Page.Content>
				<Title playerOne={playerOne} playerTwo={playerTwo} />
				<Page.Container>
					<DetailsTable rows={rows} playerOne={playerOne} playerTwo={playerTwo} />

					<div className='flex justify-center pt-4'>
						<Button link={`/head-to-head/${playerOne.id}/${playerTwo.id}`}>Gå tillbaka</Button>
					</div>
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
