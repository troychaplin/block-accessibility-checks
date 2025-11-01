/**
 * Table Block Validation
 *
 * Contains all validation logic for core/table blocks.
 * This file serves as the single source of truth for table accessibility checks.
 */

import { addFilter } from '@wordpress/hooks';

/**
 * Register table block validation logic
 */
addFilter(
	'ba11yc_validate_block',
	'ba11yc/table-validation',
	(isValid, blockType, attributes, checkName) => {
		// Only handle table blocks
		if (blockType !== 'core/table') {
			return isValid;
		}

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'check_table_headers':
				return validateTableHeaders(attributes);
			default:
				return isValid;
		}
	}
);

/**
 * Validate table has proper headers
 *
 * @param {Object} attributes - The block attributes.
 * @return {boolean} - True if valid, false if invalid.
 */
function validateTableHeaders(attributes) {
	// Check if table has header row
	if (!attributes.body || !Array.isArray(attributes.body) || attributes.body.length === 0) {
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
