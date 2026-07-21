import StatisticsIcon from '../assets/custom-icons/statistics.svg?react';
import StarIcon from '../assets/radix-icons/star.svg?react';
import StarFilledIcon from '../assets/radix-icons/star-filled.svg?react';
import Flag from './flag';
import Table from './ui/data-table';
import Link from '../components/ui/link';

function Component({ players, rankFirst = false, rowKey, isRowSelected, onRowClick, highlightSelectedRows, onComparePlayer, favoritePlayerIds = [], onToggleFavorite }) {
	function Content() {
		function cash(value) {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
		}

		const rankColumn = (
			<Table.Column id='rank' className=''>
				<Table.Title>Ranking</Table.Title>
				<Table.Cell className='text-right'>
					{({ row, value }) => {
						return value;
					}}
				</Table.Cell>
			</Table.Column>
		);

		return (
			<Table
				rows={players}
				className='striped hover'
				rowKey={rowKey}
				isRowSelected={isRowSelected}
				onRowClick={onRowClick}
				highlightSelectedRows={highlightSelectedRows}
			>
				{rankFirst ? rankColumn : null}

				<Table.Column id='name' className=''>
					<Table.Title className=''>Namn</Table.Title>
					<Table.Cell>
						{({ row, value, selected }) => {
							const isFavorite = favoritePlayerIds.includes(row.id);

							return (
								<div className='flex items-center gap-2 whitespace-nowrap bg-transparent'>
									<Flag className='w-5! h-5! border-1! border-current' country={row.country}></Flag>
									<div className='bg-transparent'>
										<Link to={`/player/${row.id}`}>{value}</Link>
										{rankFirst ? <span className='text-sm'>, {row.country}</span> : null}
									</div>
									{onToggleFavorite ? (
										<button
											type='button'
											onClick={() => onToggleFavorite(row)}
											className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-transparent text-primary-700 transition-colors hover:bg-primary-200 hover:text-primary-900 dark:text-primary-300 dark:hover:bg-primary-700 dark:hover:text-primary-100'
											aria-label={isFavorite ? `Ta bort ${row.name} från favoriter` : `Lägg till ${row.name} i favoriter`}
											aria-pressed={isFavorite}
											title={isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
										>
											{isFavorite ? <StarFilledIcon className='h-4.5 w-4.5 bg-transparent' /> : <StarIcon className='h-4.5 w-4.5 bg-transparent' />}
										</button>
									) : null}
									{onComparePlayer ? (
										<button
											type='button'
											onClick={() => onComparePlayer(row)}
											className={`flex h-6 w-6 items-center justify-center rounded-sm border border-primary-500 text-primary-900 transition-colors hover:bg-primary-200 dark:border-primary-500 dark:text-primary-100 dark:hover:bg-primary-700 ${selected ? 'bg-primary-200 dark:bg-primary-700' : 'bg-transparent'}`}
											aria-label={`${selected ? 'Ta bort' : 'Välj'} ${row.name} ${selected ? 'från' : 'för'} jämförelse`}
										>
											<StatisticsIcon className='h-3.5 w-3.5 bg-transparent' />
										</button>
									) : null}
								</div>
							);
						}}
					</Table.Cell>
				</Table.Column>

				{rankFirst ? null : (
					<Table.Column id='country' className=''>
						<Table.Title className=''>Land</Table.Title>
					</Table.Column>
				)}

				{rankFirst ? null : rankColumn}
                
				<Table.Column id='points' className=''>
					<Table.Title>Poäng</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='elo_rank' defaultSortOrder='dsc' className=''>
					<Table.Title>ELO</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='highest_rank' className=''>
					<Table.Title className='whitespace-nowrap'>Högsta Ranking</Table.Title>
					<Table.Cell className='text-right whitespace-nowrap'>
						{({ row, value }) => {
							return `${value} (${new Date(row.highest_rank_date).toLocaleDateString()})`;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='career_titles' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Titlar</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column className=''>
					<Table.Title>V/F</Table.Title>
					<Table.Cell className='text-left'>
						{({ row, value }) => {
							return `${row.career_wins}/${row.career_losses}`;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='age' className=''>
					<Table.Title className=''>Ålder</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='height' className=''>
					<Table.Title className=''>Längd (cm)</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='weight' className=''>
					<Table.Title className=''>Vikt (kg)</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='serve_rating' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Serve</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>
				<Table.Column id='return_rating' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Retur</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='pressure_rating' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Underläge</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>
			</Table>
		);
	}

	return <Content />;
}

export default Component;
