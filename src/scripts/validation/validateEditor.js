/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Validate the entire editor state based on registered rules.
 *
 * @param {Array}  blocks   Array of all blocks in the editor.
 * @param {string} postType The current post type.
 * @return {Object} Validation result object with isValid boolean and array of errors/warnings.
 */
export function validateEditor(blocks, postType) {
	const editorValidationRules = window.BlockAccessibilityChecks?.editorValidationRules || {};
	const postTypeRules = editorValidationRules[postType] || {};
	const results = [];

	// Iterate over each registered check for this post type
	Object.entries(postTypeRules).forEach(([checkName, rule]) => {
		// Skip disabled checks
		if (rule.enabled === false || rule.type === 'none') {
			return;
		}

		// Run the validation filter
		const isValid = applyFilters(
			'ba11yc_validate_editor',
			true,
			blocks,
			postType,
			checkName,
			rule
		);

		if (!isValid) {
			results.push({
				checkName,
				...rule,
				isValid: false,
			});
		}
	});

	return {
		isValid: results.length === 0,
		results,
	};
}
