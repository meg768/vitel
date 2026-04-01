import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router';

import App from './pages/app';
import Event from './pages/event';
import Events from './pages/events';
import HeadToHead from './pages/head-to-head';
import HeadToHeadDetails from './pages/head-to-head-details';
import Live from './pages/live';
import Log from './pages/log';
import MarketScannerDaily from './pages/market-scanner-daily';
import Matches from './pages/matches';
import NotFound from './pages/not-found';
import Oddset from './pages/oddset';
import Player from './pages/player';
import Players from './pages/players';
import QnA from './pages/qna';
import Query from './pages/query';
import Search from './pages/search';
import Scoreboard from './pages/scoreboard';
import Settings from './pages/settings';
import Trial from './pages/trial';
import { theme } from './js/theme';

// Application entrypoint: handles bootstrapping, theme setup, and route rendering.
class WebApp {
	constructor({ rootId = 'root' } = {}) {
		// Theme classes are applied to body, so the app is mounted on body as well.
		this.rootElement = document.body;
		// Keep rootId fallback for quick switch back to #root mounting if needed.
		//this.rootElement = document.getElementById(rootId);
		// Classes that may be toggled by theme/surface handling.
		this.themeClasses = theme.classes;
		this.mql = null;

		// Load persisted theme and apply it before first render.
		this.theme = this.getInitialTheme();
		this.applyTheme(this.theme);
		this.setupKeyboardShortcuts();

		this.root = ReactDOM.createRoot(this.rootElement);
	}

	getInitialTheme() {
		// Stored format: "<mode> <surface>", e.g. "dark clay".
		let themeValue = localStorage.getItem('theme');

		// Accept any valid "mode surface" combination.
		if (!themeValue || !this.isValidTheme(themeValue)) {
			themeValue = this.getDefaultTheme();
			localStorage.setItem('theme', themeValue);
		}

		return themeValue;
	}

	isValidTheme(themeValue) {
		return theme.validTheme.test(themeValue);
	}

	getDefaultTheme() {
		return theme.defaultTheme;
	}

	applyTheme(themeValue) {
		const root = this.rootElement;
		if (!root) return;

		// Remove all known theme/surface classes, then apply current selection.
		root.classList.remove(...this.themeClasses);

		const { mode, surface, resolvedMode, resolvedSurface } = theme.resolve(themeValue, {
			prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
		});

		root.classList.add(resolvedMode);
		if (resolvedSurface) root.classList.add(resolvedSurface);

		// In auto mode we subscribe to system theme changes.
		if (mode === 'auto') {
			this.setupAutoListener(surface);
		}
	}

	setTheme(themeValue) {
		const normalizedTheme = theme.normalizeTheme(themeValue);

		this.theme = normalizedTheme;
		localStorage.setItem('theme', normalizedTheme);
		this.applyTheme(normalizedTheme);
		window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: normalizedTheme } }));
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

	setupKeyboardShortcuts() {
		window.addEventListener('keydown', event => {
			if (event.defaultPrevented) {
				return;
			}

			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
				return;
			}

			if (event.key === 'F6') {
				event.preventDefault();
				this.toggleThemeMode();
				return;
			}

			if (event.key === 'F3') {
				event.preventDefault();
				this.toggleThemeSurface();
				return;
			}

			if (event.key === 'F4') {
				event.preventDefault();
				window.location.hash = '#/search';
			}
		});
	}

	toggleThemeMode() {
		const storedTheme = localStorage.getItem('theme');
		const currentTheme = theme.normalizeTheme(storedTheme ?? this.theme);
		const { surface, resolvedMode } = theme.resolve(currentTheme, {
			prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
		});
		const nextMode = resolvedMode === 'dark' ? 'light' : 'dark';

		this.setTheme(`${nextMode} ${surface}`);
	}

	toggleThemeSurface() {
		const storedTheme = localStorage.getItem('theme');
		const currentTheme = theme.normalizeTheme(storedTheme ?? this.theme);
		const { mode, resolvedSurface } = theme.resolve(currentTheme, {
			prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
		});
		const surfaces = ['hard', 'grass', 'clay'];
		const currentSurfaceIndex = surfaces.indexOf(resolvedSurface);
		const nextSurfaceIndex = currentSurfaceIndex === -1 ? 0 : (currentSurfaceIndex + 1) % surfaces.length;
		const nextSurface = surfaces[nextSurfaceIndex];

		this.setTheme(`${mode} ${nextSurface}`);
	}

	toggleTheme() {
		// Optional: implement if you want to cycle through themes
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
						<Route path='/head-to-head/:A/:B' element={<HeadToHead />} />
						<Route path='/head-to-head-details/:A/:B' element={<HeadToHeadDetails />} />
						<Route path='/event/:id' element={<Event />} />
						<Route path='/player/:id' element={<Player />} />
						<Route path='/events' element={<Events />} />
						<Route path='/players' element={<Players />} />
						<Route path='/search' element={<Search />} />
						<Route path='/live' element={<Live />} />
						<Route path='/oddset' element={<Oddset />} />
						<Route path='/matches' element={<Matches />} />
						<Route path='/scoreboard' element={<Scoreboard />} />
						<Route path='/scoreboard/:A/:B' element={<Scoreboard />} />
						<Route path='/log' element={<Log />} />
						<Route path='/market-scanner-daily' element={<MarketScannerDaily />} />
						<Route path='/qna' element={<QnA />} />
						<Route path='/trial' element={<Trial />} />
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
