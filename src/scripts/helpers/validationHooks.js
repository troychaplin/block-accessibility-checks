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
 * @return {Object} Validation result with all issues
 */
export function validateBlock(block) {
	// Only validate blocks that have registered checks
	if (!blockChecksConfig[block.name]) {
		return { isValid: true, issues: [] };
	}

	const attributes = block.attributes;
	const blockRules = blockChecksConfig[block.name];
	const issues = [];

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

		// If check fails, add to issues array
		if (!isValid) {
			let priority = 3; // Default priority
			if (rule.type === 'error') {
				priority = 1;
			} else if (rule.type === 'warning') {
				priority = 2;
			}

			issues.push({
				checkName,
				type: rule.type,
				message: rule.message,
				priority,
			});
		}
	}

	// Sort issues by priority (errors first, then warnings, then others)
	issues.sort((a, b) => a.priority - b.priority);

	// Determine overall validation status and primary mode
	const hasErrors = issues.some(issue => issue.type === 'error');
	const hasWarnings = issues.some(issue => issue.type === 'warning');

	let primaryMode = 'none';
	if (hasErrors) {
		primaryMode = 'error';
	} else if (hasWarnings) {
		primaryMode = 'warning';
	}

	return {
		isValid: issues.length === 0,
		issues,
		mode: primaryMode,
		clientId: block.clientId,
		name: block.name,
	};
}
