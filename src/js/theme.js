class ThemeManager {
	constructor() {
		this.classes = ['dark', 'light', 'clay', 'grass', 'hard'];
		this.validTheme = /^(light|dark|auto) (hard|clay|grass|auto)$/;
		this.defaultTheme = 'auto auto';
		this.surfaceWindows = [
			{ startMd: 101, endMd: 329, surface: 'hard', label: 'Australian and early hard-court swing' },
			{ startMd: 330, endMd: 607, surface: 'clay', label: 'European clay swing through Roland Garros' },
			{ startMd: 608, endMd: 712, surface: 'grass', label: 'Grass swing through Wimbledon' },
			{ startMd: 713, endMd: 726, surface: 'clay', label: 'Summer clay 250 swing' },
			{ startMd: 727, endMd: 1231, surface: 'hard', label: 'North American, Asian and indoor hard swing' }
		];
	}

	getMonthDayValue(date = new Date()) {
		const month = date.getMonth() + 1;
		const day = date.getDate();

		return month * 100 + day;
	}

	getAutomaticSurface(date = new Date()) {
		const monthDayValue = this.getMonthDayValue(date);
		const activeWindow = this.surfaceWindows.find(window => monthDayValue >= window.startMd && monthDayValue <= window.endMd);

		if (activeWindow) {
			return activeWindow.surface;
		}

		return 'hard';
	}

	normalizeTheme(themeValue) {
		if (!themeValue || !this.validTheme.test(themeValue)) {
			return this.defaultTheme;
		}

		return themeValue;
	}

	resolve(themeValue, { prefersDark = false, date = new Date() } = {}) {
		const normalizedTheme = this.normalizeTheme(themeValue);
		const [mode, surface] = normalizedTheme.split(' ');

		return {
			mode,
			surface,
			theme: normalizedTheme,
			resolvedMode: mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode,
			resolvedSurface: surface === 'auto' ? this.getAutomaticSurface(date) : surface
		};
	}
}

const theme = new ThemeManager();

export { ThemeManager, theme };
