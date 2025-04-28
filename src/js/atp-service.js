import axios from 'axios';

class MySqlExpress {
	constructor({ url }) {
		this.url = url;
		this.headers = {
			'content-type': 'application/json'
		};
	}

	async request(options) {
		try {
			const response = await axios({ ...options, headers: this.headers });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
			throw new Error(`Request failed: ${errorMessage}`);
		}
	}

	async query(options) {
		let url = `${this.url}/query`;

		let response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(options),
			headers: this.headers
		});

		if (!response.ok) {
			throw new Error(`Error in query: ${response.statusText}`);
		}

		let json = await response.json();

		try {
			json = JSON.parse(json);	
		}
		catch (error) {
			throw new Error('Failed to parse JSON response in query');
		}

		return json;
	}


	async upsert({ table, rows, row, ...other }) {
		if (!table || (!rows && !row)) {
			throw new Error('Table and either rows or row are required for upsert');
		}

		const options = {
			method: 'post',
			url: `${this.url}/upsert`,
			params: { ...other, table, rows, row, database: this.database }
		};

		return this.request(options);
	}
}

const mysql = new MySqlExpress({
	url: 'http://router.egelberg.se:3004'
});

export default mysql;
