import axios from 'axios';

class MySqlExpress {
	constructor({ url, authorization, database }) {
		this.url = url;
		this.database = database;
		this.headers = { 'content-type': 'application/json', authorization: `Basic ${authorization}` };
	}

	async request(options) {
		try {
			let response = await axios({ ...options, headers: this.headers });

			return response.data;
		} catch (error) {
			throw new Error(error.response.data.error);
		}
	}

	async query({ sql, format, ...other }) {
		let options = { method: 'get', url: `${this.url}/query`, params: { ...other, sql: sql, format: format, database: this.database } };
		return await this.request(options);
	}

	async upsert({ table, rows, row, ...other }) {
		let options = { method: 'post', url: `${this.url}/upsert`, params: { ...other, table: table, rows: rows, row: row, database: this.database } };
		return await this.request(options);
	}
}

let mysql = new MySqlExpress({ url: 'http://router.egelberg.se:3002', database: 'atp', authorization: 'JoAkIm' });

export default mysql;


