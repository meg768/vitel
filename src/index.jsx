import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Player from './pages/player';
import HeadToHead from './pages/head-to-head';
import Event from './pages/event';
import Ranking from './pages/ranking';
import Trial from './pages/trial';
import Events from './pages/events';
import Players from './pages/players';

import App from './app.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
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
				<Route path='/trial' element={<Trial />} />
			</Routes>
		</HashRouter>
	</QueryClientProvider>
);
