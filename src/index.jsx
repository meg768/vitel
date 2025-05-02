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
import App from './pages/app';

class WebApp {
	constructor({ rootId = 'root' } = {}) {
		this.rootElement = document.getElementById(rootId);
		this.theme = this.getInitialTheme();
		this.applyTheme();
		this.root = ReactDOM.createRoot(this.rootElement); // Create root *after* theme is set
	}

	getInitialTheme() {
		let saved = localStorage.getItem('theme');
		if (!saved) {
			//saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			saved = 'dark';
			localStorage.setItem('theme', saved);
		}
		return saved;
	}

	applyTheme() {
		if (this.theme === 'dark') {
			this.rootElement.classList.add('dark');
		} else {
			this.rootElement.classList.remove('dark');
		}
	}

	toggleTheme() {
		this.theme = this.theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', this.theme);
		this.applyTheme();
	}

	render(element) {
		this.root.render(element);
	}

	run() {
		this.render(
			<QueryClientProvider client={new QueryClient()}>
				<HashRouter>
					<Routes>
						<Route path='/' element={<App />} />
						<Route path='/app' element={<App />} />
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
	}
}

const app = new WebApp();
app.run();

export default app;
