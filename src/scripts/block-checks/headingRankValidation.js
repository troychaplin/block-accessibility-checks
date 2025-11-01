/**
 * Heading Rank Validation
 *
 * Provides validation logic for core/heading blocks to ensure proper heading hierarchy.
 * Validates both heading rank progression (no skipped levels) and first heading level appropriateness.
 *
 * Key features:
 * - Checks for skipped heading levels (e.g., H1 → H3)
 * - Validates first heading level based on available heading restrictions
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
 * Handles two types of heading validations:
 * - 'check_heading_rank': Ensures proper heading hierarchy without skipped levels
 * - 'check_heading_first_level': Validates the first heading uses appropriate level
 */
addFilter(
	'ba11yc_validate_block',
	'ba11yc/heading-rank-validation',
	(isValid, blockType, attributes, checkName, rule, block) => {
		// Only process core/heading blocks - ignore all other block types
		if (blockType !== 'core/heading') {
			return isValid;
		}

		// Extract clientId from various possible sources for identification
		// This helps with debugging and block-specific validation context
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

		// Route to the appropriate validation function based on the check type
		switch (checkName) {
			case 'check_heading_first_level':
				return validateFirstHeadingLevel(currentHeading);
			case 'check_heading_rank':
				return validateHeadingRank(currentHeading);
			default:
				return isValid;
		}
	}
);

/**
 * Validate first heading level appropriateness
 *
 * Ensures the first heading in the document uses an appropriate level based on
 * the plugin's heading level restrictions. Only validates when the current heading
 * is actually the first heading block in the document.
 *
 * Rules:
 * - If H1 is available (not restricted), only H1 is allowed as first heading
 * - If H1 is restricted but H2 is available, H2 is allowed as first heading
 * - If both H1 and H2 are restricted, first available level is allowed
 *
 * @param {Object} currentHeading            - The heading block being validated
 * @param {string} currentHeading.clientId   - Unique identifier for the heading block
 * @param {Object} currentHeading.attributes - Block attributes including level and content
 * @param {string} currentHeading.name       - Block type name (should be 'core/heading')
 * @return {boolean} True if valid, false if invalid
 */
function validateFirstHeadingLevel(currentHeading) {
	// Retrieve all blocks from the editor to find heading blocks
	const allBlocks = select('core/block-editor').getBlocks();

	// Extract all heading blocks in document order for first heading analysis
	const headingBlocks = getAllHeadingBlocks(allBlocks);

	// No headings means no first heading validation needed
	if (headingBlocks.length === 0) {
		return true;
	}

	// Identify the first heading block in the document
	const firstHeading = headingBlocks[0];

	// Determine if the current heading is the first heading by matching attributes
	const isFirstHeading =
		firstHeading.attributes.level === currentHeading.attributes.level &&
		firstHeading.attributes.content === currentHeading.attributes.content;

	// Only validate first heading level - other headings pass automatically
	if (!isFirstHeading) {
		return true;
	}

	// Retrieve heading level restrictions from plugin configuration
	const restrictedLevels =
		window.BlockAccessibilityChecks?.blockChecksOptions?.core_heading_levels || [];
	const isH1Restricted = restrictedLevels.includes('h1');

	const firstHeadingLevel = firstHeading.attributes.level || 2; // Default to h2 if no level specified

	// Rule: If H1 is available, first heading must be H1
	if (!isH1Restricted) {
		return firstHeadingLevel === 1;
	}

	// Rule: If H1 is restricted but H2 is available, first heading should be H2
	const isH2Restricted = restrictedLevels.includes('h2');
	if (!isH2Restricted) {
		return firstHeadingLevel === 2;
	}

	// Fallback: If both H1 and H2 are restricted, allow first available level
	// Note: In practice, H2 should always be available as a heading option
	return firstHeadingLevel >= 3;
}

/**
 * Validate heading rank hierarchy
 *
 * Checks if the current heading violates proper heading hierarchy rules by analyzing
 * the entire document's heading structure. Flags headings that participate in violations
 * (e.g., when a heading level is skipped).
 *
 * @param {Object} currentHeading            - The heading block being validated
 * @param {string} currentHeading.clientId   - Unique identifier for the heading block
 * @param {Object} currentHeading.attributes - Block attributes including level and content
 * @param {string} currentHeading.name       - Block type name (should be 'core/heading')
 * @return {boolean} True if valid (no violations), false if invalid (participates in violation)
 */
function validateHeadingRank(currentHeading) {
	const currentLevel = currentHeading.attributes.level || 2;

	// Retrieve all blocks from the editor, including those nested within groups, columns, etc.
	const allBlocks = select('core/block-editor').getBlocks();

	// Extract all heading blocks from the document, traversing nested block structures
	const headingBlocks = getAllHeadingBlocks(allBlocks);

	// Single heading or no headings cannot violate hierarchy rules
	if (headingBlocks.length <= 1) {
		return true;
	}

	// Build array of heading information in document order for hierarchy analysis
	const headingLevels = headingBlocks.map(block => ({
		level: block.attributes.level || 2, // Default to h2 if no level specified
		clientId: block.clientId,
		content: block.attributes.content || '',
	}));

	// Analyze the heading sequence for hierarchy violations (skipped levels)
	const violations = findHeadingViolations(headingLevels);

	// If no violations found, all headings are valid
	if (violations.length === 0) {
		return true;
	}

	// Determine if the current heading participates in any hierarchy violations
	const isProblematic = violations.some(violation => {
		// Check if this heading's level is the problematic one in any violation
		return violation.problematicLevel === currentLevel;
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
 * Each object contains: index, previousLevel, problematicLevel, and description.
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
