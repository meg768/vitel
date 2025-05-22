import Page from '../../components/page';
import Menu from '../../components/menu';
import Button from '../../components/ui/button';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
	const surfaceThemes = {
		hard: 'Cement',
		clay: 'Grus',
		grass: 'Gräs'
	};

	const colorModes = {
		light: 'Ljust',
		dark: 'Mörkt'
	};

	const themeClasses = ['light', 'dark', 'hard', 'clay', 'grass'];

	const [activeSurface, setActiveSurface] = useState('hard');
	const [activeMode, setActiveMode] = useState('light');

	useEffect(() => {
		const stored = localStorage.getItem('theme');
		if (stored) {
			const parts = stored.split(' ');
			if (parts.length === 2) {
				const [mode, surface] = parts;
				if (colorModes[mode] && surfaceThemes[surface]) {
					setActiveMode(mode);
					setActiveSurface(surface);
					applyClasses(mode, surface);
					return;
				}
			}
		}
		applyClasses(activeMode, activeSurface);
	}, []);

	function applyClasses(mode, surface) {
		const root = document.getElementById('root');
		if (!root) return;

		root.classList.remove(...themeClasses);
		root.classList.add(mode, surface);
		localStorage.setItem('theme', `${mode} ${surface}`);
	}

	function changeSurfaceTheme(surface) {
		setActiveSurface(surface);
		applyClasses(activeMode, surface);
	}

	function changeColorMode(mode) {
		setActiveMode(mode);
		applyClasses(mode, activeSurface);
	}

	function SurfaceSelector() {
		return (
			<div>
				<Page.Title level={3}>Underlag</Page.Title>
				<div className='flex gap-2'>
					{Object.entries(surfaceThemes).map(([key, label]) => (
						<Button key={key} onClick={() => changeSurfaceTheme(key)} className={`${activeSurface === key ? 'bg-primary-400!' : 'bg-primary-600'}`}>
							{label}
						</Button>
					))}
				</div>
			</div>
		);
	}

	function ColorModeSelector() {
		return (
			<div>
				<Page.Title level={3}>Färg</Page.Title>
				<div className='flex gap-2'>
					{Object.entries(colorModes).map(([key, label]) => (
						<Button key={key} onClick={() => changeColorMode(key)} className={`${activeMode === key ? 'bg-primary-400!' : 'bg-primary-600'}`}>
							{label}
						</Button>
					))}
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
