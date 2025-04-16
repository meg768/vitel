import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { useState, useRef } from 'react';
import { NavLink, Link } from 'react-router';


import Menu from '../../components/menu';
import Page from '../../components/page';





let now = new Date();
let year = now.getFullYear();



class LiveFetcher  {
	constructor(options) {
	}

	async fetch({}) {
		let results = [];

		let url = `https://app.atptour.com/api/v2/gateway/livematches/website?scoringTournamentLevel=tour`;
		let response = await fetch(url);

		if (!response) {
			return null;
		}

		let result = [];

		for (let tournamentIndex = 0; ; tournamentIndex++) {
			let tournament = jp.query(response, `$.Data.LiveMatchesTournamentsOrdered[${tournamentIndex}]`);

			if (tournament.length == 0) {
				break;
			}

			tournament = tournament[0];

			for (let matchIndex = 0; ; matchIndex++) {
				let match = jp.query(tournament, `$.LiveMatches[${matchIndex}]`);

				if (match.length == 0) {
					break;
				}

				match = match[0];

				let eventID = `${tournament.EventYear}-${tournament.EventId}`;
				let eventTitle = tournament.EventTitle;
				let player = jp.query(match, `$.PlayerTeam.Player`)[0];
				let opponent = jp.query(match, `$.OpponentTeam.Player`)[0];

				let row = {};
				row.event = eventID;
				row.title = eventTitle;
				row.player = {};
				row.opponent = {};

				row.player.id = player.PlayerId;
				row.player.name = `${player.PlayerFirstName} ${player.PlayerLastName}`;

				row.opponent.id = opponent.PlayerId;
				row.opponent.name = `${opponent.PlayerFirstName} ${opponent.PlayerLastName}`;

				result.push(row);
			}
		}

		return result;
	}
}


function Component() {
	const queryKey = 'LiveFetcher';
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		console.log('FETFCHING');
		let fetcher = new LiveFetcher();

		let details = await fetcher.fetch();
		console.log(details);
		return {details};
	}

	function Content() {
		if (!response) {
			return;
		}
		return (
			<p>{response.details}</p>
		);
	}


	return (
			<Page>
				<Menu />
				<Page.Container >
					<h1 className='pb-2'>Debug</h1>
					<p />
					<Content />
				</Page.Container>
			</Page>
	);
}

export default Component;
