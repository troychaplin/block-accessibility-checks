/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';

// Get validation mode from plugin settings
const validationMode = BlockAccessibilityChecks.blockChecksOptions.core_image_block_check;

// Get validation rules from PHP registry
const validationRules = BlockAccessibilityChecks.validationRules || {};
const imageRules = validationRules['core/image'] || {};

/**
 * Checks if an image block meets accessibility requirements using PHP registry rules.
 *
 * @param {Object} block - The image block to be checked.
 * @return {Object} - The validation response object.
 */
export function checkImageAlt(block) {
	// Only process image blocks
	if (block.name !== 'core/image') {
		return { isValid: true, mode: 'none' };
	}

	// Run all registered checks for the image block
	const failures = runImageChecks(block, imageRules);

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
 * Runs all enabled accessibility checks for an image block using PHP registry rules.
 *
 * @param {Object} block - The image block to validate.
 * @param {Object} rules - The validation rules from PHP registry.
 * @return {Array} - Array of validation failures.
 */
function runImageChecks(block, rules) {
	const failures = [];

	// Check each registered rule
	Object.entries(rules).forEach(([checkName, config]) => {
		if (!config.enabled) {
			return;
		}

		let checkFailed = false;

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'alt_text_required':
				checkFailed = checkAltTextRequired(block.attributes);
				break;
			case 'alt_text_length':
				checkFailed = checkAltTextLength(block.attributes);
				break;
			case 'alt_caption_match':
				checkFailed = checkAltCaptionMatch(block.attributes);
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
 * Check if image has required alt text (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkAltTextRequired(attributes) {
	// Check if image is marked as decorative
	const isDecorative = attributes.isDecorative === true;

	// If marked as decorative, alt text is not required
	if (isDecorative) {
		return false;
	}

	// Check if alt text exists and is not empty
	const hasAltText = attributes.alt && attributes.alt.trim() !== '';

	// Return true if check fails (no alt text when required)
	return !hasAltText;
}

/**
 * Check alt text length (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkAltTextLength(attributes) {
	if (!attributes.alt || attributes.alt.trim() === '') {
		return false;
	}

	return attributes.alt.length > 125;
}

/**
 * Check if alt text matches caption (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkAltCaptionMatch(attributes) {
	if (!attributes.alt || !attributes.caption) {
		return false;
	}

	const altText = attributes.alt.trim();
	const caption = attributes.caption.trim().replace(/<[^>]*>/g, ''); // Strip HTML tags

	return altText !== '' && caption !== '' && altText === caption;
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
