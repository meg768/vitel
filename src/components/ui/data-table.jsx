import clsx from 'clsx';
import React from 'react';

import ChevronDownIcon from '../../assets/radix-icons/chevron-down.svg?react';
import ChevronUpIcon from '../../assets/radix-icons/chevron-up.svg?react';

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

    getCell({ row, index, rowIndex, selected, highlightSelectedRows }) {
        let value = this.getValueFn ? this.getValueFn({ row }) : undefined;
        let props = {};

        if (this.cell && this.cell.props) {
            let { children, ...cellProps } = this.cell.props;
            value = children ? children({ value: value, row: row, selected: selected }) : value;
            props = cellProps;
        }

        let { className, ...others } = props;

        className = clsx(
            className,
            'px-2 py-1.5 border-r border-b border-primary-300 whitespace-nowrap dark:border-primary-700',
            selected && highlightSelectedRows
                ? 'bg-primary-400/55 group-hover:bg-primary-400/55 dark:bg-primary-500/45 dark:group-hover:bg-primary-500/45'
                : rowIndex % 2 === 0
                    ? 'bg-primary-100 group-hover:bg-primary-200 dark:bg-primary-800 dark:group-hover:bg-primary-600/75'
                    : 'bg-primary-50 group-hover:bg-primary-200 dark:bg-primary-900 dark:group-hover:bg-primary-600/75'
        );

        return (
            <td className={className} {...others} key={index}>
                {value}
            </td>
        );
    }
}

function Table({ rows, className, children, rowKey, isRowSelected, onRowClick, highlightSelectedRows = true, ...props }) {
    let [sort, setSort] = React.useState(null);
    let [columns, setColumns] = React.useState(null);

    // What?! No rows?
    if (!rows) {
        rows = [];
    }

    className = clsx(className, `ui data-table w-full border-collapse text-sm`);

    if (columns == null) {

        let index = 0;

        let x = React.Children.toArray(children).flatMap((child) => {
            if (!child || child.type != Table.Column) {
                return [];
            }
            if (child.props.hidden) {
                return [];
            }
            return [new Column(child, index++)];
        });

        setColumns(x);
    }

    function Head() {
        function onSort(column) {
            if (!column.isSortable()) {
                return;
            }

            let order = '▲';
            let defaultSortOrder = column.props?.defaultSortOrder;

            // Check default sort order
            if (defaultSortOrder && defaultSortOrder.toUpperCase() == 'DSC') {
                order = '▼';
            }

            if (sort && sort.index == column.index) {
                order = sort.order == '▲' ? '▼' : '▲';
            }

            setSort({ order: order, index: column.index });
        }

        function Arrow({ column }) {
            const className = 'h-3 w-3 shrink-0 text-primary-700 dark:text-primary-300';

            if (!column.isSortable()) {
                return;
            }

            if (sort && sort.index == column.index) {
                return sort.order == '▲'
                    ? <ChevronUpIcon className={className} />
                    : <ChevronDownIcon className={className} />;
            }

            return <ChevronUpIcon className={clsx(className, 'opacity-0')} />;
        }

        function Title(props) {
            let { className, ...other } = props;

            // Add no wrap as default
            className = clsx(className, 'whitespace-nowrap text-xxs py-[0.1em] font-semibold uppercase tracking-[0.08em] text-primary-700 dark:text-primary-300');

            return <div className={className} {...other} />;
        }

        let items = columns.map((column, index) => {
            return (
                <th key={index} className={'px-2 py-1 border-r border-b bg-transparent dark:bg-primary-900'}>
                    <div className={clsx(column.props.className, 'flex gap-1 items-center cursor-pointer')} onClick={onSort.bind(null, column)}>
                        <Title {...column.title.props}></Title>
                        <Arrow column={column} />
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
        const selected = isRowSelected ? isRowSelected(row) : false;
        const isInteractive = Boolean(onRowClick);
        const className = clsx('group', isInteractive && 'cursor-pointer');

        function selectRow(event) {
            if (!isInteractive || event.target.closest('a, button, input, select, textarea')) {
                return;
            }

            onRowClick(row);
        }

        function selectRowWithKeyboard(event) {
            if (!isInteractive || (event.key !== 'Enter' && event.key !== ' ')) {
                return;
            }

            event.preventDefault();
            onRowClick(row);
        }

        let items = columns.map((column, columnIndex) => {
            return column.getCell({ row, index: columnIndex, rowIndex: index, selected, highlightSelectedRows });
        });

        return (
            <tr
                className={className}
                onClick={selectRow}
                onKeyDown={selectRowWithKeyboard}
                tabIndex={isInteractive ? 0 : undefined}
                aria-selected={isInteractive ? selected : undefined}
                {...props}
            >
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
            const key = typeof rowKey === 'function'
                ? rowKey(row)
                : rowKey
                    ? row[rowKey]
                    : index;

            return <Row row={row} index={index} key={key}></Row>;
        });
    }

    function Body(props) {
        return <tbody {...props}></tbody>;
    }

    return (
        <div className='data-table-frame w-full min-w-0 max-w-full rounded-lg border border-primary-300 dark:border-primary-700 overflow-hidden'>
            <div className='w-full min-w-0 overflow-auto'>
                <table className={className} {...props}>
                    <Head />
                    <Body>
                        <Rows />
                    </Body>
                </table>
            </div>
        </div>
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
