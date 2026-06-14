/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { isCheckEnabled, createIssue, createValidationResult } from './issue-helpers';
import { getEditorValidationRules } from './get-validation-config';

/**
 * Validates entire editor content against editor-level validation rules.
 *
 * @param {string} postType - The current post type.
 * @param {Array}  blocks   - Array of all block objects in the editor.
 * @return {Object} Validation result.
 */
export function validateEditor(postType, blocks) {
	const postTypeRules = getEditorValidationRules()[postType] || {};
	const issues = [];

	for (const [checkName, rule] of Object.entries(postTypeRules)) {
		if (!isCheckEnabled(rule)) {
			continue;
		}

		/**
		 * Filter: ba11yc.validateEditor
		 *
		 * Allows external plugins to implement editor-level validation logic.
		 */
		const isValid = applyFilters(
			'ba11yc.validateEditor',
			true,
			blocks,
			postType,
			checkName,
			rule
		);

		if (!isValid) {
			const issue = createIssue(rule, checkName);
			issues.push(issue);
		}
	}

	issues.sort((a, b) => a.priority - b.priority);

	return createValidationResult(issues);
}
