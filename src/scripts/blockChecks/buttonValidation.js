/**
 * Button Block Validation
 *
 * Contains all validation logic for core/button blocks.
 * This file serves as the single source of truth for button accessibility checks.
 */

import { addFilter } from '@wordpress/hooks';

/**
 * Register button block validation logic
 */
addFilter(
	'ba11yc.validateBlock',
	'ba11yc/button-validation',
	(isValid, blockType, attributes, checkName) => {
		// Only handle button blocks
		if (blockType !== 'core/button') {
			return isValid;
		}

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'check_button_link':
				return validateButtonLink(attributes);
			case 'check_button_text':
				return validateButtonText(attributes);
			default:
				return isValid;
		}
	}
);

/**
 * Validate button has required link
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateButtonLink(attributes) {
	// Check if button has a URL
	return !!(attributes.url && attributes.url.trim());
}

/**
 * Validate button has required text
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateButtonText(attributes) {
	if (!attributes.text) {
		return false; // Fail - no text
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
	return text.length > 0;
}
