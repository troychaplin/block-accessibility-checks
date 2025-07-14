/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';

// Get validation mode from plugin settings
const validationMode = BlockAccessibilityChecks.blockChecksOptions.core_button_block_check;

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
			case 'button_required_content':
				checkFailed = checkButtonRequiredContent(block.attributes);
				break;
			case 'button_text_quality':
				checkFailed = checkButtonTextQuality(block.attributes);
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
 * Check if button has required content (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkButtonRequiredContent(attributes) {
	// Check if button has text
	const hasText =
		attributes.text &&
		(attributes.text.originalHTML ||
			(typeof attributes.text === 'string' && attributes.text.trim() !== ''));

	// Check if button has URL
	const hasUrl = attributes.url && attributes.url.trim() !== '';

	// Button must have both text and URL
	return !hasText || !hasUrl;
}

/**
 * Check button text quality (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkButtonTextQuality(attributes) {
	if (!attributes.text) {
		return false;
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

	// Check for generic button text
	const genericTexts = ['click here', 'read more', 'learn more', 'more', 'here', 'link'];

	return genericTexts.includes(text.toLowerCase()) || text.length < 3;
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
