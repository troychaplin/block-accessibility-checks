/**
 * Button Block Validation
 *
 * Contains all validation logic for core/button blocks.
 * This file serves as the single source of truth for button accessibility checks.
 */

import { addFilter } from '@wordpress/hooks';
import { isValidUrl } from '../../core/utils/isValidUrl';

addFilter(
	'ba11yc_validate_block',
	'ba11yc/buttonValidation',
	(isValid, blockType, attributes, checkName) => {
		// Only handle button blocks
		if (blockType !== 'core/button') {
			return isValid;
		}

		// If initial check already invalid and not one of ours, respect it
		if (!isValid && !checkName.startsWith('check_button_')) {
			return isValid;
		}

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'check_button_link':
				const result = validateButtonLink(attributes);
				return result;
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
	// Only validate URL if the button is using an anchor element
	// Button elements don't require URLs, so skip validation for them
	if (attributes.tagName === 'button') {
		return true; // Valid - button elements don't require URLs
	}

	// For anchor elements (tagName === 'a' or default), validate URL
	// Check if button has a URL and that it's valid
	const hasUrl = !!(attributes.url && attributes.url.trim());
	const isValid = hasUrl && isValidUrl(attributes.url);

	return isValid;
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

	// Check if text exists and contains alphanumeric characters
	// This prevents buttons with only symbols, spaces, or special characters
	return text.length > 0 && /[a-zA-Z0-9]/.test(text);
}
