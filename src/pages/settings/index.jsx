import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import ClockIcon from '../../assets/radix-icons/clock.svg?react';
import EyeOpenIcon from '../../assets/radix-icons/eye-open.svg?react';
import GearIcon from '../../assets/radix-icons/gear.svg?react';
import MixerIcon from '../../assets/radix-icons/mixer-horizontal.svg?react';
import TrashIcon from '../../assets/radix-icons/trash.svg?react';
import UpdateIcon from '../../assets/radix-icons/update.svg?react';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import ToggleGroup from '../../components/ui/toggle-group.jsx';
import {
	DEFAULT_MATCHES_REFRESH_SECONDS,
	DEFAULT_SCOREBOARD_REFRESH_SECONDS,
	MATCHES_REFRESH_KEY,
	SCOREBOARD_REFRESH_KEY,
	readRefreshSeconds,
	writeRefreshSeconds
} from '../../js/refresh-settings.js';
import { theme } from '../../js/theme';
import { service } from '../../js/vitel';

const refreshOptions = [
	{ value: '10', label: '10 sek' },
	{ value: '30', label: '30 sek' },
	{ value: '60', label: '1 min' }
];

function SettingRow({ icon: Icon, title, description, children }) {
	return (
		<div className='grid gap-3 border-b border-primary-300 px-4 py-4 last:border-b-0 dark:border-primary-700 md:grid-cols-[minmax(15rem,1fr)_auto] md:items-center'>
			<div className='flex min-w-0 items-start gap-3 bg-transparent'>
				<Icon className='mt-0.5 h-5 w-5 shrink-0 bg-transparent text-primary-700 dark:text-primary-300' />
				<div className='min-w-0 bg-transparent'>
					<div className='font-semibold text-primary-950 dark:text-primary-50'>{title}</div>
					<div className='mt-0.5 text-sm text-primary-700 dark:text-primary-300'>{description}</div>
				</div>
			</div>
			<div className='ml-8 flex flex-wrap items-center gap-2 bg-transparent md:ml-0 md:justify-end'>{children}</div>
		</div>
	);
}

function Section({ title, children }) {
	return (
		<section>
			<Page.Title level={3}>{title}</Page.Title>
			<div className='overflow-hidden rounded-lg border border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900'>
				{children}
			</div>
		</section>
	);
}

function RefreshSelector({ value, onChange }) {
	return (
		<ToggleGroup value={value} onChange={onChange}>
			{refreshOptions.map(option => (
				<ToggleGroup.Item key={option.value} value={option.value}>{option.label}</ToggleGroup.Item>
			))}
		</ToggleGroup>
	);
}

export default function SettingsPage() {
	const queryClient = useQueryClient();
	const [activeSurface, setActiveSurface] = useState('auto');
	const [activeMode, setActiveMode] = useState('auto');
	const [initialized, setInitialized] = useState(false);
	const [isClearingLog, setIsClearingLog] = useState(false);
	const [logMessage, setLogMessage] = useState(null);
	const [matchesRefresh, setMatchesRefresh] = useState(() => String(readRefreshSeconds(MATCHES_REFRESH_KEY, DEFAULT_MATCHES_REFRESH_SECONDS)));
	const [scoreboardRefresh, setScoreboardRefresh] = useState(() => String(readRefreshSeconds(SCOREBOARD_REFRESH_KEY, DEFAULT_SCOREBOARD_REFRESH_SECONDS)));

	useEffect(() => {
		const stored = localStorage.getItem('theme');
		const themeValue = stored && theme.validTheme.test(stored) ? stored : theme.defaultTheme;
		const [mode, surface] = themeValue.split(' ');
		setActiveMode(mode);
		setActiveSurface(surface);
		if (!stored || !theme.validTheme.test(stored)) localStorage.setItem('theme', themeValue);
		setInitialized(true);
	}, []);

	useEffect(() => {
		function onThemeChange(event) {
			const themeValue = event.detail?.theme;
			if (!themeValue || !theme.validTheme.test(themeValue)) return;
			const [mode, surface] = themeValue.split(' ');
			setActiveMode(mode);
			setActiveSurface(surface);
		}

		window.addEventListener('themechange', onThemeChange);
		return () => window.removeEventListener('themechange', onThemeChange);
	}, []);

	useEffect(() => {
		if (!initialized || !activeMode || !activeSurface) return;
		const root = document.body;
		root.classList.remove(...theme.classes);
		const { resolvedMode, resolvedSurface } = theme.resolve(`${activeMode} ${activeSurface}`, {
			prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
		});
		root.classList.add(resolvedMode, resolvedSurface);
		const themeValue = `${activeMode} ${activeSurface}`;
		localStorage.setItem('theme', themeValue);
		window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeValue } }));
	}, [activeMode, activeSurface, initialized]);

	useEffect(() => {
		if (activeMode !== 'auto') return;
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const apply = () => {
			document.body.classList.remove('light', 'dark');
			document.body.classList.add(mql.matches ? 'dark' : 'light');
		};
		apply();
		mql.addEventListener('change', apply);
		return () => mql.removeEventListener('change', apply);
	}, [activeMode]);

	function updateRefresh(key, value, setter) {
		writeRefreshSeconds(key, value);
		setter(value);
	}

	async function clearLog() {
		if (isClearingLog || !window.confirm('Vill du rensa hela loggen?')) return;
		setIsClearingLog(true);
		setLogMessage(null);

		try {
			const result = await service.delete('log');
			queryClient.removeQueries({ queryKey: ['request'] });
			setLogMessage(`${result.deletedRows ?? 0} loggrader raderades.`);
		} catch (error) {
			setLogMessage(`Kunde inte rensa loggen: ${error.message}`);
		} finally {
			setIsClearingLog(false);
		}
	}

	return (
		<Page id='settings-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='gap-2'>
					<GearIcon className='h-7 w-7 shrink-0 bg-transparent' aria-hidden='true' />
					<span className='bg-transparent'>Inställningar</span>
				</Page.Title>
				<Page.Container className='space-y-7 pb-8!'>
					<Section title='Utseende'>
						<SettingRow icon={EyeOpenIcon} title='Färgläge' description='Följ systemet eller välj ett fast ljust eller mörkt läge.'>
							<ToggleGroup value={activeMode} onChange={setActiveMode}>
								<ToggleGroup.Item value='light'>Ljust</ToggleGroup.Item>
								<ToggleGroup.Item value='dark'>Mörkt</ToggleGroup.Item>
								<ToggleGroup.Item value='auto'>Auto</ToggleGroup.Item>
							</ToggleGroup>
						</SettingRow>
						<SettingRow icon={MixerIcon} title='Underlag' description='Styr färgtemat manuellt eller låt tennissäsongen välja.'>
							<ToggleGroup value={activeSurface} onChange={setActiveSurface}>
								<ToggleGroup.Item value='hard'>Hardcourt</ToggleGroup.Item>
								<ToggleGroup.Item value='clay'>Grus</ToggleGroup.Item>
								<ToggleGroup.Item value='grass'>Gräs</ToggleGroup.Item>
								<ToggleGroup.Item value='auto'>Auto</ToggleGroup.Item>
							</ToggleGroup>
						</SettingRow>
					</Section>

					<Section title='Uppdateringar'>
						<SettingRow icon={UpdateIcon} title='Matcher' description='Hur ofta matchlistan hämtar aktuella odds och matchstatus.'>
							<RefreshSelector value={matchesRefresh} onChange={value => updateRefresh(MATCHES_REFRESH_KEY, value, setMatchesRefresh)} />
						</SettingRow>
						<SettingRow icon={ClockIcon} title='Scoreboard' description='Hur ofta livevyn hämtar en ny ställning.'>
							<RefreshSelector value={scoreboardRefresh} onChange={value => updateRefresh(SCOREBOARD_REFRESH_KEY, value, setScoreboardRefresh)} />
						</SettingRow>
					</Section>

					<Section title='Diagnostik'>
						<SettingRow icon={EyeOpenIcon} title='Logg' description='Visa backendens aktivitet under det senaste dygnet.'>
							<Button link='/log'>Visa logg</Button>
						</SettingRow>
						<SettingRow icon={TrashIcon} title='Rensa loggen' description={logMessage || 'Tar bort samtliga poster ur backendens loggtabell.'}>
							<Button onClick={clearLog} disabled={isClearingLog}>{isClearingLog ? 'Rensar…' : 'Rensa'}</Button>
						</SettingRow>
						<SettingRow icon={MixerIcon} title='Testsida' description='Öppna den interna sidan för komponent- och layouttester.'>
							<Button link='/trial'>Öppna</Button>
						</SettingRow>
					</Section>
				</Page.Container>
			</Page.Content>
		</Page>
	);
}
