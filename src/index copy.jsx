import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Player from './pages/player';
import HeadToHead from './pages/head-to-head';
import Event from './pages/event';
import Ranking from './pages/ranking';
import Events from './pages/events';
import Players from './pages/players';
import Live from './pages/live';
import Log from './pages/log';
import App from './app.jsx';

function setLightDarkMode() {
	const root = document.getElementById('root');
	let theme = localStorage.getItem('theme');

	if (!theme) {
		theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
	}

	if (theme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
}

setLightDarkMode();

let foo = ReactDOM.createRoot(document.getElementById('root'));


foo.render(
	<QueryClientProvider client={new QueryClient()}>
		<HashRouter>
			<Routes>
				<Route path='/' element={<App />} />
				<Route path='/head-to-head/:A/:B' element={<HeadToHead />} />
				<Route path='/event/:id' element={<Event />} />
				<Route path='/player/:id' element={<Player />} />
				<Route path='/ranking' element={<Ranking />} />
				<Route path='/events' element={<Events />} />
				<Route path='/players' element={<Players />} />
				<Route path='/live' element={<Live />} />
				<Route path='/log' element={<Log />} />
			</Routes>
		</HashRouter>
	</QueryClientProvider>
);
