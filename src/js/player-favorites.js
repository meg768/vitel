import LocalStorage from './local-storage';

const storageKey = 'vitel';
const favoritesKey = 'favorite-player-ids';

export function getFavoritePlayerIds() {
	const storedIds = new LocalStorage({ key: storageKey }).get(favoritesKey, []);
	return Array.isArray(storedIds) ? storedIds : [];
}

export function setFavoritePlayerIds(playerIds) {
	new LocalStorage({ key: storageKey }).set(favoritesKey, playerIds);
}

