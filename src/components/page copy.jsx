import clsx from 'clsx';import Layout from './layout';

import CrossCircledIcon from '../assets/radix-icons-jsx/cross-circled.jsx';
import Menu from './menu';

function Component({ className, ...props }) {
	className = clsx(className, '');

	return <Layout className={className} {...props} />;
}

class Styles {
	constructor(theme) {
		this.theme = theme;
	}

	text() {}
	borderColor() {}
}
let styles = new Styles();

Component.Title = function ({ className, level = 1, ...props }) {
	className = clsx('', className);

	switch (level) {
		case 1: {
			className = clsx('border rounded-sm  border-primary-800 text-primary-100 bg-primary-700!   p-3', className);
			className = clsx('text-[200%]', 'dark:bg-primary-500/50! ', className);
			break;
		}
		case 2: {
			className = clsx('py-2', className);
			className = clsx('text-[150%]', className);
			break;
		}
		case 3: {
			className = clsx('py-2', className);
			className = clsx('text-[125%]', className);
			break;
		}
	}
	return <div className={className} {...props}></div>;
};

Component.Error = function ({ className, ...props }) {
	className = clsx('', className);

	className = clsx('border rounded-sm  border-error-500/50 bg-error-300/50!  text-error-900 p-3', className);
	className = clsx('dark:bg-error-600/50! dark:text-error-100', className);
	className = clsx('flex items-center gap-3', className);

	return (
		<div className={className}>
			<div className='bg-transparent '>
				<CrossCircledIcon className='w-8 h-8 bg-transparent text-error-500' />
			</div>
			<div className='bg-transparent '>
				<div {...props} />
			</div>
		</div>
	);
};

Component.Container = function (props) {
	let { className, ...other } = props;
	className = clsx('p-3 px-3 lg:px-15', className);

	return (
		<div className={className} {...other}>
			{props.children}
		</div>
	);
};

Component.Content = function (props) {
	let { className, ...other } = props;
	className = clsx('p-3 px-3 lg:px-15', className);

	return (
		<div className={className} {...other}>
			{props.children}
		</div>
	);
};
/*

Component.Query = function ({ queryKey, queryFn, children }) {
	function isReady() {
		return !isLoading && !isPending && !isFetching && !isPreviousData && data != null;
	}

	if (!Array.isArray(queryKey)) {
		// If queryKey is not an array, wrap it in an array
		queryKey = [queryKey];
	}

	const { data, isLoading, isFetching, isPending, isPreviousData, isError, error } = useQuery({
		queryKey,
		queryFn,

		// Retry count
		retry:0
	});

	if (isError) {
		return (
			<Component.Content>
				<Component.Error>
					<p className='font-bold text-xl'>
						Ett fel inträffade när sidan
						laddades.
					</p>
					<p>{error.message}</p>
				</Component.Error>
			</Component.Content>
		);
	}

	if (isPending) {
		return children(null);
	}

	return children(data);
};
*/
Component.Loading = function (props) {
	function TennisBall(props) {
		let animation = props.ping ? 'animate-ping bg-primary-400' : 'animate-none  bg-transparent';

		return (
			<div className='relative flex items-center justify-center w-10 h-10'>
				{/* Ping effect (behind) */}
				<span className={`absolute inline-flex h-6 w-6 rounded-full opacity-75 ${animation}`}></span>

				{/* Tennis Ball emoji */}
				<span className='relative text-xl bg-transparent'>🎾</span>
			</div>
		);
	}

	return (
		<div className='flex gap-2 items-center'>
			<TennisBall ping={true} />
			<div {...props}></div>
		</div>
	);

	return <p>Läser in...</p>;
};

Component.Container = function ({ className, ...props }) {
	className = clsx('p-3', className);

	return <div className={className}>{props.children}</div>;
};

Component.Menu = Menu;

export default Component;
