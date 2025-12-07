/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { isCheckEnabled, createIssue, createValidationResult } from '../core/utils/issueHelpers';

/**
 * Editor validation rules configuration from PHP
 *
 * Contains validation rules registered server-side for editor-level checks.
 * These rules are post-type specific and validate overall document structure
 * rather than individual blocks. Rules are exposed via the window object by PHP.
 */
const editorChecksConfig = window.BlockAccessibilityChecks?.editorValidationRules || {};

/**
 * Validates entire editor content against editor-level validation rules.
 *
 * Runs all registered validation checks for the overall editor/document state,
 * which differ from block-level validation by checking document-wide requirements
 * (e.g., heading hierarchy, required content sections). External plugins can hook
 * into the validation process via the 'ba11yc_validate_editor' filter.
 *
 * @param {string} postType - The current post type (e.g., 'post', 'page').
 * @param {Array}  blocks   - Array of all block objects in the editor.
 * @return {Object} Validation result containing isValid flag, issues array, and error/warning flags.
 */
export function validateEditor(postType, blocks) {
	// Get validation rules specific to this post type
	const postTypeRules = editorChecksConfig[postType] || {};
	const issues = [];

	// Iterate through each registered validation rule for this post type
	for (const [checkName, rule] of Object.entries(postTypeRules)) {
		// Skip rules that have been explicitly disabled
		if (!isCheckEnabled(rule)) {
			continue;
		}

		/**
		 * Filter: ba11yc_validate_editor
		 *
		 * Allows external plugins to implement validation logic for editor-level checks.
		 * Plugins should return false if validation fails, true if it passes.
		 */
		const isValid = applyFilters(
			'ba11yc_validate_editor',
			true,
			blocks,
			postType,
			checkName,
			rule
		);

		// Build issue object if validation failed
		if (!isValid) {
			// Create issue object with all relevant information
			const issue = createIssue(rule, checkName);
			// Ensure checkName is included (createIssue uses 'check' as primary key)
			issue.checkName = checkName;
			issues.push(issue);
		}
	}

	// Sort issues by priority (errors first, then warnings, then others)
	// This ensures the most critical issues appear first in the UI
	issues.sort((a, b) => a.priority - b.priority);

	// Return comprehensive validation result
	return createValidationResult(issues);
}
