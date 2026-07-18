import * as ToggleGroup from '@radix-ui/react-toggle-group';
import clsx from 'clsx';

function Component({ defaultValue, value, onChange, children }) {
	function onValueChange(value) {
		if (value && onChange) {
			onChange(value);
		}
	}

	return (
		<ToggleGroup.Root defaultValue={defaultValue} value={value} type='single' onValueChange={onValueChange} className='inline-flex items-center gap-1 rounded-full border border-primary-300 bg-primary-100 p-1 dark:border-primary-600 dark:bg-primary-900'>
			{children}
		</ToggleGroup.Root>
	);
}

Component.Item = function Item({ value, className, children }) {

	className = clsx(className, [
		'rounded-full px-4 py-1.5 text-sm cursor-pointer transition-colors',

		'bg-transparent',
		'text-primary-950',
		'hover:bg-primary-500',
		'hover:text-primary-50',
		'data-[state=on]:text-primary-50',
		'data-[state=on]:bg-primary-600',

		'dark:bg-transparent',
		'dark:text-primary-50',
		'dark:data-[state=on]:bg-primary-700'
	]);

	return (
		<ToggleGroup.Item value={value} className={className}>
			{children}
		</ToggleGroup.Item>
	);
};

export default Component;
