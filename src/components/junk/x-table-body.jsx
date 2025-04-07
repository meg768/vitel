import React from 'react';

let Component = ({ children }) => {

	
	function render() {
		return (
			<tbody>
				{children}
			</tbody>
		);
	}
	return render();
};


export default Component;
