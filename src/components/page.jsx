import classNames from 'classnames';

function Component({ className, ...props }) {
	className = classNames('page dasrk min-w-2xl min-h-full', className);
	className = classNames('bg-primary-50 text-primary-900 border-black/10', className);
	className = classNames('dark:bg-primary-950	 dark:text-none-300 dark:border-primary-700', className);

	return <div className={className} {...props} />;
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
	className = classNames('', className);

	switch (level) {
		case 1: {
			className = classNames('border rounded-sm  bg-primary-100  text-primary-900 p-3', className);
			className = classNames('text-[200%]', 'dark:bg-primary-900 dark:text-primary-100', className);
			break;
		}
		case 2: {
			className = classNames('py-2', className);
			className = classNames('text-[150%]', className);

		}
	}
	return <p className={className} {...props}></p>;
};

Component.Container = function (props) {
	let { className, ...other } = props;
	className = classNames('p-3 px-3 lg:px-15', className);

	return (
		<div className={className} {...other}>
			{props.children}
		</div>
	);
};

export default Component;
