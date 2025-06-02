
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import classNames from 'classnames';


function Component({ defaultValue, onChange, children }) {
	function onValueChange(value) {
		if (value && onChange) {
			onChange(value);
		}
	}
	
	return (
		<ToggleGroup.Root defaultValue={defaultValue} type='single' onValueChange={onValueChange} className='inline-flex border rounded-sm overflow-hidden'>
			{children}
		</ToggleGroup.Root>
	);
}


Component.Item = function Item({ value, selected, children }) {
	let className = '';

	className = classNames(className, 'px-4 py-2 text-sm cursor-pointer transition');
	className = classNames(className, 'not-first:border-l');

	className = classNames(className, 'hover:bg-primary-200!');
	className = classNames(className, 'bg-primary-100! text-primary-900!');

	className = classNames(className, 'dark:hover:bg-primary-600!');
	className = classNames(className, 'dark:bg-primary-500! dark:text-primary-100!');

	className = classNames(className, 'data-[state=on]:bg-primary-600!');
	className = classNames(className, 'data-[state=on]:text-primary-100!');
	className = classNames(className, 'data-[state=on]:dark:bg-primary-700!');

	return (
		<ToggleGroup.Item value={value} className={className}>
			{children}
		</ToggleGroup.Item>
	);
};

export default Component;