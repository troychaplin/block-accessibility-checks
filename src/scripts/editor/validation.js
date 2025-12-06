/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

// Get editor check configuration from PHP
const editorChecksConfig = window.BlockAccessibilityChecks?.editorValidationRules || {};

/**
 * Validate entire editor content
 *
 * This function runs all registered validation checks for the overall editor state.
 * External plugins can hook into this via wp.hooks.addFilter().
 *
 * @param {string} postType - Current post type
 * @param {Array}  blocks   - All blocks in the editor
 * @return {Object} Validation result with all issues
 */
export function validateEditor(postType, blocks) {
	const postTypeRules = editorChecksConfig[postType] || {};
	const issues = [];

	// Check each registered rule
	for (const [checkName, rule] of Object.entries(postTypeRules)) {
		// Skip disabled checks
		if (!rule.enabled) {
			continue;
		}

		// Allow plugins to implement validation logic
		const isValid = applyFilters(
			'ba11yc_validate_editor',
			true,
			blocks,
			postType,
			checkName,
			rule
		);

		// If check fails, add to issues array
		if (!isValid) {
			let priority = 3;
			if (rule.type === 'error') {
				priority = 1;
			} else if (rule.type === 'warning') {
				priority = 2;
			}

			issues.push({
				checkName,
				type: rule.type,
				category: rule.category || 'accessibility',
				error_msg: rule.error_msg || rule.message || '',
				warning_msg: rule.warning_msg || rule.error_msg || rule.message || '',
				priority,
			});
		}
	}

	// Sort issues by priority
	issues.sort((a, b) => a.priority - b.priority);

	const hasErrors = issues.some(issue => issue.type === 'error');
	const hasWarnings = issues.some(issue => issue.type === 'warning');

	return {
		isValid: issues.length === 0,
		issues,
		hasErrors,
		hasWarnings,
	};
}
