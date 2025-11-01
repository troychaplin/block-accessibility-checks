import { useSelect } from '@wordpress/data';
import { validateAllMetaChecks } from './validate-meta';

/**
 * Get all invalid meta fields for current post
 *
 * @return {Array} Array of invalid meta validation results
 */
export function GetInvalidMeta() {
	const { postType, meta } = useSelect(select => {
		const editor = select('core/editor');
		return {
			postType: editor.getCurrentPostType(),
			meta: editor.getEditedPostAttribute('meta'),
		};
	}, []);

	const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};
	const postTypeRules = metaValidationRules[postType] || {};

	const invalidMeta = [];

	// Validate each meta field that has checks registered
	for (const metaKey of Object.keys(postTypeRules)) {
		const value = meta?.[metaKey];
		const result = validateAllMetaChecks(postType, metaKey, value);

		if (!result.isValid) {
			invalidMeta.push({
				...result,
				metaKey,
			});
		}
	}

	return invalidMeta;
}
