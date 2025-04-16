import React from 'react';
import SummaryTable from './summary-table';

function Component({ matches, event }) {

	
	function TourneyDate() {
		return <SummaryTable.Cell name='Datum' value={new Date(event.date).toLocaleDateString()} />;
	}

	function TourneyWinner() {
		let match = matches.find((match) => {
			return match.round == 'F';
		});

		return <SummaryTable.Cell name='Vinnare' value={match ? match.winner : '-'} />;
	}

	function TourneyLocation() {
		return <SummaryTable.Cell name='Plats' value={event.location} />;
	}

	function TourneySurface() {
		return <SummaryTable.Cell name='Underlag' value={event.surface} />;
	}
	function TourneyName() {
		return <SummaryTable.Cell name='Namn' value={event.name} />;
	}
	function TourneyType() {
		return <SummaryTable.Cell name='Typ' value={event.type} />;
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

export default Component;
