import React from 'react';
import SummaryTable from './summary-table';

function TourneySummary({ matches, tourney }) {

	
	function TourneyDate() {
		return <SummaryTable.Cell name='Date' value={new Date(tourney.date).toLocaleDateString()} />;
	}

	function TourneyWinner() {
		let match = matches.find((match) => {
			return match.round == 'F';
		});

		return <SummaryTable.Cell name='Winner' value={match ? match.winner : '-'} />;
	}

	function TourneyDraw() {
		return <SummaryTable.Cell name='Draw size' value={tourney.draw} />;
	}

	function TourneySurface() {
		return <SummaryTable.Cell name='Surface' value={tourney.surface} />;
	}
	function TourneyName() {
		return <SummaryTable.Cell name='Name' value={tourney.name} />;
	}
	function TourneyLevel() {
		return <SummaryTable.Cell name='Level' value={tourney.level} />;
	}

	return (
		<SummaryTable>
			<SummaryTable.Row>
				<TourneyDate />
				<TourneyName />
				<TourneyLevel />
				<TourneyDraw />
				<TourneySurface />
				<TourneyWinner />
			</SummaryTable.Row>
		</SummaryTable>
	);
}

export default TourneySummary;
