import React from 'react';

let Component = ({ children }) => {
	function Columns() {
		return React.Children.map(children, (child, index) => {
			return <th key={index}>{child}</th>;
		});
	}

	function Content() {
		return (
			<thead>
				<tr>
					<Columns />
				</tr>
			</thead>
		);
	}
	return <Content />;
};

export default Component;
