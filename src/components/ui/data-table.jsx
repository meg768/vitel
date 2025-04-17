import React from 'react';
import classNames from 'classnames';

class Column {
	constructor(child, index) {
		this.props = child.props;
		this.title = this.findChildType(child.props.children, Table.Title);
		this.cell = this.findChildType(child.props.children, Table.Cell);
		this.index = index;

		let sortValue = this.findChildType(child.props.children, Table.SortValue);

		if (sortValue && sortValue.props && typeof (sortValue.props.children == 'function')) {
			this.getSortValueFn = sortValue.props.children;
		}

		let value = this.findChildType(child.props.children, Table.Value);

		if (value && value.props && typeof (value.children == 'function')) {
			this.getValueFn = value.props.children;
		} else {
			if (this.props.id) {
				this.getValueFn = ({ row }) => {
					return row[this.props.id];
				};
			}
		}

		if (true) {
			let item = this.findChildType(child.props.children, Table.Text);
			if (item && item.props && typeof (item.children == 'function')) {
				this.getTextFn = item.children;
			}
		}

		let sort = this.findChildType(child.props.children, Table.Sort);

		if (sort && sort.props && typeof (sort.children == 'function')) {
			this.sortFn = sort.children;
		}

		if (!this.getTextFn && this.getValueFn) {
			this.getTextFn = this.getValueFn;
		}
		if (!this.getSortValueFn && this.getValueFn) {
			this.getSortValueFn = this.getValueFn;
		}
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
		if (this.sortFn) {
			return true;
		}
		if (this.getSortValueFn) {
			return true;
		}

		return false;
	}

	getCell({ row, index }) {
		let value = this.getValueFn ? this.getValueFn({ row }) : undefined;
		let props = {};

		if (this.cell && this.cell.props) {
			let { children, ...cellProps } = this.cell.props;
			value = children ? children({ value: value, row: row }) : value;
			props = cellProps;
		}

		let { className, ...others } = props;

		className = classNames(className, 'px-2 py-1 border-1');

		return (
			<td className={className} {...others} key={index}>
				{value}
			</td>
		);
	}
}

function Table({ rows, className, children, ...props }) {
	let [sort, setSort] = React.useState(null);
	let [columns, setColumns] = React.useState(null);

	className = classNames(className, 'ui data-table text-[90%] w-full border-1');
	className = classNames(className, 'dark:text-white/60 dark:border-primary-800');

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
			let className = '';

			className = classNames(className, 'text-[50%] ');

			if (!column.isSortable()) {
				return;
			}

			if (sort && sort.index == column.index) {
				return <span className={className}>{sort.order}</span>;
			}

			return <span className={classNames(className, 'opacity-0')}>{'▲'}</span>;
		}
		let items = columns.map((column, index) => {
			return (
				<th key={index} className={'px-2 py-1 opacity-[80%] border-1 bg-none-100 dark:bg-primary-950'}>
					<div className={classNames(column.props.className, 'flex gap-1 items-center cursor-pointer')} onClick={onSort.bind(null, column)}>
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
		let className = '';

		className = classNames(className, 'hover:bg-none-200 dark:hover:bg-primary-900');
		className = classNames(className, 'even:bg-none-50	dark:even:bg-primary-950');
		className = classNames(className, 'p-2');

		let items = columns.map((column, index) => {
			return column.getCell({ row, index });
		});

		return (
			<tr key={index} className={className} {...props}>
				{items}
			</tr>
		);
	}

	function Rows() {
		if (sort) {
			// Special compare, nulls are always last
			function compare(A, B, reverse) {
				if (A == B) {
					return 0;
				}
				if (A == null) {
					return 1;
				}
				if (B == null) {
					return -1;
				}
				return reverse * (A < B ? -1 : 1);
			}

			rows = [...rows];

			let column = columns[sort.index];
			let reverse = sort.order == '▲' ? 1 : -1;

			if (column.sortFn) {
				rows.sort((A, B) => {
					return column.sortFn({ A: A, B: B });
				});
				if (sort.order != '▲') {
					rows.reverse();
				}
			} else if (column.getSortValueFn) {
				rows.sort((A, B) => {
					A = column.getSortValueFn({ row: A });
					B = column.getSortValueFn({ row: B });
					return compare(A, B, reverse);
				});
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

Table.SortValue = function (props) {
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
