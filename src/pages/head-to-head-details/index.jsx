import React from 'react';
import { useParams } from 'react-router';

import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import InfoCircledIcon from '../../assets/radix-icons/info-circled.svg?react';
import Flag from '../../components/flag';
import Page from '../../components/page';
import Table from '../../components/ui/data-table';
import Markdown from '../../components/ui/markdown';
import { buildHeadToHeadQueryBatch, headToHeadQueries } from './queries';
import { useSQL } from '../../js/vitel';

function formatValue(value) {
	if (value == null) {
		return '-';
	}

	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toLocaleDateString('sv-SE');
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

	if (typeof value === 'object') {
		const entries = Object.values(value).filter(item => item != null && item !== '');

		if (entries.length === 1) {
			return formatValue(entries[0]);
		}

		try {
			return JSON.stringify(value);
		}
		catch {
			return '-';
		}
	}

	return String(value);
}

function QueryDescriptionDialog({ query, onClose }) {
	React.useEffect(() => {
		function onKeyDown(event) {
			if (event.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onClose]);

	return (
		<div
			className='fixed inset-0 z-50 bg-primary-950/30 p-4'
			onClick={onClose}
			role='dialog'
			aria-label={`Beskrivning för ${query.title}`}
		>
			<div
				className='fixed top-[33dvh] left-1/2 w-[min(calc(100vw-2rem),36rem)] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-primary-300 bg-primary-100 p-4 shadow-xl dark:border-primary-600 dark:bg-primary-800'
				onClick={event => event.stopPropagation()}
			>
				<div className='flex items-start justify-between gap-3'>
					<div className='min-w-0'>
						<div className='text-sm font-semibold text-primary-900 dark:text-primary-50'>{query.title}</div>
					</div>
					<button
						type='button'
						onClick={onClose}
						className='flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-primary-600 hover:bg-primary-100 hover:text-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-50'
						aria-label='Stäng beskrivning'
					>
						<Cross2Icon className='h-4 w-4 bg-transparent' />
					</button>
				</div>
				<div className='mt-3 max-h-[min(24rem,calc(100vh-8rem))] overflow-auto text-sm text-primary-800 dark:text-primary-100'>
					<Markdown className='prose-sm'>
						{query.description}
					</Markdown>
				</div>
			</div>
		</div>
	);
}

function QuestionCell({ row, onOpenQuestionChange }) {
	return (
		<div className='flex items-center gap-2 bg-transparent'>
			<span className='bg-transparent'>{row.question}</span>
			{row.query?.description ? (
				<button
					type='button'
					onClick={() => onOpenQuestionChange(row.query)}
					className='flex h-6 w-6 shrink-0 items-center justify-center bg-transparent text-primary-700 hover:opacity-60 dark:text-primary-100'
					aria-label={`Visa beskrivning för ${row.query.title}`}
					title='Visa beskrivning'
				>
					<InfoCircledIcon className='h-4.5 w-4.5 bg-transparent' />
				</button>
			) : null}
		</div>
	);
}

function DetailsTable({ rows, playerOne, playerTwo }) {
	const [openQuery, setOpenQuery] = React.useState(null);

	return (
		<>
			<Table rows={rows}>
				<Table.Column id='question'>
					<Table.Title>Fråga</Table.Title>
					<Table.Cell>
						{({ row }) => <QuestionCell row={row} onOpenQuestionChange={setOpenQuery} />}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='playerOneValue'>
					<Table.Title>{playerOne.name}</Table.Title>
				</Table.Column>

				<Table.Column id='playerTwoValue'>
					<Table.Title>{playerTwo.name}</Table.Title>
				</Table.Column>
			</Table>

			{openQuery ? <QueryDescriptionDialog query={openQuery} onClose={() => setOpenQuery(null)} /> : null}
		</>
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
			query,
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
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
