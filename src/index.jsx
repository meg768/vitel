import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router';

import App from './pages/app';
import Event from './pages/event';
import Events from './pages/events';
import HeadToHead from './pages/head-to-head';
import Live from './pages/live';
import LiveMatch from './pages/live-match';
import Log from './pages/log';
import NotFound from './pages/not-found';
import Oddset from './pages/oddset';
import Player from './pages/player';
import Players from './pages/players';
import QnA from './pages/qna';
import Query from './pages/query';
import Ranking from './pages/ranking';
import Settings from './pages/settings';

// Application entrypoint: handles bootstrapping, theme setup, and route rendering.
class WebApp {
	constructor({ rootId = 'root' } = {}) {
		// Theme classes are applied to body, so the app is mounted on body as well.
		this.rootElement = document.body;
		// Keep rootId fallback for quick switch back to #root mounting if needed.
		//this.rootElement = document.getElementById(rootId);
		// Classes that may be toggled by theme/surface handling.
		this.themeClasses = ['dark', 'light', 'clay', 'grass', 'hard'];
		this.mql = null;

		// Load persisted theme and apply it before first render.
		this.theme = this.getInitialTheme();
		this.applyTheme(this.theme);

		this.root = ReactDOM.createRoot(this.rootElement);
	}

	getInitialTheme() {
		// Stored format: "<mode> <surface>", e.g. "dark clay".
		let theme = localStorage.getItem('theme');

		// Accept any valid "mode surface" combination.
		const validTheme = /^(light|dark|auto) (hard|clay|grass|auto)$/;

		if (!theme || !validTheme.test(theme)) {
			let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			// Current product default overrides system preference.
			prefersDark = false;
			theme = prefersDark ? 'dark hard' : 'light hard';
			localStorage.setItem('theme', theme);
		}

		return theme;
	}

	applyTheme(theme) {
		function getAutomaticSurface(date = new Date()) {
			const month = date.getMonth() + 1;
			const day = date.getDate();
			const md = month * 100 + day;

			if (md >= 401 && md <= 615) {
				return 'clay';
			}

			if (md >= 616 && md <= 720) {
				return 'grass';
			}

			return 'hard';
		}

		const root = this.rootElement;
		if (!root) return;

		// Remove all known theme/surface classes, then apply current selection.
		root.classList.remove(...this.themeClasses);

		const [mode, surface] = theme.split(' ');
		const resolvedSurface = surface === 'auto' ? getAutomaticSurface() : surface;

		// "auto" resolves to current OS preference.
		const resolvedMode = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

		root.classList.add(resolvedMode);
		if (resolvedSurface) root.classList.add(resolvedSurface);

		// In auto mode we subscribe to system theme changes.
		if (mode === 'auto') {
			this.setupAutoListener(surface);
		}
	}

	setupAutoListener(surface) {
		// Ensure we never keep multiple listeners alive.
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
		// Optional: implement if you want to cycle through themes
		console.warn('toggleTheme not implemented for flexible theme list');
	}

	render(element) {
		this.root.render(element);
	}

	run() {
		// App providers and all client-side routes are wired here.
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
							<Route path='/oddset' element={<Oddset />} />
							<Route path='/live-matches' element={<LiveMatch />} />
							<Route path='/live-matches/:A/:B' element={<LiveMatch />} />
							<Route path='/log' element={<Log />} />
							<Route path='/qna' element={<QnA />} />
						<Route path='/settings' element={<Settings />} />
						<Route path='/not-found' element={<NotFound />} />
						<Route path='/query/:name' element={<Query />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</HashRouter>
			</QueryClientProvider>
		);
	}
}

const app = new WebApp();
app.run();

export default app;
