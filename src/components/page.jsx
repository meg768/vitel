import './page.scss';
import classNames from 'classnames';


function Component({ className, ...props }) {
	className = classNames('page', className);

	return <div className={className} {...props}/>;
}

export default Component;
