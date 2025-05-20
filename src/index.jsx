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
import Trial from './pages/trial';

class WebApp {
	constructor({ rootId = 'root' } = {}) {
		this.rootElement = document.getElementById(rootId);
		this.themes = ['dark', 'light', 'light clay', 'dark clay', 'light grass', 'dark grass'];
		this.themeClasses = ['dark', 'light', 'clay', 'grass'];

		this.theme = this.getInitialTheme();
		this.applyTheme(this.theme);

		// Create root *after* theme is set
		this.root = ReactDOM.createRoot(this.rootElement);
	}

	getInitialTheme() {
		let theme = localStorage.getItem('theme');

		if (!this.themes.includes(theme)) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'dark' : 'light';
			localStorage.setItem('theme', theme);
		}

		return theme;
	}

	applyTheme(classList) {
		const themes = classList.split(/\s+/);

		this.rootElement.classList.remove(...this.themeClasses);
		this.rootElement.classList.add(...themes);
	}

	toggleTheme() {
		let themeIndex = (this.themes.indexOf(this.theme) + 1) % this.themes.length;
		this.theme = this.themes[themeIndex];

		this.applyTheme(this.theme);
		localStorage.setItem('theme', this.theme);
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
						<Route path='/trial' element={<Trial />} />
					</Routes>
				</HashRouter>
			</QueryClientProvider>
		);
	}
}

const app = new WebApp();
app.run();

export default app;
