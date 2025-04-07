import './data-table.scss';

import React from 'react';
import classNames from 'classnames';

function findChildType(children, type) {
	for (let child of React.Children.toArray(children)) {
		if (child.type == type) {
			return child;
		}
		if (child.children) {
			return findChildType(child.children, type);
		}
	}
}

function Table({ rows, className, children, ...props }) {
	let [sort, setSort] = React.useState(null);
	let [columns, setColumns] = React.useState(null);

	className = classNames(className, 'ui data-table');

	if (columns == null) {
		let x = React.Children.map(children, (child, index) => {
			if (child.type != Table.Column) {
				return;
			}

			let value = findChildType(child.props.children, Table.Value);
			let sort = findChildType(child.props.children, Table.Sort);
			let title = findChildType(child.props.children, Table.Title);
			let cell = findChildType(child.props.children, Table.Cell);
			let text = findChildType(child.props.children, Table.Text);
			let format = findChildType(child.props.children, Table.Format);

			let getValue = (row) => {
				let result = 'X';

				if (value && value.props && value.props.children) {
					result = value.props.children({ row });
				} else if (child.props.id) {
					result = row[child.props.id];
				}

				return result;
			};



			return { props: child.props, getValue:getValue, format: format, value: value, sort: sort, title: title, index: index, cell: cell, text: text };
		});

		setColumns(x);
	}

	function Head() {
		function onSort(column) {
			if (!column.props.id) {
				return;
			}
			let order = '▲';

			if (sort && sort.index == column.index) {
				order = sort.order == '▲' ? '▼' : '▲';
			}

			setSort({ order: order, index: column.index });
		}

		function Arrow({ column }) {
			let text = '▲';
			let className = '';
			let x = '';

			/*
			if (column.props.id == undefined || column.sort == undefined) {
			return undefined;

			}
			*/
			if (sort && sort.index == column.index) {
				text = sort.order;
				className = 'sorted';
			}

			return <span className={className}>{text}</span>;
		}
		let items = columns.map((column, index) => {
			return (
				<th key={index}>
					<div className={column.props.className} onClick={onSort.bind(null, column)}>
						<div {...column.title.props}></div>
						<div>
							<Arrow column={column} />
						</div>
					</div>
				</th>
			);
		});

		return (
			<thead>
				<tr>{items}</tr>
			</thead>
		);
	}


	function Row({ row, index, ...props }) {
		let items = columns.map((column, columnIndex) => {
			let value = column.getValue(row); 
			let props = {};

			if (column.cell && column.cell.props) {
				let { children, ...cellProps } = column.cell.props;
				value = children ? children({ value: value, row: row }) : value;
				props = cellProps;
			}

			return (
				<td {...props} key={columnIndex}>
					{value}
				</td>
			);
		});

		return <tr {...props}>{items}</tr>;
	}

	function Rows() {
		if (sort) {
			rows = [...rows];

			let column = columns[sort.index];

			if (column.sort && column.sort.props && column.sort.props.children) {
				let { children } = column.sort.props;

				rows.sort((A, B) => {
					return children({ A: A, B: B });
				});
			} else if (column.value && column.value.props && column.value.props.children) {
				rows.sort((A, B) => {
					A = getValue({ row: A, column });
					B = getValue({ row: B, column });
					return A > B;
				});
			} else if (column.props.id) {
				let id = column.props.id;

				rows.sort((A, B) => {
					return A[id] > B[id];
				});
			}

			if (sort.order != '▲') {
				rows.reverse();
			}
		}

		return rows.map((row, index) => {
			return <Row row={row} index={index} key={index}></Row>;
		});
	}

	function Body(props) {
		return <tbody {...props}></tbody>;
	}

	return (
		<table className={className} {...props}>
			<Head />
			<Body>
				<Rows />
			</Body>
		</table>
	);
}

Table.Cell = function (props) {
	return props.children;
};

Table.Text = function (props) {
	return props.children;
};

Table.Sort = function (props) {
	return props.children;
};

Table.Title = function (props) {
	return props.children;
};

Table.Value = function (props) {
	return props.children;
};

Table.Column = function (props) {
	return props.children;
};

Table.Format = function (props) {
	return props.children;
};

export default Table;
