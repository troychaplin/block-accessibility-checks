/**
 * Image Block Validation
 *
 * Contains all validation logic for core/image blocks.
 * This file serves as the single source of truth for image accessibility checks.
 */

import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc_validate_block',
	'ba11yc/imageValidation',
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
			case 'check_image_alt_text_patterns':
				return validateImageAltTextPatterns(attributes);
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

/**
 * Validate image alt text doesn't contain non-descriptive patterns
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateImageAltTextPatterns(attributes) {
	// Only check if alt text exists
	if (!attributes.alt || attributes.alt.trim() === '') {
		return true; // Pass - no alt text to check patterns
	}

	// Check if image is marked as decorative
	if (attributes.isDecorative) {
		return true; // Pass - decorative images don't need meaningful alt text
	}

	const alt = attributes.alt.trim().toLowerCase();

	// Skip validation if alt text is reasonably descriptive (longer than 20 characters)
	if (alt.length > 20) {
		return true; // Pass - likely descriptive enough
	}

	// Common non-descriptive patterns that should be avoided (exact matches only)
	const nonDescriptivePatterns = [
		// Single generic terms (only block if they're the entire alt text)
		'image',
		'picture',
		'photo',
		'photograph',
		'img',
		'pic',
		'pics',

		// Camera/file patterns
		'dsc',
		'dsc_',
		'dscn',
		'dscn_',
		'img_',
		'photo_',
		'picture_',
		'image_',

		// Placeholder patterns
		'alt text',
		'alt tag',
		'alternative text',
		'alt',

		// Empty or meaningless patterns
		' ',
		'""',
		"''",
		'&nbsp;',
		'&amp;nbsp;',
		'nbsp;',
		'-',
		'--',
		'...',
		'untitled',
		'default',
		'placeholder',

		// Common file extensions as alt text
		'.jpg',
		'.jpeg',
		'.png',
		'.gif',
		'.webp',
		'.svg',
	];

	// Check if alt text matches any non-descriptive pattern exactly
	for (const pattern of nonDescriptivePatterns) {
		if (alt === pattern) {
			return false; // Invalid - exact match with non-descriptive pattern
		}
	}

	// Check if alt text is just a file name or path (common issue)
	if (alt.match(/^[a-z0-9_-]+\.[a-z0-9]+$/i)) {
		return false; // Invalid - appears to be just a filename
	}

	// Check if alt text starts with overly generic patterns (but only for short alt text)
	const startsWithPatterns = [
		'image of',
		'picture of',
		'photo of',
		'photograph of',
		'img of',
		'pic of',
	];

	for (const pattern of startsWithPatterns) {
		if (alt.startsWith(pattern) && alt.length <= 25) {
			return false; // Invalid - starts with generic pattern and is too short
		}
	}

	// Check for patterns that are clearly non-descriptive regardless of length
	const alwaysBlockPatterns = [
		/^[a-z]+[0-9]+$/i, // Just letters followed by numbers (like "img123")
		/^[0-9]+$/i, // Just numbers
		/^[^a-z0-9]*$/i, // Only special characters
	];

	for (const pattern of alwaysBlockPatterns) {
		if (pattern.test(alt)) {
			return false; // Invalid - clearly non-descriptive pattern
		}
	}

	return true; // Valid - no problematic patterns found
}
