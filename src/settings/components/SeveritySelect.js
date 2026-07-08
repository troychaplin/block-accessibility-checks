import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const LEVEL_OPTIONS = [
	{ value: 'error', label: __('Error', 'block-accessibility-checks') },
	{ value: 'warning', label: __('Warning', 'block-accessibility-checks') },
	{ value: 'none', label: __('Disabled', 'block-accessibility-checks') },
];

export function SeveritySelect({ value, onChange }) {
	return (
		<SelectControl
			__nextHasNoMarginBottom
			label={__('Level', 'block-accessibility-checks')}
			hideLabelFromVision
			value={value}
			options={LEVEL_OPTIONS}
			onChange={onChange}
		/>
	);
}
