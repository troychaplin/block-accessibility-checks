import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * The three severity levels a check can be set to.
 *
 * Exported so the `level` field's `elements` (which drives the column filter)
 * and this control's options cannot drift apart.
 */
export const LEVEL_OPTIONS = [
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
