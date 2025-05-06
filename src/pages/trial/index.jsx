import React from 'react';
import mysql from '../../js/atp-service';

import { useParams } from 'react-router';

import { Container } from '../../components/ui';
import Players from '../../components/players';
import Page from '../../components/page';
import Menu from '../../components/menu';
import Link from '../../components/ui/link';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import Button from '../../components/ui/button';

import prospects from './prospects.js';
import goat from './goat.js';


let Component = () => {
	function Content() {
		return (
			<Page.Container>
				<Page.Title>Testbänk</Page.Title>
				<div className='text-[110%] pt-4 pb-4'>Här är några frågor som kan vara intressanta att ställa till databasen. Det är inte säkert att de ger något vettigt svar...</div>
				<div>
					<Query {...prospects} />
					<Query {...goat} />
				</div>
			</Page.Container>
		);
	}

	function Query({ sql, format = null, title = null, description = '-', ...props }) {
		return (
			<div className='text-[110%]  border-1 p-3 mt-3 mb-3 bg-primary-500/10 rounded-md hover:bg-primary-500/20'>
				<Link hover={false} query={{ sql, format, title}} to={`/players`} {...props}>
					<div>{title} </div>
					<div className={'text-[100%]! bg-transparent text-primary-500/50'}>{description}</div>
				</Link>
			</div>
		);
	}

	return (
		<>
			<Page>
				<Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
