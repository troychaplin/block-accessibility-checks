/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { ValidationAPI } from './validationApi';
import { UnifiedValidationSidebar } from '../ui/sidebar/UnifiedValidationSidebar';
import { ValidationHeaderButton } from '../ui/sidebar/ValidationHeaderButton';

/**
 * Add 'block-validation' category to block settings
 *
 * @param {Object} settings - Block settings
 */
function addBlockValidationCategory(settings) {
	return settings;
}
addFilter(
	'blocks.registerBlockType',
	'block-accessibility-checks/add-validation-category',
	addBlockValidationCategory
);

// Define block checks array (this will be populated from PHP)
export const blockChecksArray = new Proxy(
	{},
	{
		get(target, prop) {
			if (
				window.BlockAccessibilityChecks &&
				window.BlockAccessibilityChecks.validationRules
			) {
				return window.BlockAccessibilityChecks.validationRules[prop];
			}
			return undefined;
		},
	}
);

registerPlugin('validation-api', {
	render: () => (
		<>
			<ValidationAPI />
			<UnifiedValidationSidebar />
			<ValidationHeaderButton />
		</>
	),
});
