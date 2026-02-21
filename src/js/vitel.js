
import { useQuery } from '@tanstack/react-query';

import service from './service.js';
import hash from 'object-hash';

// Default cache time for SQL queries (1 hour) since the data doesn't change often and can be expensive to fetch
const DEFAULT_CACHE_TIME = 60 * 60 * 1000; 

function useRequest({ path, method, body, cache = DEFAULT_CACHE_TIME, retry = 0 }) {
	const queryKey = ['request', hash({ path, method, body })];

	const queryFn = async function () {
		return await service.request(path, { method, body });
	};

	return useQuery({ queryKey, queryFn, staleTime: cache, retry });
}

function useSQL({ sql, format = [], cache, retry = 0 }) {
	return useRequest({path: 'query', method: 'POST', body: JSON.stringify({ sql, format }), cache, retry });
}

export { service, useSQL, useRequest };