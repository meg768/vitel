import React from 'react';
import Link from '../components/ui/link';
import Table from './ui/data-table';
import Flag from './flag';

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

import classNames from 'classnames';

function Component({ players }) {
	function Content() {
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
								</div >
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

				<Table.Column id='highest_rank' className=''>
					<Table.Title>Högsta Ranking</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return `${value} (${new Date(row.highest_rank_date).toLocaleDateString()})`;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='career_titles' className=''>
					<Table.Title className=''>Titlar</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>
				<Table.Column id='career_wins' className=''>
					<Table.Title>Vinster</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							if (value == 0) {
								return value;
							}
							if (!row.career_wins && !row.career_losses) {
								return '-';
							}
							return `${value} (${Math.round((100 * value) / (row.career_wins + row.career_losses))}%)`;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='career_losses' className=''>
					<Table.Title>Förluster</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							if (value == 0) {
								return value;
							}
							if (!row.career_wins && !row.career_losses) {
								return '-';
							}
							return `${value} (${Math.round((100 * value) / (row.career_wins + row.career_losses))}%)`;
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

				<Table.Column id='age' className=''>
					<Table.Title className=''>Ålder</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='serve_rating' className=''>
					<Table.Title className=''>Serve</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>
				<Table.Column id='return_rating' className=''>
					<Table.Title className=''>Retur</Table.Title>
					<Table.Cell className='text-right'>
						{({ row, value }) => {
							return value != null ? value : '-';
						}}
					</Table.Cell>
				</Table.Column>
				<Table.Column id='pressure_rating' className=''>
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
