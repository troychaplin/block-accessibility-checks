import { useSelect } from '@wordpress/data';
import { validateAllMetaChecks } from '../validation';

/**
 * Hook to get meta validation status
 *
 * @param {string} metaKey - Meta key to validate
 * @return {Object} Validation object { isValid, hasErrors, hasWarnings, issues, wrapperClassName }
 */
export function useMetaValidation(metaKey) {
	return useSelect(
		select => {
			const { getEditedPostAttribute, getCurrentPostType } = select('core/editor');
			const postType = getCurrentPostType();
			const meta = getEditedPostAttribute('meta');
			const value = meta ? meta[metaKey] : '';

			// Skip if no post type or meta
			if (!postType || !metaKey) {
				return {
					isValid: true,
					hasErrors: false,
					hasWarnings: false,
					issues: [],
					wrapperClassName: '',
				};
			}

			const result = validateAllMetaChecks(postType, metaKey, value);

			// Determine wrapper class
			let wrapperClassName = '';
			if (result.hasErrors) {
				wrapperClassName = 'ba11y-meta-error';
			} else if (result.hasWarnings) {
				wrapperClassName = 'ba11y-meta-warning';
			}

			return {
				...result,
				wrapperClassName,
			};
		},
		[metaKey]
	);
}
