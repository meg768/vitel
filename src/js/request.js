import axios from 'axios';

class Request {
	constructor(options) {
		this.url = 'http://router.egelberg.se:3002';
		this.headers = { 'content-type': 'application/json', authorization: 'Basic JoAkIm' };
		this.options = options;
	}

	async request(options) {
		try {
			let response = await axios(options);

			return response.data;
		} catch (error) {
			throw new Error(error.response.data.error);
		}
	}

	async get(path, params) {
		let options = {
			method: 'get',
			url: `${this.url}/${path}`,
			params: params,
			headers: this.headers
		};

		return await this.request(options);
	}

	async query(options) {
		options = { ...options, ...this.options }
		return await this.get('query', options);
	}
}

export default Request;
