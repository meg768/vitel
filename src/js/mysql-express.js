import axios from 'axios';

class MySqlExpress {
	constructor({ url, authorization, database }) {
		if (!url || !authorization || !database) {
			throw new Error('Missing required parameters: url, authorization, or database');
		}

		this.url = url;
		this.database = database;
		this.headers = {
			'content-type': 'application/json',
			authorization: `Basic ${authorization}`
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

	async query({ sql, format, ...other }) {
		if (!sql) {
			throw new Error('SQL query is required');
		}

		const options = {
			method: 'get',
			url: `${this.url}/query`,
			params: { ...other, sql, format, database: this.database }
		};
		return this.request(options);
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
	url: 'http://router.egelberg.se:3002',
	database: 'atp-ex',
	authorization: 'JoAkIm'
});

export default mysql;
