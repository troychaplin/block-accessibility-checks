/**
 * Core block validation logic
 *
 * This file contains all the validation logic for WordPress core blocks.
 * It integrates with the unified validation hooks system.
 */

import { addFilter } from '@wordpress/hooks';

/**
 * Register core block validation logic
 */
addFilter(
	'ba11yc.validateBlock',
	'ba11yc/core-blocks',
	(isValid, blockType, attributes, checkName) => {
		// Only handle core blocks
		if (!blockType.startsWith('core/')) {
			return isValid;
		}

		switch (blockType) {
			case 'core/image':
				return validateImageBlock(attributes, checkName);
			case 'core/button':
				return validateButtonBlock(attributes, checkName);
			case 'core/table':
				return validateTableBlock(attributes, checkName);
		}

		return isValid;
	}
);

/**
 * Validate image block checks
 *
 * @param {Object} attributes - The block attributes.
 * @param {string} checkName  - The name of the check to perform.
 */
function validateImageBlock(attributes, checkName) {
	switch (checkName) {
		case 'alt_text_required':
			// Check if image is marked as decorative
			if (attributes.isDecorative) {
				return true; // Pass - decorative images don't need alt text
			}
			// Check if alt text exists and is not empty
			return !!(attributes.alt && attributes.alt.trim());

		case 'alt_text_length':
			// Only check if alt text exists
			if (!attributes.alt) {
				return true; // Pass - no alt text to check length
			}
			return attributes.alt.length <= 125;

		case 'alt_caption_match':
			// Only check if both alt and caption exist
			if (!attributes.alt || !attributes.caption) {
				return true; // Pass - can't match if one is missing
			}
			const alt = attributes.alt.trim().toLowerCase();
			const caption = attributes.caption.trim().toLowerCase();
			return alt !== caption;
	}
	return true;
}

/**
 * Validate button block checks
 * @param {Object} attributes - The block attributes.
 * @param {string} checkName  - The name of the check to perform.
 */
function validateButtonBlock(attributes, checkName) {
	switch (checkName) {
		case 'button_required_content':
			// Check if button has both text and URL
			const hasText = !!(attributes.text && attributes.text.trim());
			const hasUrl = !!(attributes.url && attributes.url.trim());
			return hasText && hasUrl;

		case 'button_text_quality':
			// Check for poor quality button text
			if (!attributes.text) {
				return true; // Pass - no text to check quality
			}
			const text = attributes.text.trim().toLowerCase();
			const poorQualityTexts = [
				'click here',
				'read more',
				'more',
				'link',
				'here',
				'this',
				'continue',
				'go',
			];
			return !poorQualityTexts.includes(text);
	}
	return true;
}

/**
 * Validate table block checks
 * @param {Object} attributes - The block attributes.
 * @param {string} checkName  - The name of the check to perform.
 */
function validateTableBlock(attributes, checkName) {
	switch (checkName) {
		case 'table_headers':
			// Check if table has header row
			if (
				!attributes.body ||
				!Array.isArray(attributes.body) ||
				attributes.body.length === 0
			) {
				return true; // Pass - empty table
			}

			// Check if any cell in first row has header styling
			const firstRow = attributes.body[0];
			if (!firstRow || !Array.isArray(firstRow.cells)) {
				return true; // Pass - malformed table
			}

			// Look for header cells or check if head section exists
			const hasHeaderSection = !!(
				attributes.head &&
				Array.isArray(attributes.head) &&
				attributes.head.length > 0
			);
			const hasHeaderCells = firstRow.cells.some(cell => cell.tag === 'th');

			return hasHeaderSection || hasHeaderCells;
	}
	return true;
}
