import Page from '../../components/page';
import Menu from '../../components/menu';
import { useState, useEffect } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

export default function SettingsPage() {
	const surfaceThemes = {
		hard: 'Cement',
		clay: 'Grus',
		grass: 'Gräs'
	};

	const colorModes = {
		light: 'Ljust',
		dark: 'Mörkt',
		auto: 'Automatiskt'
	};

	const themeClasses = ['light', 'dark', 'hard', 'clay', 'grass'];

	const [activeSurface, setActiveSurface] = useState('hard');
	const [activeMode, setActiveMode] = useState('light');

	// Load theme from localStorage on first mount
	useEffect(() => {
		const stored = localStorage.getItem('theme');
		if (stored) {
			const parts = stored.split(' ');
			if (parts.length === 2) {
				const [mode, surface] = parts;
				if (colorModes[mode] && surfaceThemes[surface]) {
					setActiveMode(mode);
					setActiveSurface(surface);
					return;
				}
			}
		}
	}, []);

	// Apply theme whenever either value changes
	useEffect(() => {
		applyClasses(activeMode, activeSurface);
	}, [activeMode, activeSurface]);

	// If "auto", listen for system preference changes
	useEffect(() => {
		if (activeMode === 'auto') {
			const mql = window.matchMedia('(prefers-color-scheme: dark)');
			const apply = () => {
				const root = document.getElementById('root');
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
		const root = document.getElementById('root');
		if (!root) return;

		root.classList.remove(...themeClasses);

		const effectiveMode = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

		root.classList.add(effectiveMode);
		root.classList.add(surface);

		localStorage.setItem('theme', `${mode} ${surface}`);
	}
	
	function handleSurfaceChange(value) {
		if (value) setActiveSurface(value);
	}

	function handleColorChange(value) {
		if (value) setActiveMode(value);
	}

	function SurfaceSelector() {
		return (
			<div>
				<Page.Title level={3}>Underlag</Page.Title>
				<ToggleGroup.Root type='single' value={activeSurface} onValueChange={handleSurfaceChange} className='flex gap-2'>
					{Object.entries(surfaceThemes).map(([key, label]) => (
						<ToggleGroup.Item
							key={key}
							value={key}
							className={`px-4 py-2 rounded-sm border text-sm cursor-pointer transition ${
								activeSurface === key ? 'bg-primary-600 text-primary-100' : 'bg-primary-100 text-primary-900'
							}`}
						>
							{label}
						</ToggleGroup.Item>
					))}
				</ToggleGroup.Root>
			</div>
		);
	}

	function ColorModeSelector() {
		return (
			<div>
				<Page.Title level={3}>Färgläge</Page.Title>
				<ToggleGroup.Root type='single' value={activeMode} onValueChange={handleColorChange} className='flex gap-2'>
					{Object.entries(colorModes).map(([key, label]) => (
						<ToggleGroup.Item
							key={key}
							value={key}
							className={`px-4 py-2 rounded-sm border text-sm cursor-pointer transition ${
								activeMode === key ? 'bg-primary-600 text-primary-100' : 'bg-primary-100 text-primary-900'
							}`}
						>
							{label}
						</ToggleGroup.Item>
					))}
				</ToggleGroup.Root>
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
