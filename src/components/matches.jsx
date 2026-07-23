
import StatisticsIcon from '../assets/custom-icons/statistics.svg?react';
import Table from './ui/data-table';
import Link  from './../components/ui/link';

function Component({ matches, owner, hide = [] }) {


	function isHidden(field) {
		if (hide && hide.length > 0) {
			return hide.includes(field);
		}
		return false;
	}
	
	function Content() {
		return (
			<Table rows={matches} className='striped hover'>
				<Table.Column id='event_date' className='' hidden={isHidden('event_date')}>
					<Table.Title className=''>Datum</Table.Title>
					<Table.Value className=''>
						{({ row }) => {
							return new Date(row.event_date).toLocaleDateString();
						}}
					</Table.Value>
				</Table.Column>

				<Table.Column id='event_name' hidden={isHidden('event_name')}>
					<Table.Title className=''>Turnering</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							if (owner == row.event_id) {
								return <>{`${value} (${row.event_type})`}</>;
							}
							return (
								<>
									<Link to={`/event/${row.event_id}`}>{value}</Link>
									<span className='bg-transparent'>{` (${row.event_type})`}</span>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='event_surface' hidden={isHidden('event_surface')}>
					<Table.Title className=''>Underlag</Table.Title>
				</Table.Column>

				<Table.Column id='round'>
					<Table.Title>Runda</Table.Title>
					<Table.SortValue>
						{({ row }) => {
							let values = ['F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'RR', 'RR2', 'RR3', 'RR3', 'RR4', 'RR5', 'RR6', 'BR'];
							return values.indexOf(row.round);
						}}
					</Table.SortValue>
				</Table.Column>

				<Table.Column id='winner' className=''>
					<Table.Title className=''>Vinnare</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							if (owner == row.winner_id) {
								return value;
							}

							return <Link to={`/player/${row.winner_id}`}>{value}</Link>;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='winner_rank'>
					<Table.Title>#</Table.Title>
				</Table.Column>

				<Table.Column id='loser' className=''>
					<Table.Title className=''>Förlorare</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							if (owner == row.loser_id) {
								return value;
							}

							return <Link to={`/player/${row.loser_id}`}>{value}</Link>;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='loser_rank'>
					<Table.Title>#</Table.Title>
				</Table.Column>

				<Table.Column id='score' className=''>
					<Table.Title className=''>Resultat</Table.Title>
				</Table.Column>

				<Table.Column id='duration' className=''>
					<Table.Title className=''>Speltid</Table.Title>
				</Table.Column>

				<Table.Column className='justify-center'>
					<Table.Title><span className='sr-only'>Jämför spelare</span></Table.Title>
					<Table.Cell className='text-center'>
						{({ row, value }) => {
							return (
								<Link
									to={`/head-to-head/${row.winner_id}/${row.loser_id}`}
									className='mx-auto flex h-7 w-7 items-center justify-center rounded-sm border border-primary-500 text-primary-900 transition-colors hover:bg-primary-100 dark:border-primary-500 dark:text-primary-100 dark:hover:bg-primary-800'
									aria-label={`Jämför ${row.winner} mot ${row.loser}`}
									title='Jämför spelare'
								>
									<StatisticsIcon className='block h-4 w-4 bg-transparent' />
								</Link>
							);
						}}
					</Table.Cell>
				</Table.Column>
			</Table>
		);
	}

	return <Content />;
}

export default Component;
