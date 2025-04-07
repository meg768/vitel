import React from 'react';

const Info = React.forwardRef((properties, ref) => {

	return (
		<svg x='0px' y='0px' viewBox='0 0 50 50	'>
			<path d='M25,2C12.297,2,2,12.297,2,25s10.297,23,23,23s23-10.297,23-23S37.703,2,25,2z M25,11c1.657,0,3,1.343,3,3s-1.343,3-3,3 s-3-1.343-3-3S23.343,11,25,11z M29,38h-2h-4h-2v-2h2V23h-2v-2h2h4v2v13h2V38z'></path>
		</svg>
	);
});

export  {Info};
