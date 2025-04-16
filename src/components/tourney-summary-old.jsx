import React from 'react';
import SummaryTable from './summary-table';

function TourneySummary({ matches, tourney }) {

	
	function TourneyDate() {
		return <SummaryTable.Cell name='Datum' value={new Date(tourney.date).toLocaleDateString()} />;
	}

	function TourneyWinner() {
		let match = matches.find((match) => {
			return match.round == 'F';
		});

		return <SummaryTable.Cell name='Vinnare' value={match ? match.winner : '-'} />;
	}

	function TourneyLocation() {
		return <SummaryTable.Cell name='Plats' value={tourney.location} />;
	}

	function TourneySurface() {
		return <SummaryTable.Cell name='Underlag' value={tourney.surface} />;
	}
	function TourneyName() {
		return <SummaryTable.Cell name='Namn' value={tourney.name} />;
	}
	function TourneyType() {
		return <SummaryTable.Cell name='Typ' value={tourney.type} />;
	}

	return (
		<SummaryTable>
			<SummaryTable.Row>
				<TourneyDate />
				<TourneyName />
				<TourneyLocation />
				<TourneyType />
				<TourneySurface />
				<TourneyWinner />
			</SummaryTable.Row>
		</SummaryTable>
	);
}

export default TourneySummary;
