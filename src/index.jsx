import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Player from './pages/player';
import HeadToHead from './pages/head-to-head';
import Tourney from './pages/tourney';
import Trial from './pages/trial';

import App from './app.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={new QueryClient()}>
		<HashRouter>
			<Routes>
				<Route path='/' element={<App />} />
				<Route path='/head-to-head/:A/:B' element={<HeadToHead />} />
				<Route path='/tourney/:date/:tournament' element={<Tourney />} />
				<Route path='/player/:name' element={<Player />} />
				<Route path='/trial' element={<Trial />} />
			</Routes>
		</HashRouter>
	</QueryClientProvider>
);
