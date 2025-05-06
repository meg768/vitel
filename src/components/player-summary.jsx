import React from 'react';

import SummaryTable from './summary-table';
import Avatar from './avatar';

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
	career.title = `${player.pro ? player.pro : firstActiveYear} - ${lastActiveYear}`;
	career.rank = player.highest_rank;
	career.rankDate = player.highest_rank_date;
	career.wins = player.career_wins;
	career.losses = player.career_losses;
	career.matches = career.losses + career.wins;
	career.titles = player.career_titles;

	ytd.type = 'YTD';
	ytd.title = `${currentYear}`;
	ytd.rank = player.rank;
	ytd.rankDate = null;
	ytd.wins = player.ytd_wins;
	ytd.losses = player.ytd_losses;
	ytd.matches = ytd.wins + ytd.losses;	
	ytd.titles = player.ytd_titles;

	career.active = [firstActiveYear, lastActiveYear];

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

	function cash(value) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
	}

	function SurfaceStats() {
		let A = player.hard_factor || '-';
		let B = player.clay_factor || '-';
		let C = player.grass_factor || '-';
		return <SummaryTable.Cell name={'Hard/Clay/Grass'} value={`${A}/${B}/${C}`} />;
	}

	function BodyStats() {
		let H = player.height ? `${player.height}` : '-';
		let W = player.weight ? `${player.weight}` : '-';
		let BMI = player.weight && player.weight ? `${Math.round(player.weight / ((player.height/100)^2))}` : '-';
		return <SummaryTable.Cell name={'Längd/vikt/BMI'} value={`${H}/${W}/${BMI}`} />;

	}
	function PrizeMoneyCareer() {
		return <SummaryTable.Cell name={'Prispengar'} value={player.career_prize ? cash(player.career_prize) : '-'} />;
	}
	function PrizeMoneyYTD() {
		return <SummaryTable.Cell name={'Prispengar (i år)'} value={player.ytd_prize ? cash(player.ytd_prize) : '-'} />;
	}

	function ELO() {
		return <SummaryTable.Cell name={'ELO'} value={player.elo_rank}/>;

	}
	function render() {
		let stats = computeStatistics({ player, matches });
		let src = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;

		return (
			<>
				<SummaryTable>
					<SummaryTable.Row>
						<SummaryTable.Cell rowSpan='3'>
							<div className='flex items-center justify-center'>
								<Avatar src={src} className='bg-primary-900 w-30 h-30' />
							</div>
						</SummaryTable.Cell>
						<SummaryTable.Cell name='Ålder' value={player.age ? player.age : '-'} />
						<BodyStats />
						<PrizeMoneyCareer />
						<PrizeMoneyYTD />
						<SummaryTable.Cell colSpan='1' name='Serve' value={player.serve_rating ? player.serve_rating : '-'} />
						<SummaryTable.Cell colSpan='1' name='Retur' value={player.return_rating ? player.return_rating : '-'} />
						<SummaryTable.Cell colSpan='1' name='Underläge' value={player.pressure_rating ? player.pressure_rating : '-'} />
						<ELO/>
						<SurfaceStats />
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
