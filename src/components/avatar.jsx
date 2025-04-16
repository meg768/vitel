import React from 'react';
import classNames from 'classnames';


function Component (params) {
	
	let { className, src, country, ...props } = params;

	className = classNames('flex w-10 h-10 border-2 border-none-300 content-center items-center rounded-full overflow-hidden', className);

	// Hover
	//className = classNames('transform transition-transform duration-300 hover:scale-110', className);

	return (
		<div className={className}>
			<img className='w-full h-full object-cover' src={src}/>
		</div>
	);
}

export default Component;
