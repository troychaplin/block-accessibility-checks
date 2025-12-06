/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { blockChecksArray } from '../core/register';

// Default checks that should always be run unless disabled
const defaultChecks = {
	'core/image': {
		check_image_alt_text: {
			type: 'error',
			default: true,
			message: __('Images must have alternative text', 'block-accessibility-checks'),
		},
	},
	'core/button': {
		check_button_text: {
			type: 'error',
			default: true,
			message: __('Buttons must have text', 'block-accessibility-checks'),
		},
		check_button_link: {
			type: 'error',
			default: true,
			message: __('Buttons must have a link', 'block-accessibility-checks'),
		},
	},
	'core/heading': {
		check_heading_order: {
			type: 'warning',
			default: true,
			message: __('Heading levels should be sequential', 'block-accessibility-checks'),
		},
	},
};

/**
 * Validates a block against registered checks
 *
 * @param {Object} block Block object
 * @return {Object} Validation result object { isValid, issues, mode, clientId, name }
 */
export const validateBlock = block => {
	const blockType = block.name;
	const attributes = block.attributes;
	const issues = [];

	// Combine PHP-registered checks and default checks
	// Note: PHP checks take precedence if they exist
	const checks = {
		...(defaultChecks[blockType] || {}),
		...(blockChecksArray[blockType] || {}),
	};

	if (Object.keys(checks).length === 0) {
		return {
			isValid: true,
			issues: [],
			mode: 'none',
			clientId: block.clientId,
			name: blockType,
		};
	}

	Object.entries(checks).forEach(([checkName, checkConfig]) => {
		// Skip if check is disabled
		if (checkConfig.enabled === false) {
			return;
		}

		// Run validation logic based on check name
		// This is a simplified mapping - actual logic would be more complex
		// and likely split into separate validator functions per check type
		let isValid = true;

		// Check if there is a custom validator function registered
		// This allows external plugins to provide their own validation logic
		if (typeof checkConfig.validator === 'function') {
			isValid = checkConfig.validator(attributes, block);
		} else {
			// Fallback to built-in checks
			switch (checkName) {
				case 'check_image_alt_text':
				case 'check_image_alt_text_length':
				case 'check_image_alt_caption_match':
				case 'check_image_alt_text_patterns':
					// Let the filter handle it
					isValid = true;
					break;
				case 'check_button_text':
					isValid = attributes.text !== undefined && attributes.text.trim() !== '';
					break;
				case 'check_button_link':
					isValid = attributes.url !== undefined && attributes.url.trim() !== '';
					break;
				case 'check_heading_order':
					// The heading rank validation logic is complex and handled by the
					// ba11yc/headingRankValidation filter hooked into ba11yc_validate_block.
					// We return true here to allow the filter to determine validity.
					isValid = true;
					break;
				default:
					// If no specific validator is found, check if there's a generic one
					// or if the external plugin registered a validator in the window object
					if (
						window.BlockAccessibilityChecks &&
						window.BlockAccessibilityChecks.validators &&
						typeof window.BlockAccessibilityChecks.validators[checkName] === 'function'
					) {
						isValid = window.BlockAccessibilityChecks.validators[checkName](
							attributes,
							block
						);
					}
					break;
			}
		}

		// Allow external plugins to modify validation result
		isValid = applyFilters(
			'ba11yc_validate_block',
			isValid,
			blockType,
			attributes,
			checkName,
			block // Pass the full block object to the filter for context
		);

		if (!isValid) {
			// Determine the message to display
			// Prefer error_msg for errors and warning_msg for warnings
			// Fallback to message property if specific type message is missing
			// Default to generic message if nothing is found
			const defaultMessage = __('Accessibility issue found', 'block-accessibility-checks');
			const message = checkConfig.message || defaultMessage;

			const errorMsg = checkConfig.error_msg || message;
			const warningMsg = checkConfig.warning_msg || message;

			issues.push({
				check: checkName,
				message,
				type: checkConfig.type || 'error',
				error_msg: errorMsg,
				warning_msg: warningMsg,
				category: checkConfig.category || 'accessibility', // Ensure category is passed
			});
		}
	});

	const hasErrors = issues.some(issue => issue.type === 'error');
	const hasWarnings = issues.some(issue => issue.type === 'warning');

	let mode = 'none';
	if (hasErrors) {
		mode = 'error';
	} else if (hasWarnings) {
		mode = 'warning';
	}

	return {
		isValid: issues.length === 0,
		issues,
		mode,
		clientId: block.clientId,
		name: blockType,
	};
};
