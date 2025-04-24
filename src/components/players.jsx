import React from 'react';
import Link from '../components/ui/link';
import Table from './ui/data-table';
import Flag from './flag';

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

import classNames from 'classnames';

function Component({ players }) {
	function Content() {
		function cash(value) {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
		}

		return (
			<Table rows={players} className='striped hover'>
				<Table.Column id='name' className=''>
					<Table.Title className=''>Namn</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							return (
								<div className='flex items-center gap-2'>
									<Flag className='w-5! h-5! border-1! border-primary-200' country={row.country}></Flag>
									<Link to={`/player/${row.id}`}>{value}</Link>
								</div>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='country' className=''>
					<Table.Title className=''>Land</Table.Title>
				</Table.Column>

				<Table.Column id='rank' className=''>
					<Table.Title>Ranking</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='elo_rank' defaultSortOrder='dsc' className=''>
					<Table.Title>ELO</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='highest_rank' className=''>
					<Table.Title>Högsta Ranking</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return `${value} (${new Date(row.highest_rank_date).toLocaleDateString()})`;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='career_titles' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Titlar</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column className=''>
					<Table.Title>V/F</Table.Title>
					<Table.Cell className='text-left'>
						{({ row, value }) => {
							return `${row.career_wins}/${row.career_losses}`;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='age' className=''>
					<Table.Title className=''>Ålder</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='height' className=''>
					<Table.Title>Längd (cm)</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='weight' className=''>
					<Table.Title>Vikt (kg)</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='serve_rating' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Serve</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>
				<Table.Column id='return_rating' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Retur</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='pressure_rating' defaultSortOrder='dsc' className=''>
					<Table.Title className=''>Underläge</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>
			</Table>
		);
	}

	return <Content />;
}

export default Component;
