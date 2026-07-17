import clsx from 'clsx';

import CheckCircledIcon from '../assets/radix-icons/check-circled.svg?react';
import CrossCircledIcon from '../assets/radix-icons/cross-circled.svg?react';
import ExclamationTriangleIcon from '../assets/radix-icons/exclamation-triangle.svg?react';
import InfoCircledIcon from '../assets/radix-icons/info-circled.svg?react';
import UpdateIcon from '../assets/radix-icons/update.svg?react';
import Layout from './layout';
import Menu from './menu';

function TennisBall({ ping }) {
	const animation = ping ? 'animate-ping bg-[#cddc39]' : 'animate-none bg-transparent';

	return (
		<div className='relative flex items-center justify-center w-20 h-20'>
			<span className={`absolute inline-flex h-13 w-13 rounded-full opacity-50 ${animation}`}></span>
			<span className='relative text-6xl bg-transparent'>🎾</span>
		</div>
	);
}


function Component({ className, ...props }) {
	className = clsx(className, 'flex flex-col h-screen');

	return <Layout className={className} {...props} />;
}

const statusBoxClassName = [
	'border rounded-lg border-primary-300 bg-primary-50! text-primary-900 p-3',
	'dark:border-primary-700 dark:bg-primary-800! dark:text-primary-100',
	'flex items-center gap-3'
];


Component.Title = function ({ className, level = 1, ...props }) {
	className = clsx('', className);


	switch (level) {
		case 1: {
			className = clsx('border rounded-lg font-semibold border-primary-800 text-primary-100 bg-primary-700! px-4 py-3', className);
			className = clsx('text-xl', 'dark:border-primary-700 dark:bg-primary-800! ', className);
			break;
		}
		case 2: {
			className = clsx('pt-3 pb-1 text-lg  text-primary-700 dark:text-primary-300', className);
			break;
		}
		case 3: {
			className = clsx('pt-3 pb-1 text-sm font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300', className);
			break;
		}
		case 4: {
			className = clsx('pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300', className);
			break;
		}
		case 5: {
			className = clsx('pt-3 pb-1 text-xxs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300', className);
			break;
		}
	}
	return <div className={className} {...props}></div>;
};

Component.Error = function ({ className, ...props }) {
	className = clsx('', className);

	className = clsx(className, statusBoxClassName);


	return (
		<div className={className}>
			<div className='bg-transparent' aria-hidden='true'>
				<CrossCircledIcon className='w-8 h-8 bg-transparent text-error-500 dark:text-error-400 shrink-0' />
			</div>
			<div className='bg-transparent '>
				<div {...props} />
			</div>
		</div>
	);
};

Component.Information = function ({ className, ...props }) {
	className = clsx('', className);

	className = clsx(className, statusBoxClassName);

	return (
		<div className={className}>
			<div className='bg-transparent' aria-hidden='true'>
				<InfoCircledIcon className='w-8 h-8 bg-transparent text-primary-500 dark:text-primary-400 shrink-0' />
			</div>
			<div className='bg-transparent '>
				<div {...props} />
			</div>
		</div>
	);
};

Component.Warning = function ({ className, ...props }) {
	className = clsx('', className);

	className = clsx(className, statusBoxClassName);

	return (
		<div className={className}>
			<div className='bg-transparent' aria-hidden='true'>
				<ExclamationTriangleIcon className='w-8 h-8 bg-transparent text-warning-600 dark:text-warning-400 shrink-0' />
			</div>
			<div className='bg-transparent '>
				<div {...props} />
			</div>
		</div>
	);
};

Component.Content = function (props) {
	let { className, ...other } = props;
	className = clsx('min-w-0 overflow-x-hidden overscroll-y-contain py-3 px-3 lg:px-10', className);
	className = clsx('overflow-y-auto flex-1', className);

	return (
		<div className={className} {...other}>
			{props.children}
		</div>
	);
};

Component.StatusBar = function ({ className, status = 'ready', children, ...props }) {
	const iconClassName = 'h-5 w-5 shrink-0 bg-transparent';
	let icon = <CheckCircledIcon className={iconClassName} />;

	if (status === 'loading') {
		icon = <UpdateIcon className={clsx(iconClassName, 'animate-spin')} />;
	} else if (status === 'warning') {
		icon = <ExclamationTriangleIcon className={iconClassName} />;
	} else if (status === 'error') {
		icon = <CrossCircledIcon className={iconClassName} />;
	} else if (status === 'info') {
		icon = <InfoCircledIcon className={iconClassName} />;
	}

	className = clsx(
		'flex min-h-12 flex-none items-center gap-3 border-t border-primary-300 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-900',
		'dark:border-primary-700 dark:bg-primary-900 dark:text-primary-100',
		className
	);

	return (
		<div className={className} role='status' aria-live='polite' {...props}>
			{icon}
			<div className='min-w-0 bg-transparent'>{children}</div>
		</div>
	);
};


Component.Loading = function ({ children }) {
	return (
		<div className='flex min-h-[40vh] flex-col items-center justify-center text-lg'>
			<TennisBall ping={true} />
			{children ? <div className='mt-2 text-sm font-semibold text-primary-700 dark:text-primary-300'>{children}</div> : null}
		</div>
	);
};

Component.Emoji = function ({ className, emoji, message, ...props }) {
	className = clsx('flex flex-col items-center justify-center py-12 text-center', className);

	return (
		<div className={className} {...props}>
			<div className='text-8xl'>{emoji}</div>
			<div className='mt-4 text-xl text-primary-700 dark:text-primary-300'>{message}</div>
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
