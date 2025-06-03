import './checkbox.scss';

import React from 'react';
import clsx from 'clsx';import { Checkbox } from 'radix-ui';
import CheckIcon from '../assets/radix-icons-jsx/check.jsx';


function Component(properties) {
	let { className, color = 'stonxe', ...props } = properties;

	className = clsx('ui checkbox ', className);

	switch (color) {
		case 'stone': {
			className = clsx(className, `border-stone-500!`);
			className = clsx(className, `data-[state=checked]:text-stone-100!`);
			className = clsx(className, `data-[state=checked]:bg-stone-500!`);
			className = clsx(className, `hover:data-[state=unchecked]:bg-stone-600!`);
			className = clsx(className, `hover:data-[state=checked]:bg-stone-600!`);
			//className = clsx(className, `hover:bg-stone-600!`);
			break;
		}
		case 'rose': {
			className = clsx(className, `border-rose-500!`);
			className = clsx(className, `data-[state=checked]:text-rose-100!`);
			className = clsx(className, `data-[state=checked]:bg-rose-500!`);
			break;
		}
		case 'teal': {
			className = clsx(className, `border-teal-500!`);
			className = clsx(className, `data-[state=checked]:text-teal-100!`);
			className = clsx(className, `data-[state=checked]:bg-teal-500!`);
			break;
		}
		default: {
			className = clsx(className, `border-primary-500!`);
			className = clsx(className, `data-[state=checked]:text-primary-100!`);
			className = clsx(className, `data-[state=checked]:bg-primary-500!`);
			className = clsx(className, `hover:data-[state=unchecked]:bg-primary-600!`);
			className = clsx(className, `hover:data-[state=checked]:bg-primary-600!`);
			break;

		}
	}

	return (
		<Checkbox.Root className={className} {...props}>
			<Checkbox.Indicator className='indicator'>
				<CheckIcon />
			</Checkbox.Indicator>
		</Checkbox.Root>
	);
}

export default Component;
