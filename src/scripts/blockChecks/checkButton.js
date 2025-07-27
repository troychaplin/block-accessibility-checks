/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';

// Get validation rules from PHP registry
const validationRules = BlockAccessibilityChecks.validationRules || {};
const buttonRules = validationRules['core/button'] || {};

/**
 * Checks button attributes using PHP registry rules.
 *
 * @param {Object} block - The block object to be checked.
 * @return {Object} - The response object containing the validation result.
 */
export function checkButtonAttributes(block) {
	// Only process button blocks
	if (block.name !== 'core/button') {
		return { isValid: true, mode: 'none' };
	}

	// Run all registered checks for the button block
	const failures = runButtonChecks(block, buttonRules);

	// Create response object based on validation result
	const response = {
		isValid: failures.length === 0,
		message: '',
		clientId: block.clientId,
		mode: failures.length === 0 ? 'none' : 'error', // Default to error if any check fails
	};

	// If validation fails, set appropriate error message using the highest priority failure
	if (failures.length > 0) {
		const highestPriorityFailure = failures.sort((a, b) => a.priority - b.priority)[0];
		response.message = formatValidationMessage(
			highestPriorityFailure.message,
			highestPriorityFailure.type
		);
		response.mode = highestPriorityFailure.type; // Use the individual check's type
	}

	return response;
}

/**
 * Runs all enabled accessibility checks for a button block using PHP registry rules.
 *
 * @param {Object} block - The button block to validate.
 * @param {Object} rules - The validation rules from PHP registry.
 * @return {Array} - Array of validation failures.
 */
function runButtonChecks(block, rules) {
	const failures = [];

	// Check each registered rule
	Object.entries(rules).forEach(([checkName, config]) => {
		if (!config.enabled) {
			return;
		}

		let checkFailed = false;

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'check_button_text':
				checkFailed = checkButtonText(block.attributes);
				break;
			case 'check_button_link':
				checkFailed = checkButtonLink(block.attributes);
				break;
			default:
				// Unknown check, skip
				break;
		}

		if (checkFailed) {
			failures.push({
				checkName,
				message: config.type === 'error' ? config.error_msg : config.warning_msg,
				type: config.type,
				priority: config.priority,
			});
		}
	});

	return failures;
}

/**
 * Check if button has required link (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkButtonLink(attributes) {
	// Check if button has URL
	const hasUrl = attributes.url && attributes.url.trim() !== '';

	// Button must have URL
	return !hasUrl;
}

/**
 * Check if button has required text (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkButtonText(attributes) {
	if (!attributes.text) {
		return true; // Fail - no text
	}

	// Extract text content, handling both string and object types
	let textContent = '';
	if (typeof attributes.text === 'string') {
		textContent = attributes.text;
	} else if (attributes.text.originalHTML) {
		textContent = attributes.text.originalHTML;
	}

	// Strip HTML tags and trim
	const text = textContent.replace(/<[^>]*>/g, '').trim();

	// Check if text exists and is not empty
	return text.length === 0;
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
