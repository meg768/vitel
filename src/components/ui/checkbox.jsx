import './checkbox.scss';

import React from 'react';
import classNames from 'classnames';
import { Checkbox } from 'radix-ui';
import { CheckIcon } from '@radix-ui/react-icons';



function Component(properties) {
	let { className, color = 'stonxe', ...props } = properties;

	className = classNames('ui checkbox ', className);

	switch (color) {
		case 'stone': {
			className = classNames(className, `border-stone-500!`);
			className = classNames(className, `data-[state=checked]:text-stone-100!`);
			className = classNames(className, `data-[state=checked]:bg-stone-500!`);
			className = classNames(className, `hover:data-[state=unchecked]:bg-stone-600!`);
			className = classNames(className, `hover:data-[state=checked]:bg-stone-600!`);
			//className = classNames(className, `hover:bg-stone-600!`);
			break;
		}
		case 'rose': {
			className = classNames(className, `border-rose-500!`);
			className = classNames(className, `data-[state=checked]:text-rose-100!`);
			className = classNames(className, `data-[state=checked]:bg-rose-500!`);
			break;
		}
		case 'teal': {
			className = classNames(className, `border-teal-500!`);
			className = classNames(className, `data-[state=checked]:text-teal-100!`);
			className = classNames(className, `data-[state=checked]:bg-teal-500!`);
			break;
		}
		default: {
			className = classNames(className, `border-primary-500!`);
			className = classNames(className, `data-[state=checked]:text-primary-100!`);
			className = classNames(className, `data-[state=checked]:bg-primary-500!`);
			className = classNames(className, `hover:data-[state=unchecked]:bg-primary-600!`);
			className = classNames(className, `hover:data-[state=checked]:bg-primary-600!`);
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
