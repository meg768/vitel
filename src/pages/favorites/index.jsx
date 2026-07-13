import React from 'react';

import Flag from '../../components/flag';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import LocalStorage from '../../js/local-storage';
import { useSQL } from '../../js/vitel';

const FAVORITES_STORAGE_KEY = 'vitel';
const FAVORITES_KEY = 'favorite-player-ids';

function FavoritePlayersTable({ players, selectedPlayerIds, onToggleSelected }) {
	return (
		<Table
			rows={players}
			rowKey='id'
			isRowSelected={row => selectedPlayerIds.includes(row.id)}
			onRowClick={row => onToggleSelected(row.id)}
			highlightSelectedRows={false}
		>
			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.SortValue>{({ row }) => row.name}</Table.SortValue>
				<Table.Cell>
					{({ row, selected }) => {
						return (
						<div className='flex items-center gap-2 bg-transparent'>
							<span
								className='flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-primary-500 bg-transparent dark:border-primary-400'
								aria-hidden='true'
							>
								{selected ? <span className='h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400' /> : null}
							</span>
							<Flag className='w-6! h-6! border-1! border-current' country={row.country} />
							<Link to={`/player/${row.id}`}>{row.name}</Link>
							<span className='bg-transparent text-sm text-primary-700 dark:text-primary-300'>
								{row.country ? `(${row.country})` : ''}{row.rank ? ` #${row.rank}` : ''}
							</span>
						</div>
						);
					}}
				</Table.Cell>
			</Table.Column>

			<Table.Column id='points'>
				<Table.Title>Poäng</Table.Title>
				<Table.Cell className='text-right' />
			</Table.Column>

			<Table.Column id='elo_rank'>
				<Table.Title>ELO</Table.Title>
				<Table.Cell className='text-right'>
					{({ value }) => value ?? '-'}
				</Table.Cell>
			</Table.Column>

			<Table.Column id='career_titles'>
				<Table.Title>Titlar</Table.Title>
				<Table.Cell className='text-right'>
					{({ value }) => value ?? '-'}
				</Table.Cell>
			</Table.Column>
		</Table>
	);
}

export default function FavoritesPage() {
	const [favoritePlayerIds] = React.useState(() => {
		const storedIds = new LocalStorage({ key: FAVORITES_STORAGE_KEY }).get(FAVORITES_KEY, []);
		return Array.isArray(storedIds) ? storedIds : [];
	});
	const [selectedPlayerIds, setSelectedPlayerIds] = React.useState([]);
	const placeholders = favoritePlayerIds.map(() => '?').join(', ');
	const { data: favoritePlayers, error, isFetching } = useSQL({
		sql: favoritePlayerIds.length
			? `SELECT * FROM players WHERE id IN (${placeholders})`
			: 'SELECT * FROM players WHERE 1 = 0',
		format: favoritePlayerIds
	});
	const orderedFavoritePlayers = favoritePlayerIds
		.map(playerId => favoritePlayers?.find(player => player.id === playerId))
		.filter(Boolean);

	function toggleSelected(playerId) {
		setSelectedPlayerIds(current => {
			if (current.includes(playerId)) {
				return current.filter(id => id !== playerId);
			}

			return current.length < 2 ? [...current, playerId] : [current[1], playerId];
		});
	}

	const compareLink = selectedPlayerIds.length === 2
		? `/head-to-head/${selectedPlayerIds[0]}/${selectedPlayerIds[1]}`
		: null;
	let status = 'ready';
	let statusMessage = `Visar ${orderedFavoritePlayers.length} ${orderedFavoritePlayers.length === 1 ? 'favorit' : 'favoriter'}.`;

	if (error) {
		status = 'warning';
		statusMessage = 'Kunde inte läsa in favoriterna just nu.';
	} else if (isFetching) {
		status = 'loading';
		statusMessage = 'Läser in favoriter…';
	} else if (orderedFavoritePlayers.length > 0 && selectedPlayerIds.length === 0) {
		status = 'info';
		statusMessage = `Visar ${orderedFavoritePlayers.length} ${orderedFavoritePlayers.length === 1 ? 'favorit' : 'favoriter'}. Välj två spelare att jämföra.`;
	} else if (selectedPlayerIds.length === 1) {
		status = 'info';
		statusMessage = 'En spelare vald. Välj en till för att jämföra.';
	} else if (selectedPlayerIds.length === 2) {
		statusMessage = 'Två spelare valda och redo att jämföras.';
	}

	return (
		<Page id='favorites-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Favoriter</span>
					<Button link={compareLink || undefined} disabled={!compareLink}>Jämför valda</Button>
				</Page.Title>
				<Page.Container>
					{error ? (
						<Page.Error>Misslyckades med att läsa in favoriter - {error.message}</Page.Error>
					) : !favoritePlayers ? (
						<Page.Loading>Läser in favoriter…</Page.Loading>
					) : orderedFavoritePlayers.length === 0 ? (
						<Page.Information>Du har inga favoriter ännu. Markera stjärnan på en spelarsida för att lägga till en.</Page.Information>
					) : (
						<FavoritePlayersTable
							players={orderedFavoritePlayers}
							selectedPlayerIds={selectedPlayerIds}
							onToggleSelected={toggleSelected}
						/>
					)}
				</Page.Container>
			</Page.Content>
			<Page.StatusBar status={status}>{statusMessage}</Page.StatusBar>
		</Page>
	);
}
