import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Page from './page';
import Menu from './menu';

export default function QueryPage({ id, queryKey, queryFn, children }) {
	if (!Array.isArray(queryKey)) {
		// If queryKey is not an array, wrap it in an array
		queryKey = [queryKey];
	}

	const { data, isPending, isError, error } = useQuery({
		queryKey,
		queryFn
	});

	if (isError) {
		return (
			<Page id={id}>
				<Menu spinner={false} />
				<Page.Container>
					<Page.Error>
						<p className='font-bold text-xl'>Ett fel inträffade</p>
						<p>{error.message}</p>
					</Page.Error>
				</Page.Container>
			</Page>
		);
	}

	if (isPending || !data) {
		return (
			<Page id={id}>
				<Menu spinner={true} />
				<Page.Container>{children({})}</Page.Container>
			</Page>
		);
	}

	return (
		<Page id={id}>
			<Menu spinner={false} />
			<Page.Container>{children(data)}</Page.Container>
		</Page>
	);
}
