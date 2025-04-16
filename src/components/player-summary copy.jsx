import React from 'react';

import SummaryTable from './summary-table';

function computeStatistics({ player, matches }) {
	console.log(matches);

	let career = {
		wins: 0,
		losses: 0,
		titles: 0,
		matches: 0,
		slams: 0,
		masters: 0,
		atp500: 0,
		rank: 0,
		rankDate: undefined
	};

	let ytd = {
		wins: 0,
		losses: 0,
		titles: 0,
		matches: 0,
		slams: 0,
		masters: 0,
		atp500: 0,
		rank: 0,
		rankDate: undefined
	};

	let firstActiveYear = undefined;
	let lastActiveYear = undefined;

	let now = new Date();
	let currentYear = now.getFullYear();

	for (let match of matches) {
		career.matches++;

		let date = new Date(match.event_date);
		let matchYear = date.getFullYear();

		if (true) {
			if (firstActiveYear == undefined) {
				firstActiveYear = matchYear;
			}
			if (lastActiveYear == undefined) {
				lastActiveYear = matchYear;
			}

			firstActiveYear = Math.min(matchYear, firstActiveYear);
			lastActiveYear = Math.max(matchYear, lastActiveYear);
		}

		if (matchYear == currentYear) {
			ytd.matches++;

			if (match.winner_id == player.id) {
				if (match.round == 'F') {
					ytd.titles++;
					if (match.event_type == 'Grand Slam') {
						ytd.slams++;
					}
					if (match.event_type == 'ATP-500') {
						ytd.atp500++;
					}
					if (match.event_type == 'Masters') {
						ytd.masters++;
					}
				}
				ytd.wins++;
			} else {
				ytd.losses++;
			}
		}
		if (match.winner_id == player.id) {
			if (match.round == 'F') {
				career.titles++;
				if (match.event_type == 'Grand Slam') {
					career.slams++;
				}
				if (match.event_type == 'ATP-500') {
					career.atp500++;
				}
				if (match.event_type == 'Masters') {
					career.masters++;
				}
			}
			career.wins++;
		} else {
			career.losses++;
		}
	}

	career.type = 'Karriär';
	career.title = `${firstActiveYear} - ${lastActiveYear}`;
	career.rank = player.highest_rank;
	career.rankDate = player.highest_rank_date;
	career.wins = player.career_wins;
	career.losses = player.career_losses;
	career.titles = player.career_titles;

	ytd.type = 'YTD';
	ytd.title = `${currentYear}`;
	ytd.rank = player.rank;
	ytd.rankDate = null;
	ytd.wins = player.ytd_wins;
	ytd.losses = player.ytd_losses;
	ytd.titles = player.ytd_titles;

	career.active = [firstActiveYear, lastActiveYear];

	let stats = { career: career, ytd: ytd };
	console.log(stats);
	return stats;
}

function Component({ player, matches }) {
	function StatisticsRow({ stats }) {
		function Wins({ stats }) {
			let { wins, matches } = stats;
			let text = '-';

			if (matches > 0 && wins > 0) {
				let percent = Math.round((100 * wins) / matches);
				text = `${wins} (${percent}%)`;
			}

			return <SummaryTable.Cell name={'Vinster'} value={text} />;
		}

		function Losses({ stats }) {
			let { losses, matches } = stats;
			let text = '-';

			if (matches > 0 && losses > 0) {
				let percent = Math.round((100 * losses) / matches);
				text = `${losses} (${percent}%)`;
			}

			return <SummaryTable.Cell name={'Förluster'} value={text} />;
		}

		function Titles({ stats }) {
			return <SummaryTable.Cell name={'Titlar'} value={stats.titles == 0 ? '-' : stats.titles} />;
		}

		function Masters({ stats }) {
			return <SummaryTable.Cell name={'Masters'} value={stats.masters == 0 ? '-' : stats.masters} />;
		}

		function ATP500({ stats }) {
			return <SummaryTable.Cell name={'ATP-500'} value={stats.atp500 == 0 ? '-' : stats.atp500} />;
		}

		function Rank({ stats }) {
			let name = 'Ranking';

			if (stats.rankDate) {
				name += ' (' + new Date(stats.rankDate).toLocaleDateString() + ')';
			}

			let value = stats.rank == 0 ? '-' : stats.rank;
			return <SummaryTable.Cell name={name} value={value ? value : '-'} />;
		}

		function GrandSlams({ stats }) {
			return <SummaryTable.Cell name={'Grand Slams'} value={stats.slams == 0 ? '-' : stats.slams} />;
		}

		function Matches({ stats }) {
			return <SummaryTable.Cell name={'Matcher'} value={stats.matches == 0 ? '-' : stats.matches} />;
		}

		function Type({ stats }) {
			return <SummaryTable.Cell name={stats.type} value={stats.title} />;
		}

		return (
			<SummaryTable.Row>
				<Type stats={stats} />
				<Rank stats={stats} />
				<Wins stats={stats} />
				<Losses stats={stats} />
				<Titles stats={stats} />
				<GrandSlams stats={stats} />
				<Masters stats={stats} />
				<ATP500 stats={stats} />
				<Matches stats={stats} />
			</SummaryTable.Row>
		);
	}

	function render() {
		let stats = computeStatistics({ player, matches });
		let src = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;

		return (
			<>
				<SummaryTable>
					<SummaryTable.Row>
						<SummaryTable.Cell rowSpan='3' className=''>
							<div className='flex justify-center '>
								<div className='w-30'>
									<img className=' border-none-300	bg-primary-900 border-4 rounded-full' src={src} />
								</div>
							</div>
						</SummaryTable.Cell>
						<SummaryTable.Cell name='Ålder' value={player.age} />
						<SummaryTable.Cell name='Längd (cm)' value={player.height} />
						<SummaryTable.Cell name='Vikt (kg)' value={player.weight} />
						<SummaryTable.Cell colSpan='2' name='Serve' value={player.serve_rating ? player.serve_rating : '-'} />
						<SummaryTable.Cell colSpan='2' name='Retur' value={player.return_rating ? player.return_rating : '-'} />
						<SummaryTable.Cell colSpan='2' name='Underläge' value={player.pressure_rating ? player.pressure_rating : '-'} />
					</SummaryTable.Row>
					<StatisticsRow stats={stats.ytd} />
					<StatisticsRow stats={stats.career} />
				</SummaryTable>
			</>
		);
	}
	return render();
}

export default Component;
