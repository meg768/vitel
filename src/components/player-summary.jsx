import React from 'react';

import SummaryTable from './summary-table';

function computeStatistics({ player, matches }) {
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

		let date = new Date(match.date);
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

		// Rank
		if (1 == 1) {
			function updateRank(stats) {
				let rank = match.winner == player.name ? match.wrk : match.lrk;

				if (rank != null) {
					if (stats.rank == 0) {
						stats.rank = rank;
						stats.rankDate = match.date;
					} else {
						if (rank < stats.rank) {
							stats.rank = rank;
							stats.rankDate = match.date;
						}
					}
				}
			}

			updateRank(career);
			if (matchYear == currentYear) {
				updateRank(ytd);
			}
		}

		if (matchYear == currentYear) {
			ytd.matches++;

			if (match.winner == player.name) {
				if (match.round == 'F') {
					ytd.titles++;
					if (match.level == 'Grand Slam') {
						ytd.slams++;
					}
					if (match.level == 'ATP-500') {
						ytd.atp500++;
					}
					if (match.level == 'Masters') {
						ytd.masters++;
					}
				}
				ytd.wins++;
			} else {
				ytd.losses++;
			}
		}
		if (match.winner == player.name) {
			if (match.round == 'F') {
				career.titles++;
				if (match.level == 'Grand Slam') {
					career.slams++;
				}
				if (match.level == 'ATP-500') {
					career.atp500++;
				}
				if (match.level == 'Masters') {
					career.masters++;
				}
			}
			career.wins++;
		} else {
			career.losses++;
		}
	}

	career.active = [firstActiveYear, lastActiveYear];

	career.foo = `${firstActiveYear} - ${lastActiveYear}`;
	ytd.foo = `${currentYear}`;
	ytd.type = 'YTD';
	career.type = 'Karriär';

	let stats = { career: career, ytd: ytd };
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
			return <SummaryTable.Cell name={name} value={value} />;
		}

		function GrandSlams({ stats }) {
			return <SummaryTable.Cell name={'Grand Slams'} value={stats.slams == 0 ? '-' : stats.slams} />;
		}

		function Matches({ stats }) {
			return <SummaryTable.Cell name={'Matcher'} value={stats.matches == 0 ? '-' : stats.matches} />;
		}

		function Type({ stats }) {
			return <SummaryTable.Cell name={stats.type} value={stats.foo} />;
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

		return (
			<>
				<SummaryTable>
					<StatisticsRow stats={stats.ytd} />
					<StatisticsRow stats={stats.career} />
				</SummaryTable>
			</>
		);
	}
	return render();
}

export default Component;
