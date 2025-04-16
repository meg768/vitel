import React from 'react';

import SummaryTable from './summary-table';


function Component({ player }) {
	
	function render() {

		return (
			<>
				<SummaryTable>
					<SummaryTable.Row>
						<SummaryTable.Cell name='Ranking' value={player.rank} />
						<SummaryTable.Cell name='Ålder' value={player.age} />
						<SummaryTable.Cell name='Längd (cm)' value={player.height} />
						<SummaryTable.Cell name='Vikt (kg)' value={player.weight} />
						<SummaryTable.Cell name='Professionell' value={player.pro} />
					</SummaryTable.Row>
				</SummaryTable>
			</>
		);
	}
	return render();
}

export default Component;
