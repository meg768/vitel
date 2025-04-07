import React from 'react';
import './summary-table.scss';

import {Table}  from '../components/ui';

let Component = ({ children }) => {
	return (
		<Table className='summary-table'>
			<Table.Body>{children}</Table.Body>
		</Table>
	);
};

Component.Cell = ({ children, name, value, ...props }) => {
	function Label() {
		if (name) {
			return <label>{name}</label>;
		}
	}

	function Value() {
		if (value) {
			return <p>{value}</p>;
		}
	}
	return (
		<Table.Cell {...props}>
			<Label />
			<Value />
			{children}
		</Table.Cell>
	);
};

Component.Row = ({ children }) => {
	return <Table.Row>{children}</Table.Row>;
};

export default Component;
