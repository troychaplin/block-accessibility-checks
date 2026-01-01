/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { ValidationAPI } from './validation/ValidationAPI';
import { ValidationSidebar } from './components/ValidationSidebar';

/**
 * Filter callback for block registration (currently a placeholder).
 *
 * This function is reserved for future enhancement to add custom categories
 * or modify block settings during registration. Currently returns settings
 * unchanged to maintain the filter hook registration point.
 *
 * @param {Object} settings - The block type settings object.
 * @return {Object} The unmodified settings object.
 */
function addBlockValidationCategory(settings) {
	return settings;
}

/**
 * Register the block settings filter
 *
 * This filter runs when block types are registered, providing a hook point
 * for adding validation-specific categories or settings to blocks in the future.
 */
addFilter(
	'blocks.registerBlockType',
	'block-accessibility-checks/add-validation-category',
	addBlockValidationCategory
);

/**
 * Dynamic proxy for accessing block validation rules from PHP.
 *
 * This Proxy object provides transparent access to validation rules that are
 * registered server-side via PHP and exposed through the window object. The
 * proxy allows JavaScript code to access rules as if they were stored locally,
 * while actually fetching them from window.BlockAccessibilityChecks.validationRules.
 *
 * Usage: blockChecksArray['core/image'] returns validation rules for the image block.
 *
 * @type {Proxy}
 */
export const blockChecksArray = new Proxy(
	{},
	{
		get(target, prop) {
			// Access validation rules from the window object (populated by PHP)
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

/**
 * Register the validation plugin with WordPress
 *
 * This plugin registration activates the validation system in the block editor,
 * rendering both the ValidationAPI (which handles validation logic and state)
 * and the ValidationSidebar (which displays validation results to users).
 * Both components are rendered together to provide a complete validation experience.
 */
registerPlugin('validation-api', {
	render: () => (
		<>
			<ValidationAPI />
			<ValidationSidebar />
		</>
	),
});
