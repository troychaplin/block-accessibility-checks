/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateAllMetaChecks } from '../../../editor/validation/meta/validateMeta';

/**
 * React hook that retrieves all invalid meta field validations for the current post.
 *
 * Fetches the current post type and meta fields from the editor, then validates
 * each meta field that has registered validation rules. Meta validation checks
 * custom fields for accessibility and content requirements (e.g., featured image,
 * excerpt length, SEO fields). Updates automatically when post meta changes.
 *
 * @return {Array} Array of validation results for meta fields that failed validation.
 */
export function GetInvalidMeta() {
	// Retrieve current post type and meta fields from the editor store
	const { postType, meta } = useSelect(select => {
		const editor = select('core/editor');
		return {
			postType: editor.getCurrentPostType(),
			meta: editor.getEditedPostAttribute('meta'),
		};
	}, []);

	// Retrieve validation rules registered for this post type
	// Rules are registered via PHP and made available through the window object
	const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};
	const postTypeRules = metaValidationRules[postType] || {};

	const invalidMeta = [];

	// Iterate through each meta field with registered validation rules
	for (const metaKey of Object.keys(postTypeRules)) {
		const value = meta?.[metaKey];

		// Run all validation checks for this meta field
		const result = validateAllMetaChecks(postType, metaKey, value);

		// Collect failed validations with the meta key identifier
		if (!result.isValid) {
			invalidMeta.push({
				...result,
				metaKey,
			});
		}
	}

	return invalidMeta;
}
