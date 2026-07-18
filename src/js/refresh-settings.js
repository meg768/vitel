import { useSyncExternalStore } from 'react';

const MATCHES_REFRESH_KEY = 'refresh.matches';
const SCOREBOARD_REFRESH_KEY = 'refresh.scoreboard';
const DEFAULT_MATCHES_REFRESH_SECONDS = 30;
const DEFAULT_SCOREBOARD_REFRESH_SECONDS = 10;
const ALLOWED_REFRESH_SECONDS = [10, 30, 60];
const REFRESH_SETTINGS_EVENT = 'refreshsettingschange';

function readRefreshSeconds(key, fallback) {
	const value = Number.parseInt(localStorage.getItem(key), 10);
	return ALLOWED_REFRESH_SECONDS.includes(value) ? value : fallback;
}

function writeRefreshSeconds(key, value) {
	const seconds = Number.parseInt(value, 10);
	if (ALLOWED_REFRESH_SECONDS.includes(seconds)) {
		localStorage.setItem(key, String(seconds));
		window.dispatchEvent(new CustomEvent(REFRESH_SETTINGS_EVENT, { detail: { key, seconds } }));
	}
}

function subscribeToRefreshSettings(callback) {
	window.addEventListener('storage', callback);
	window.addEventListener(REFRESH_SETTINGS_EVENT, callback);
	return () => {
		window.removeEventListener('storage', callback);
		window.removeEventListener(REFRESH_SETTINGS_EVENT, callback);
	};
}

function useRefreshIntervalMs(key, fallback) {
	const seconds = useSyncExternalStore(
		subscribeToRefreshSettings,
		() => readRefreshSeconds(key, fallback),
		() => fallback
	);
	return seconds * 1000;
}

const useMatchesRefreshIntervalMs = () => useRefreshIntervalMs(MATCHES_REFRESH_KEY, DEFAULT_MATCHES_REFRESH_SECONDS);
const useScoreboardRefreshIntervalMs = () => useRefreshIntervalMs(SCOREBOARD_REFRESH_KEY, DEFAULT_SCOREBOARD_REFRESH_SECONDS);

export {
	DEFAULT_MATCHES_REFRESH_SECONDS,
	DEFAULT_SCOREBOARD_REFRESH_SECONDS,
	MATCHES_REFRESH_KEY,
	SCOREBOARD_REFRESH_KEY,
	useMatchesRefreshIntervalMs,
	useScoreboardRefreshIntervalMs,
	readRefreshSeconds,
	writeRefreshSeconds
};
