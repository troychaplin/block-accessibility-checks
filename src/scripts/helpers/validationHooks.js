/**
 * Validation Hooks System
 *
 * Provides a unified JavaScript-only validation system that integrates
 * with the WordPress block editor.
 */

import { addFilter } from '@wordpress/hooks';

// Get validation rules from PHP
const blockAccessibilityChecks = window.BlockAccessibilityChecks || {};
const validationRules = blockAccessibilityChecks.validationRules || {};

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
	if (!validationRules[block.name]) {
		return { isValid: true };
	}

	const attributes = block.attributes;
	const blockRules = validationRules[block.name];

	// Check each registered rule
	for (const [checkName, rule] of Object.entries(blockRules)) {
		// Skip disabled checks
		if (!rule.enabled) {
			continue;
		}

		// Allow external plugins to provide validation logic
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

/**
 * Integration with existing block validation system
 *
 * This hooks into the existing block checks infrastructure to provide
 * the new unified validation system.
 */
addFilter(
	'ba11yc.blockValidation',
	'ba11yc/unified-validation',
	(originalResult, block) => {
		// Try the new validation system first
		const newResult = validateBlock(block);

		// If new system finds an issue, use it
		if (!newResult.isValid) {
			return newResult;
		}

		// Otherwise, fall back to original result
		return originalResult;
	},
	5 // High priority to run early
);
