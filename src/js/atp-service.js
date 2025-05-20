
class MySqlExpress {
	constructor({ url }) {
		this.url = url;
		this.headers = {
			'content-type': 'application/json'
		};
	}

	delay(ms) {
		if (ms < 0) {
			ms = 0;
		}
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async fetch(url, options) {
		const start = Date.now();
		let response = await fetch(url, options);
		const elapsed = Date.now() - start;

		if (!response.ok) {
			let message = response.statusText;

			try {
				const error = await response.json();
				message = error.message || message;
			} catch {
				try {
					message = await response.text();
				} catch {
					// fallback to statusText
				}
			}

			const remaining = 500 - elapsed;
			await this.delay(remaining);

			throw new Error(`Fetch failed: ${message}`);
		}

		return await response.json();
	}

	async get(path) {
		const url = `${this.url}/${path}`;

		return await this.fetch(url, {
			method: 'GET',
			headers: this.headers
		});
	}

	async post(path, data) {
		const url = `${this.url}/${path}`;

		return await this.fetch(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: this.headers
		});
	}

	async query(options) {
		return await this.post('query', options);
	}
}

const mysql = new MySqlExpress({
	url: ''
});

export default mysql;
