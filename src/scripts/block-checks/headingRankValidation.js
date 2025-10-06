/**
 * Heading Rank Validation
 *
 * Contains validation logic for core/heading blocks to check proper heading hierarchy.
 * Leverages WordPress core's existing heading structure analysis through data stores.
 */

import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

// Note: Individual heading validation doesn't need caching since each heading
// is validated independently against its immediate context

/**
 * Register heading block validation logic
 */
addFilter(
	'ba11yc.validateBlock',
	'ba11yc/heading-rank-validation',
	(isValid, blockType, attributes, checkName, rule, block) => {
		// Only handle heading blocks
		if (blockType !== 'core/heading') {
			return isValid;
		}

		// Try to get clientId from different possible sources
		let clientId = 'unknown';
		if (block?.clientId) {
			clientId = block.clientId;
		} else if (attributes?.clientId) {
			clientId = attributes.clientId;
		} else if (rule?.clientId) {
			clientId = rule.clientId;
		}

		const currentHeading = {
			clientId,
			attributes,
			name: blockType,
		};

		// Run the appropriate check based on the check name
		switch (checkName) {
			case 'check_heading_rank':
				return validateHeadingRank(currentHeading);
			case 'check_heading_first_level':
				return validateFirstHeadingLevel(currentHeading);
			default:
				return isValid;
		}
	}
);

/**
 * Validate heading rank hierarchy - simplified approach
 *
 * Since we can't reliably get the clientId, we'll use a document-wide approach
 * that flags headings when there are violations in the document.
 *
 * @param {Object} currentHeading - The heading block being validated
 * @return {boolean} - True if valid, false if invalid.
 */
function validateHeadingRank(currentHeading) {
	const currentLevel = currentHeading.attributes.level || 2;

	// Get all blocks from the editor (including nested blocks)
	const allBlocks = select('core/block-editor').getBlocks();

	// Recursively find all heading blocks, including those nested in groups, columns, etc.
	const headingBlocks = getAllHeadingBlocks(allBlocks);

	// If there are no heading blocks or only one, validation passes
	if (headingBlocks.length <= 1) {
		return true;
	}

	// Extract heading levels in document order
	const headingLevels = headingBlocks.map(block => ({
		level: block.attributes.level || 2, // Default to h2 if no level specified
		clientId: block.clientId,
		content: block.attributes.content || '',
	}));

	// Check if there are any rank violations in the document
	const violations = findHeadingViolations(headingLevels);

	if (violations.length === 0) {
		return true;
	}

	// If there are violations, check if the current heading is one of the problematic ones
	const isProblematic = violations.some(violation => {
		// Check if this heading level is involved in a violation
		return violation.problematicLevel === currentLevel;
	});

	return !isProblematic; // Return false if problematic (validation fails)
}

/**
 * Validate first heading level
 *
 * Checks if the first heading in the document is H1 or H2.
 * Only validates if this is actually the first heading block.
 *
 * @param {Object} currentHeading - The heading block being validated
 * @return {boolean} - True if valid, false if invalid.
 */
function validateFirstHeadingLevel(currentHeading) {
	// Get all blocks from the editor (including nested blocks)
	const allBlocks = select('core/block-editor').getBlocks();

	// Recursively find all heading blocks in document order
	const headingBlocks = getAllHeadingBlocks(allBlocks);

	// If no heading blocks exist, validation passes
	if (headingBlocks.length === 0) {
		return true;
	}

	// Get the first heading block
	const firstHeading = headingBlocks[0];

	// Check if this is the first heading by comparing level and content
	const isFirstHeading =
		firstHeading.attributes.level === currentHeading.attributes.level &&
		firstHeading.attributes.content === currentHeading.attributes.content;

	// If this is not the first heading, validation passes
	if (!isFirstHeading) {
		return true;
	}

	// Check if the first heading is H1 or H2
	const firstHeadingLevel = firstHeading.attributes.level || 2; // Default to h2 if no level specified
	return firstHeadingLevel === 1 || firstHeadingLevel === 2;
}

/**
 * Find all heading rank violations in the document
 *
 * @param {Array} headingLevels - Array of heading level objects with level, clientId, and content.
 * @return {Array} - Array of violation objects with details about each violation.
 */
function findHeadingViolations(headingLevels) {
	const violations = [];

	for (let i = 1; i < headingLevels.length; i++) {
		const currentLevel = headingLevels[i].level;
		const previousLevel = headingLevels[i - 1].level;

		// Check if we're skipping heading levels (violation)
		if (currentLevel > previousLevel + 1) {
			violations.push({
				index: i,
				previousLevel,
				problematicLevel: currentLevel,
				description: `H${currentLevel} after H${previousLevel} skips levels`,
			});
		}
	}

	return violations;
}

/**
 * Recursively find all heading blocks in the document, including nested blocks
 *
 * @param {Array} blocks - Array of blocks to search through
 * @return {Array} Array of all heading blocks found
 */
function getAllHeadingBlocks(blocks) {
	const headingBlocks = [];

	function searchBlocks(blockList) {
		for (const block of blockList) {
			// Check if this block is a heading
			if (block.name === 'core/heading') {
				headingBlocks.push(block);
			}

			// Recursively search inner blocks
			if (block.innerBlocks && block.innerBlocks.length > 0) {
				searchBlocks(block.innerBlocks);
			}
		}
	}

	searchBlocks(blocks);
	return headingBlocks;
}

/**
 * Get heading hierarchy context for debugging
 *
 * @return {Array} Array of heading information for debugging purposes.
 */
function getHeadingHierarchy() {
	const blocks = select('core/block-editor').getBlocks();
	const headingBlocks = blocks.filter(block => block.name === 'core/heading');

	return headingBlocks.map(block => ({
		level: block.attributes.level || 2,
		content: block.attributes.content || '',
		clientId: block.clientId,
	}));
}

// Export for potential external use or debugging
export { getHeadingHierarchy };
