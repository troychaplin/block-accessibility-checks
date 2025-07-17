/**
 * Validation Hooks System
 *
 * Provides a unified JavaScript-only validation system that integrates
 * with the WordPress block editor.
 */

// Get block check configuration from PHP
const blockAccessibilityChecks = window.BlockAccessibilityChecks || {};
const blockChecksConfig = blockAccessibilityChecks.validationRules || {};

/**
 * Universal block validation function
 *
 * This function runs all registered validation checks for any block type.
 * External plugins can hook into this via wp.hooks.addFilter().
 *
 * @param {Object} block - The block object to validate
 * @return {Object} Validation result
 */
export function validateBlock(block) {
	// Only validate blocks that have registered checks
	if (!blockChecksConfig[block.name]) {
		return { isValid: true };
	}

	const attributes = block.attributes;
	const blockRules = blockChecksConfig[block.name];

	// Check each registered rule
	for (const [checkName, rule] of Object.entries(blockRules)) {
		// Skip disabled checks
		if (!rule.enabled) {
			continue;
		}

		// Use the new JavaScript-only validation system
		const isValid = wp.hooks.applyFilters(
			'ba11yc.validateBlock',
			true, // Default: validation passes
			block.name,
			attributes,
			checkName,
			rule
		);

		// If any check fails, return invalid
		if (!isValid) {
			return {
				isValid: false,
				mode: rule.type,
				clientId: block.clientId,
				name: block.name,
				message: rule.message,
				checkName,
			};
		}
	}

	return { isValid: true };
}
