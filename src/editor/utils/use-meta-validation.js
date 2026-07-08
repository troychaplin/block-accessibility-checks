/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateAllMetaChecks } from './validate-meta';

/**
 * React hook to retrieve meta field validation status.
 *
 * @param {string} metaKey - The meta key to validate.
 * @return {Object} Validation result object including wrapperClassName.
 */
export function useMetaValidation(metaKey) {
	return useSelect(
		select => {
			const { getEditedPostAttribute, getCurrentPostType } = select('core/editor');
			const postType = getCurrentPostType();
			const meta = getEditedPostAttribute('meta');
			const value = meta ? meta[metaKey] : '';

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

			let wrapperClassName = '';
			if (result.hasErrors) {
				wrapperClassName = 'ba11yc-meta-error';
			} else if (result.hasWarnings) {
				wrapperClassName = 'ba11yc-meta-warning';
			}

			return {
				...result,
				wrapperClassName,
			};
		},
		[metaKey]
	);
}
