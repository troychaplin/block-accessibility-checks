/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateAllMetaChecks } from './validate-meta';
import { getMetaValidationRules } from './get-validation-config';

/**
 * React hook that retrieves all invalid meta field validations for the current post.
 *
 * @return {Array} Array of validation results for meta fields that failed validation.
 */
export function useInvalidMeta() {
	const { postType, meta } = useSelect(select => {
		const editor = select('core/editor');
		return {
			postType: editor.getCurrentPostType(),
			meta: editor.getEditedPostAttribute('meta'),
		};
	}, []);

	const postTypeRules = getMetaValidationRules()[postType] || {};

	const invalidMeta = [];

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
