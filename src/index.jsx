import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router';

import ABC from './pages/abc';
import App from './pages/app';
import Currently from './pages/currently';
import Event from './pages/event';
import Events from './pages/events';
import HeadToHead from './pages/head-to-head';
import Live from './pages/live';
import Log from './pages/log';
import NotFound from './pages/not-found';
import Player from './pages/player';
import Players from './pages/players';
import QnA from './pages/qna';
import Query from './pages/query';
import Ranking from './pages/ranking';
import Settings from './pages/settings';
import Trial from './pages/trial';

class WebApp {
	constructor({ rootId = 'root' } = {}) {
		this.rootElement = document.body;
		//this.rootElement = document.getElementById(rootId);
		this.themeClasses = ['dark', 'light', 'clay', 'grass', 'hard'];
		this.mql = null;

		this.theme = this.getInitialTheme();
		this.applyTheme(this.theme);

		this.root = ReactDOM.createRoot(this.rootElement);
	}

	getInitialTheme() {
		let theme = localStorage.getItem('theme');

		// Accept any valid "mode surface" combination
		const validTheme = /^(light|dark|auto) (hard|clay|grass)$/;

		if (!theme || !validTheme.test(theme)) {
			let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			prefersDark = false;
			theme = prefersDark ? 'dark hard' : 'light hard';
			localStorage.setItem('theme', theme);
		}

		return theme;
	}

	applyTheme(theme) {
		const root = this.rootElement;
		if (!root) return;

		root.classList.remove(...this.themeClasses);

		const [mode, surface] = theme.split(' ');

		const resolvedMode = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

		root.classList.add(resolvedMode);
		if (surface) root.classList.add(surface);

		if (mode === 'auto') {
			this.setupAutoListener(surface);
		}
	}

	setupAutoListener(surface) {
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
						<Route path='/qna' element={<QnA />} />
						<Route path='/settings' element={<Settings />} />
						<Route path='/not-found' element={<NotFound />} />
						<Route path='/query/:name' element={<Query />} />
						<Route path='/currently' element={<Currently />} />
						<Route path='/abc' element={<ABC />} />
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
