/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { blockChecksArray } from '../../register';
import {
	isCheckEnabled,
	createIssue,
	hasErrors,
	hasWarnings,
	createValidationResult,
} from '@shared/utils/validation';

/**
 * Default client-side validation checks for core WordPress blocks.
 *
 * These checks run automatically in the block editor unless explicitly disabled.
 * Each check defines a type (error/warning), default enabled state, and message.
 * PHP-registered checks from the server will override these defaults if present.
 *
 * Note: Heading checks are now handled entirely by PHP (check_heading_rank),
 * so the default JavaScript check has been removed to respect PHP settings.
 */
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
	// Heading checks removed - handled by PHP (check_heading_rank) to respect settings
};

/**
 * Validates a block against all registered accessibility and validation checks.
 *
 * Runs through both client-side default checks and server-registered PHP checks,
 * executing each enabled validator and collecting any issues found. Supports
 * custom validators from external plugins via the window object or filter hooks.
 *
 * @param {Object} block - The block object containing name, attributes, clientId, etc.
 * @return {Object} Validation result with isValid, issues array, severity mode, clientId, and block name.
 */
export const validateBlock = block => {
	const blockType = block.name;
	const attributes = block.attributes;
	const issues = [];

	// Get list of block types that PHP has registered checks for
	// If PHP has registered checks for this block type, only use PHP checks (skip JS defaults)
	const phpRegisteredTypes = window.BlockAccessibilityChecks?.registeredBlockTypes || [];
	const phpHasChecks = phpRegisteredTypes.includes(blockType);

	// Merge default JavaScript checks with PHP-registered checks
	// PHP checks (from blockChecksArray) take precedence over defaults
	// If PHP has registered checks for this block type, skip JavaScript defaults entirely
	const checks = phpHasChecks
		? {
				...(blockChecksArray[blockType] || {}),
			}
		: {
				...(defaultChecks[blockType] || {}),
				...(blockChecksArray[blockType] || {}),
			};

	// No checks registered for this block type - return valid
	if (Object.keys(checks).length === 0) {
		return {
			isValid: true,
			issues: [],
			mode: 'none',
			clientId: block.clientId,
			name: blockType,
		};
	}

	// Run each registered check for this block type
	Object.entries(checks).forEach(([checkName, checkConfig]) => {
		// Skip checks that have been explicitly disabled
		if (!isCheckEnabled(checkConfig)) {
			return;
		}

		let isValid = true;

		// Check if a custom validator function is registered in the check config
		// Custom validators allow external plugins to provide their own validation logic
		if (typeof checkConfig.validator === 'function') {
			isValid = checkConfig.validator(attributes, block);
		} else {
			// Use built-in validation logic for known check types
			switch (checkName) {
				case 'check_image_alt_text':
				case 'check_image_alt_text_length':
				case 'check_image_alt_caption_match':
				case 'check_image_alt_text_patterns':
					// Image validation delegated to filter hooks for complex logic
					// The actual validation occurs in the ba11yc_validate_block filter
					isValid = true;
					break;
				case 'check_button_text':
					// Verify button has non-empty text content
					isValid = attributes.text !== undefined && attributes.text.trim() !== '';
					break;
				case 'check_button_link':
					// Verify button has a valid URL
					isValid = attributes.url !== undefined && attributes.url.trim() !== '';
					break;
				case 'check_heading_order':
				case 'check_heading_rank':
					// Heading order/rank validation requires document context (previous headings)
					// Handled by the ba11yc/headingRankValidation filter via ba11yc_validate_block
					// Return true here to defer to the filter for actual validation
					isValid = true;
					break;
				default:
					// Check for external validators registered via window object
					// This provides a fallback for third-party plugins to register validators
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

		/**
		 * Filter: ba11yc_validate_block
		 *
		 * Allows external plugins and custom validators to modify or override
		 * the validation result. This is the primary extension point for adding
		 * custom validation logic without modifying core code.
		 */
		isValid = applyFilters(
			'ba11yc_validate_block',
			isValid,
			blockType,
			attributes,
			checkName,
			block
		);

		// Build issue object if validation failed
		if (!isValid) {
			const defaultMessage = __('Accessibility issue found', 'block-accessibility-checks');
			const issue = createIssue(checkConfig, checkName);
			// Override message with default if config doesn't have one
			if (!checkConfig.message) {
				issue.message = defaultMessage;
				issue.error_msg = issue.error_msg || defaultMessage;
				issue.warning_msg = issue.warning_msg || defaultMessage;
			}
			issues.push(issue);
		}
	});

	// Determine severity level based on issue types
	const hasBlockErrors = hasErrors(issues);
	const hasBlockWarnings = hasWarnings(issues);

	// Set validation mode (errors take precedence over warnings)
	let mode = 'none';
	if (hasBlockErrors) {
		mode = 'error';
	} else if (hasBlockWarnings) {
		mode = 'warning';
	}

	// Return comprehensive validation result
	return createValidationResult(issues, {
		mode,
		clientId: block.clientId,
		name: blockType,
	});
};
