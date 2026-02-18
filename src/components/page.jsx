import clsx from 'clsx';import Layout from './layout';

import CrossCircledIcon from '../assets/radix-icons/cross-circled.svg?react';
import Menu from './menu';
import tennisBall from '../assets/tennis-ball.png';

function Component({ className, ...props }) {
	className = clsx(className, 'flex flex-col h-screen');

	return <Layout className={className} {...props} />;
}


Component.Title = function ({ className, level = 1, ...props }) {
	className = clsx('', className);

	switch (level) {
		case 1: {
			className = clsx('border rounded-sm  border-primary-800 text-primary-100 bg-primary-700! p-3', className);
			className = clsx('text-[150%]', 'dark:bg-primary-800! ', className);
			break;
		}
		case 2: {
			className = clsx('py-2', className);
			className = clsx('text-[125%]', className);
			break;
		}
		case 3: {
			className = clsx('py-2', className);
			className = clsx('text-[110%]', className);
			break;
		}
		case 4: {
			className = clsx('py-2', className);
			className = clsx('text-[100%]', className);
			break;
		}
	}
	return <div className={className} {...props}></div>;
};

Component.Error = function ({ className, ...props }) {
	className = clsx('', className);

	className = clsx(className, [
		'border rounded-sm border-error-600 bg-error-500! text-error-100 p-3',
		'dark:bg-error-600! dark:text-error-50',
		'flex items-center gap-3'
	]);


	return (
		<div className={className}>
			<div className='bg-transparent '>
				<CrossCircledIcon className='w-8 h-8 bg-transparent' />
			</div>
			<div className='bg-transparent '>
				<div {...props} />
			</div>
		</div>
	);
};

Component.Content = function (props) {
	let { className, ...other } = props;
	className = clsx('py-3 px-3 lg:px-10', className);
	className = clsx('overflow-y-auto flex-1', className);

	return (
		<div className={className} {...other}>
			{props.children}
		</div>
	);
};


Component.Loading = function (props) {
	function TennisBall({ ping }) {
		const animation = ping ? 'animate-ping bg-[#cddc39]' : 'animate-none bg-transparent';

		return (
			<div className='relative flex items-center justify-center w-20 h-20'>
				{/* Ping effect */}
				<span className={`absolute inline-flex h-13 w-13 rounded-full opacity-50 ${animation}`}></span>

				<span className='relative text-6xl bg-transparent'>🎾</span>
			</div>
		);
	}

	return (
		<div className='fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-lg'>
			<TennisBall ping={true} />
		</div>
	);
};


Component.Container = function ({ className, ...props }) {
	className = clsx('p-3', className);

	return <div className={className}>{props.children}</div>;
};


Component.Menu = function ({ className, ...props }) {
	className = clsx(className, 'sticky top-0 z-10');

	return <Menu className={className} {...props} />;
}

export default Component;
