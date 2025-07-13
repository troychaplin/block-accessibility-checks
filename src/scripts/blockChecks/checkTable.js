/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';

// Get validation mode from plugin settings
const validationMode = BlockAccessibilityChecks.blockChecksOptions.core_table_block_check;

// Get validation rules from PHP registry
const validationRules = BlockAccessibilityChecks.validationRules || {};
const tableRules = validationRules['core/table'] || {};

/**
 * Checks if a table block has proper accessibility features using PHP registry rules.
 *
 * @param {Object} block - The table block to be checked.
 * @return {Object} - The validation response object.
 */
export function checkTableHeaderRow(block) {
	// Only process table blocks
	if (block.name !== 'core/table') {
		return { isValid: true, mode: 'none' };
	}

	// Run all registered checks for the table block
	const failures = runTableChecks(block, tableRules);

	// Create response object based on validation result
	const response = {
		isValid: failures.length === 0,
		message: '',
		clientId: block.clientId,
		mode: failures.length === 0 ? 'none' : validationMode,
	};

	// If validation fails, set appropriate error message using the highest priority failure
	if (failures.length > 0) {
		const highestPriorityFailure = failures.sort((a, b) => a.priority - b.priority)[0];
		response.message = formatValidationMessage(highestPriorityFailure.message, validationMode);
	}

	return response;
}

/**
 * Runs all enabled accessibility checks for a table block using PHP registry rules.
 *
 * @param {Object} block - The table block to validate.
 * @param {Object} rules - The validation rules from PHP registry.
 * @return {Array} - Array of validation failures.
 */
function runTableChecks(block, rules) {
	const failures = [];

	// Check each registered rule
	Object.entries(rules).forEach(([checkName, config]) => {
		if (!config.enabled) {
			return;
		}

		let checkFailed = false;

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'table_headers':
				checkFailed = checkTableHeaders(block.attributes);
				break;
			default:
				// Unknown check, skip
				break;
		}

		if (checkFailed) {
			failures.push({
				checkName,
				message: config.message,
				type: config.type,
				priority: config.priority,
			});
		}
	});

	return failures;
}

/**
 * Check table headers (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkTableHeaders(attributes) {
	// Check if table has data in body
	const hasBody = attributes.body && attributes.body.length > 0;

	if (!hasBody) {
		return false; // Empty table doesn't need headers
	}

	// Check if table has header section defined
	const hasHeader = attributes.head && attributes.head.length > 0;

	// Check if table has caption
	const hasCaption = attributes.caption && attributes.caption.trim() !== '';

	// Table should have either headers or caption for accessibility
	return !(hasHeader || hasCaption);
}

/**
 * Formats validation message with appropriate prefix based on validation mode.
 *
 * @param {string} baseMessage - The base message from PHP registry.
 * @param {string} mode        - The validation mode (error, warning, none).
 * @return {string} - The formatted validation message.
 */
function formatValidationMessage(baseMessage, mode) {
	switch (mode) {
		case 'error':
			return __('Error:', 'block-accessibility-checks') + ' ' + baseMessage;
		case 'warning':
			return __('Warning:', 'block-accessibility-checks') + ' ' + baseMessage;
		case 'none':
		default:
			return baseMessage;
	}
}
