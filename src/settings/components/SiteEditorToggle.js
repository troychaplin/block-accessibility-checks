import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Per-check toggle controlling whether the check runs in the site editor.
 *
 * @param {Object}   props
 * @param {boolean}  props.value    - Whether the check is enabled in the site editor.
 * @param {Function} props.onChange - Called with the new boolean value.
 */
export function SiteEditorToggle({ value, onChange }) {
	return (
		<ToggleControl
			label={__('Enable in Site Editor', 'block-accessibility-checks')}
			hideLabelFromVision
			checked={value}
			onChange={onChange}
		/>
	);
}
