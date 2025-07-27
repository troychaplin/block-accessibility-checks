/**
 * Image Block Validation
 *
 * Contains all validation logic for core/image blocks.
 * This file serves as the single source of truth for image accessibility checks.
 */

import { addFilter } from '@wordpress/hooks';

/**
 * Register image block validation logic
 */
addFilter(
	'ba11yc.validateBlock',
	'ba11yc/image-validation',
	(isValid, blockType, attributes, checkName) => {
		// Only handle image blocks
		if (blockType !== 'core/image') {
			return isValid;
		}

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'check_image_alt_text':
				return validateImageAltText(attributes);
			case 'check_image_alt_text_length':
				return validateImageAltTextLength(attributes);
			case 'check_image_alt_caption_match':
				return validateImageAltCaptionMatch(attributes);
			default:
				return isValid;
		}
	}
);

/**
 * Validate image has required alt text
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateImageAltText(attributes) {
	// Check if image is marked as decorative
	if (attributes.isDecorative) {
		return true; // Pass - decorative images don't need alt text
	}
	// Check if alt text exists and is not empty
	return !!(attributes.alt && attributes.alt.trim());
}

/**
 * Validate image alt text length
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateImageAltTextLength(attributes) {
	// Only check if alt text exists
	if (!attributes.alt) {
		return true; // Pass - no alt text to check length
	}
	return attributes.alt.length <= 125;
}

/**
 * Validate image alt text doesn't match caption
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateImageAltCaptionMatch(attributes) {
	// Only check if both alt and caption exist
	if (!attributes.alt || !attributes.caption) {
		return true; // Pass - can't match if one is missing
	}
	const alt = attributes.alt.trim().toLowerCase();
	const caption = attributes.caption.trim().toLowerCase();
	return alt !== caption;
}
