import { useState, useEffect } from 'react';

import Page from '../../components/page';
import Menu from '../../components/menu';
import Button from '../../components/ui/button';
import clsx from 'clsx';
import ToggleGroup from '../../components/ui/toggle-group.jsx';

export default function SettingsPage() {
	const themeClasses = ['light', 'dark', 'hard', 'clay', 'grass', 'auto'];

	const [activeSurface, setActiveSurface] = useState(null);
	const [activeMode, setActiveMode] = useState(null);
	const [initialized, setInitialized] = useState(false);

	// Load theme from localStorage on first mount
	useEffect(() => {
		const stored = localStorage.getItem('theme');
		if (stored) {
			const parts = stored.split(' ');
			if (parts.length === 2) {
				const [mode, surface] = parts;
				setActiveMode(mode);
				setActiveSurface(surface);
			}
		}
		setInitialized(true);
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

		root.classList.remove(...themeClasses);

		const effectiveMode = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

		root.classList.add(effectiveMode);
		root.classList.add(surface);

		localStorage.setItem('theme', `${mode} ${surface}`);
	}

	function SurfaceSelector() {
		return (
			<div>
				<Page.Title level={4}>Underlag</Page.Title>
				<ToggleGroup defaultValue={activeSurface} onChange={setActiveSurface}>
					<ToggleGroup.Item value='hard'>Hardcourt</ToggleGroup.Item>
					<ToggleGroup.Item value='clay'>Grus</ToggleGroup.Item>
					<ToggleGroup.Item value='grass'>Gräs</ToggleGroup.Item>
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
				<Button className='' link={'/log'}>
					Visa logg senaste dygnet
				</Button>
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
