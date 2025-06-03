
class Service {
	constructor() {
		this.url = import.meta.env.VITE_API_URL;
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

		try {
			console.log(`Fetching from '${url}' with options ${JSON.stringify(options)}`);

			const start = Date.now();
	
			let response = await fetch(url, options);
	
			const elapsed = Date.now() - start;
			const remaining = 500 - elapsed;
	
			await this.delay(remaining);
	
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
	
				throw new Error(`Fetch failed: ${message}`);
			}
	
			return await response.json();
	
		} catch (error) {
			throw new Error(`Failed to fetch url "${url}". ${error.message}`);
		}
	}

	async request(path, options) {

		const url = `${this.url}/${path}`;

		return await this.fetch(url, {
			...options,
			headers: {
				...this.headers,
				...options.headers
			}
		});
	}

	async get(path) {
		const url = `${this.url}/${path}`;

		return await this.fetch(url, {
			method: 'GET',
			headers: this.headers
		});
	}

	async post(path, data) {
		return await this.request(path, {method: 'POST', body: JSON.stringify(data)});
	}

	async query(options) {
		return await this.post('query', options);
	}
}

const service = new Service();

export default service;
