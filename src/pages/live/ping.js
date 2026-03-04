const modules = import.meta.glob('./pings/*.js', { eager: true });

const pings = Object.fromEntries(
	Object.entries(modules).map(([path, module]) => {
		const name = path.replace('./pings/', '').replace('.js', '');

		return [name, module.default];
	})
);

function ping(name, score) {
	const fn = pings[name];

	if (!fn) {
		return false;
	}

	return fn(score);
}

export { ping, pings };
