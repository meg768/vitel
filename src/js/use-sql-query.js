import { useQuery } from '@tanstack/react-query';
import hash from 'object-hash';
import atp from './atp-service';

export function useSqlQuery({ sql, format, cache, retry = 0 }) {
	const queryKey = ['sql', hash({ sql, format })];

	const queryFn = async function() {
		return await atp.query({ sql, format });
	}

	return useQuery({queryKey, queryFn, staleTime: cache, retry});
}

