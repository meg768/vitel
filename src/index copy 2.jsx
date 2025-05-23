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
import Settings from './pages/settings';
class WebApp {
	constructor({ rootId = 'root' } = {}) {
		this.rootElement = document.getElementById(rootId);
		this.themes = ['dark', 'light', 'auto', 'light clay', 'dark clay', 'auto clay', 'light grass', 'dark grass', 'auto grass'];
		this.themeClasses = ['dark', 'light', 'clay', 'grass'];
		this.mql = null;

		this.theme = this.getInitialTheme();
		this.applyTheme(this.theme);

		this.root = ReactDOM.createRoot(this.rootElement);
	}

	getInitialTheme() {
		let theme = localStorage.getItem('theme');

		// fallback
		if (!this.themes.includes(theme)) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'dark' : 'light';
			localStorage.setItem('theme', theme);
		}

		return theme;
	}

	applyTheme(theme) {
		const root = this.rootElement;
		if (!root) return;

		// Remove all known theme classes
		root.classList.remove(...this.themeClasses);

		// Split the theme into mode + surface
		const [mode, surface] = theme.split(' ');

		// If "auto", determine from system
		const resolvedMode = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

		// Apply new classes
		root.classList.add(resolvedMode);
		if (surface) root.classList.add(surface);

		// If mode is auto, set up listener
		if (mode === 'auto') {
			this.setupAutoListener(surface);
		}
	}

	setupAutoListener(surface) {
		// Clean up previous listener
		if (this.mql) {
			this.mql.removeEventListener('change', this._autoListener);
		}

		this.mql = window.matchMedia('(prefers-color-scheme: dark)');
		this._autoListener = e => {
			const mode = e.matches ? 'dark' : 'light';
			this.applyTheme(`${mode} ${surface}`);
		};

		this.mql.addEventListener('change', this._autoListener);
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
						<Route path='/settings' element={<Settings />} />
					</Routes>
				</HashRouter>
			</QueryClientProvider>
		);
	}
}

const app = new WebApp();
app.run();

export default app;
