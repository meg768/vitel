import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import hash from 'object-hash';

import Menu from '../../components/menu';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import ToggleGroup from '../../components/ui/toggle-group.jsx';
import { theme } from '../../js/theme';
import { service } from '../../js/vitel';

const LOG_SQL = `SELECT * FROM log WHERE timestamp >= CURDATE() - INTERVAL 1 DAY ORDER BY timestamp ASC;`;

export default function SettingsPage() {
	const queryClient = useQueryClient();

	const [activeSurface, setActiveSurface] = useState('auto');
	const [activeMode, setActiveMode] = useState('auto');
	const [initialized, setInitialized] = useState(false);
	const [isClearingLog, setIsClearingLog] = useState(false);

	// Load theme from localStorage on first mount
	useEffect(() => {
		const stored = localStorage.getItem('theme');
		const themeValue = stored && theme.validTheme.test(stored) ? stored : theme.defaultTheme;
		const [mode, surface] = themeValue.split(' ');

		setActiveMode(mode);
		setActiveSurface(surface);

		if (!stored || !theme.validTheme.test(stored)) {
			localStorage.setItem('theme', themeValue);
		}

		setInitialized(true);
	}, []);

	useEffect(() => {
		function onThemeChange(event) {
			const themeValue = event.detail?.theme;
			if (!themeValue || !theme.validTheme.test(themeValue)) {
				return;
			}

			const [mode, surface] = themeValue.split(' ');
			setActiveMode(mode);
			setActiveSurface(surface);
		}

		window.addEventListener('themechange', onThemeChange);

		return () => {
			window.removeEventListener('themechange', onThemeChange);
		};
	}, []);

	// Apply theme once values are set
	useEffect(() => {
		if (!initialized || !activeMode || !activeSurface) return;
		applyClasses(activeMode, activeSurface);
	}, [activeMode, activeSurface, initialized]);

	// If "auto", listen for system preference changes
	useEffect(() => {
		if (activeMode === 'auto') {
			const mql = window.matchMedia('(prefers-color-scheme: dark)');
			const apply = () => {
				const root = document.body;
				if (!root) return;
				root.classList.remove('light', 'dark');
				root.classList.add(mql.matches ? 'dark' : 'light');
			};
			apply();
			mql.addEventListener('change', apply);
			return () => mql.removeEventListener('change', apply);
		}
	}, [activeMode]);

	function applyClasses(mode, surface) {
		const root = document.body;
		if (!root) return;

		root.classList.remove(...theme.classes);

		const { resolvedMode, resolvedSurface } = theme.resolve(`${mode} ${surface}`, {
			prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
		});

		root.classList.add(resolvedMode);
		root.classList.add(resolvedSurface);

		const themeValue = `${mode} ${surface}`;

		localStorage.setItem('theme', themeValue);
		window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeValue } }));
	}

	function getLogQueryKey() {
		return ['request', hash({ path: 'query', method: 'POST', body: JSON.stringify({ sql: LOG_SQL, format: [] }) })];
	}

	async function clearLog() {
		if (isClearingLog || !window.confirm('Vill du rensa loggen?')) {
			return;
		}

		setIsClearingLog(true);

		try {
			await service.query({ sql: 'DELETE FROM log;' });
			queryClient.removeQueries({ queryKey: getLogQueryKey() });
		} catch (error) {
			console.error(error);
		} finally {
			setIsClearingLog(false);
		}
	}

	function SurfaceSelector() {
		return (
			<div>
				<Page.Title level={4}>Underlag</Page.Title>
					<ToggleGroup defaultValue={activeSurface} onChange={setActiveSurface}>
						<ToggleGroup.Item value='hard'>Hardcourt</ToggleGroup.Item>
						<ToggleGroup.Item value='clay'>Grus</ToggleGroup.Item>
						<ToggleGroup.Item value='grass'>Gräs</ToggleGroup.Item>
						<ToggleGroup.Item value='auto'>Automatiskt</ToggleGroup.Item>
					</ToggleGroup>
				</div>
			);
		}

	function ColorModeSelector() {
		return (
			<div>
				<Page.Title level={4}>Färgläge</Page.Title>
				<ToggleGroup defaultValue={activeMode} onChange={setActiveMode}>
					<ToggleGroup.Item value='light'>Ljust</ToggleGroup.Item>
					<ToggleGroup.Item value='dark'>Mörkt</ToggleGroup.Item>
					<ToggleGroup.Item value='auto'>Automatiskt</ToggleGroup.Item>
				</ToggleGroup>
			</div>
		);
	}

	function LogButton() {
		return (
			<div>
				<Page.Title level={4}>Felsökning</Page.Title>
				<div className='flex flex-col items-start gap-2'>
					<Button className='' link={'/trial'}>
						Visa testsida
					</Button>
					<Button className='' link={'/log'}>
						Visa logg senaste dygnet
					</Button>
					<Button className='' onClick={clearLog} disabled={isClearingLog}>
						Rensa loggen
					</Button>
				</div>
			</div>
		);
	}

	function Content() {
		return (
			<>
				<Page.Title>Inställningar</Page.Title>
				<Page.Container className='space-y-6'>
					<ColorModeSelector />
					<SurfaceSelector />
					<LogButton />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='settings-page'>
			<Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}
