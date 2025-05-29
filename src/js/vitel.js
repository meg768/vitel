

import { useQuery } from '@tanstack/react-query';

import service from './service.js';
import hash from 'object-hash';

function useRequest({ path, method, body, cache, retry = 0 }) {
	const queryKey = ['request', hash({ path, method, body })];

	const queryFn = async function () {
		return await service.request(path, { method, body });
	};

	let result = useQuery({ queryKey, queryFn, staleTime: cache, retry });

	return { ...result, response: result.data };
}

function useSQL({ sql, format, cache, retry = 0 }) {
	return useRequest({path: 'query', method: 'POST', body: JSON.stringify({ sql, format }), cache, retry });
}



export { service, useSQL, useRequest };