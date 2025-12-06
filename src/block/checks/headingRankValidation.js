/**
 * Heading Rank Validation
 *
 * Provides validation logic for core/heading blocks to ensure proper heading hierarchy.
 * Validates heading rank progression to prevent skipped levels.
 *
 * Key features:
 * - Checks for skipped heading levels (e.g., H1 → H3)
 * - Validates that the first heading is H1 or H2
 * - Works with nested blocks (groups, columns, etc.)
 * - Integrates with the ba11yc validation system
 */

import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

// Note: Each heading block is validated independently against the document-wide
// heading hierarchy, so no per-block caching is needed.

/**
 * Register heading block validation logic with the ba11yc validation system
 *
 * Handles heading rank validation:
 * - 'check_heading_rank': Ensures proper heading hierarchy without skipped levels and validates first heading is H1 or H2
 */
addFilter(
	'ba11yc_validate_block',
	'ba11yc/headingRankValidation',
	(isValid, blockType, attributes, checkName, block) => {
		// Only process core/heading blocks - ignore all other block types
		if (blockType !== 'core/heading') {
			return isValid;
		}

		// Route to the appropriate validation function based on the check type
		// 'check_heading_order' is the key in defaultChecks in validation.js
		if (checkName === 'check_heading_order' || checkName === 'check_heading_rank') {
			// We need the full block object to identify it in the hierarchy
			if (!block || !block.clientId) {
				// Cannot validate hierarchy without clientId
				return isValid;
			}

			return validateHeadingRank({
				clientId: block.clientId,
				attributes,
				name: blockType,
			});
		}

		return isValid;
	}
);

/**
 * Validate heading rank hierarchy
 *
 * Checks if the current heading violates proper heading hierarchy rules by analyzing
 * the entire document's heading structure. Flags headings that participate in violations
 * (e.g., when a heading level is skipped, or when the first heading is not H1 or H2).
 *
 * @param {Object} currentHeading            - The heading block being validated
 * @param {string} currentHeading.clientId   - Unique identifier for the heading block
 * @param {Object} currentHeading.attributes - Block attributes including level and content
 * @param {string} currentHeading.name       - Block type name (should be 'core/heading')
 * @return {boolean} True if valid (no violations), false if invalid (participates in violation)
 */
function validateHeadingRank(currentHeading) {
	// Retrieve all blocks from the editor, including those nested within groups, columns, etc.
	const allBlocks = select('core/block-editor').getBlocks();

	// Extract all heading blocks from the document, traversing nested block structures
	const headingBlocks = getAllHeadingBlocks(allBlocks);

	// No headings means no validation needed
	if (headingBlocks.length === 0) {
		return true;
	}

	// Build array of heading information in document order for hierarchy analysis
	const headingLevels = headingBlocks.map(block => ({
		level: block.attributes.level || 2, // Default to h2 if no level specified
		clientId: block.clientId,
		content: block.attributes.content || '',
	}));

	// Check if the first heading is H1 or H2
	const firstHeading = headingLevels[0];
	const isFirstHeading = firstHeading.clientId === currentHeading.clientId;

	if (isFirstHeading) {
		const firstHeadingLevel = firstHeading.level;
		// First heading must be H1 or H2
		if (firstHeadingLevel !== 1 && firstHeadingLevel !== 2) {
			return false;
		}
	}

	// Single heading - only need to check first heading level (already done above)
	if (headingBlocks.length === 1) {
		return true;
	}

	// Analyze the heading sequence for hierarchy violations (skipped levels)
	const violations = findHeadingViolations(headingLevels);

	// If no violations found, all headings are valid
	if (violations.length === 0) {
		return true;
	}

	// Determine if the current heading participates in any hierarchy violations
	// Match by clientId to ensure we flag the correct specific heading block
	const isProblematic = violations.some(violation => {
		// Check if this heading's clientId matches the problematic heading's clientId
		return violation.problematicClientId === currentHeading.clientId;
	});

	// Validation fails if this heading is part of a hierarchy violation
	return !isProblematic;
}

/**
 * Identify heading hierarchy violations in the document
 *
 * Analyzes the sequence of heading levels to find instances where heading levels
 * are skipped (e.g., H1 followed directly by H3, skipping H2).
 *
 * @param {Array}  headingLevels            - Array of heading objects in document order
 * @param {number} headingLevels[].level    - The heading level (1-6)
 * @param {string} headingLevels[].clientId - Unique block identifier
 * @param {string} headingLevels[].content  - Heading text content
 * @return {Array<Object>} Array of violation objects describing each hierarchy problem.
 * Each object contains: index, previousLevel, problematicLevel, problematicClientId, and description.
 */
function findHeadingViolations(headingLevels) {
	const violations = [];

	for (let i = 1; i < headingLevels.length; i++) {
		const currentLevel = headingLevels[i].level;
		const previousLevel = headingLevels[i - 1].level;

		// Detect skipped heading levels (e.g., H1 → H3 skips H2)
		if (currentLevel > previousLevel + 1) {
			violations.push({
				index: i,
				previousLevel,
				problematicLevel: currentLevel,
				problematicClientId: headingLevels[i].clientId, // Add clientId to identify the specific problematic heading
				description: `H${currentLevel} after H${previousLevel} skips levels`,
			});
		}
	}

	return violations;
}

/**
 * Recursively extract all heading blocks from the document structure
 *
 * Traverses the block hierarchy to find all core/heading blocks, including those
 * nested within groups, columns, or other container blocks.
 *
 * @param {Array}  blocks               - Array of blocks to search through (typically all editor blocks)
 * @param {string} blocks[].name        - Block type name
 * @param {Array}  blocks[].innerBlocks - Nested blocks (optional)
 * @param {Object} blocks[].attributes  - Block attributes (optional)
 * @return {Array} Array of all core/heading blocks found in document order
 */
function getAllHeadingBlocks(blocks) {
	const headingBlocks = [];

	function searchBlocks(blockList) {
		for (const block of blockList) {
			// Collect core/heading blocks as we find them
			if (block.name === 'core/heading') {
				headingBlocks.push(block);
			}

			// Continue searching in nested block structures
			if (block.innerBlocks && block.innerBlocks.length > 0) {
				searchBlocks(block.innerBlocks);
			}
		}
	}

	searchBlocks(blocks);
	return headingBlocks;
}

/**
 * Get heading hierarchy context for debugging and analysis
 *
 * Provides a simplified view of all headings in the document for debugging
 * purposes or external analysis. Only searches top-level blocks (not nested).
 *
 * @return {Array<Object>} Array of heading information objects.
 * Each object contains: level, content, and clientId.
 */
function getHeadingHierarchy() {
	// Get top-level blocks only (this is a simplified version for debugging)
	const blocks = select('core/block-editor').getBlocks();
	const headingBlocks = blocks.filter(block => block.name === 'core/heading');

	return headingBlocks.map(block => ({
		level: block.attributes.level || 2,
		content: block.attributes.content || '',
		clientId: block.clientId,
	}));
}

// Export utility function for external debugging and analysis
export { getHeadingHierarchy };
