import './data-table.scss';

import React from 'react';
import classNames from 'classnames';

class Column {
	constructor(child, index) {
		this.props = child.props;
		this.value = this.findChildType(child.props.children, Table.Value);
		this.sort = this.findChildType(child.props.children, Table.Sort);
		this.title = this.findChildType(child.props.children, Table.Title);
		this.cell = this.findChildType(child.props.children, Table.Cell);
		this.text = this.findChildType(child.props.children, Table.Text);
		this.format = this.findChildType(child.props.children, Table.Format);
		this.index = index;
	}

	findChildType(children, type) {
		for (let child of React.Children.toArray(children)) {
			if (child.type == type) {
				return child;
			}
			if (child.children) {
				return this.findChildType(child.children, type);
			}
		}
	}

	isSortable() {
		if (this.sort && this.sort.children && typeof this.sort.children == 'function') {
			return true;
		}
		if (this.props.id) {
			return true;
		}

		return false;
	}

	getCell({ row, index }) {
		let value = this.getValue({ row });
		let props = {};

		if (this.cell && this.cell.props) {
			let { children, ...cellProps } = this.cell.props;
			value = children ? children({ value: value, row: row }) : value;
			props = cellProps;
		}

		return (
			<td {...props} key={index}>
				{value}
			</td>
		);
	}

	getValue({ row }) {
		let result = undefined;

		if (this.value && this.value.props && this.value.props.children) {
			result = this.value.props.children({ row });
		} else if (this.props.id) {
			result = row[this.props.id];
		}

		return result;
	}
}

function Table({ rows, className, children, ...props }) {
	let [sort, setSort] = React.useState(null);
	let [columns, setColumns] = React.useState(null);

	className = classNames(className, 'ui data-table');

	if (columns == null) {
		let x = React.Children.map(children, (child, index) => {
			if (child.type == Table.Column) {
				return new Column(child, index);
			}
		});

		setColumns(x);
	}

	function Head() {
		function onSort(column) {
			if (!column.isSortable()) {
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

			if (!column.isSortable()) {
				return;
			}

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
		let items = columns.map((column, index) => {
			return column.getCell({ row, index });
		});

		return (
			<tr key={index} {...props}>
				{items}
			</tr>
		);
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
					A = column.getValue({ row: A });
					B = column.getValue({ row: B });
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
