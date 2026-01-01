/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateAllMetaChecks } from '../validateMeta';

/**
 * React hook to retrieve meta field validation status.
 *
 * Fetches the current post type and meta field value from the editor store,
 * then runs all registered validation checks for that meta field. Returns
 * validation results including error/warning flags, issues array, and CSS
 * class name for styling the field based on validation state.
 *
 * Updates automatically when the meta field value changes due to useSelect reactivity.
 *
 * @param {string} metaKey - The meta key to validate (e.g., '_wp_page_template').
 * @return {Object} Validation result object containing:
 *   - isValid: Boolean indicating if validation passed
 *   - hasErrors: Boolean indicating if any errors exist
 *   - hasWarnings: Boolean indicating if any warnings exist
 *   - issues: Array of validation issue objects
 *   - wrapperClassName: CSS class for styling validation state
 */
export function useMetaValidation(metaKey) {
	return useSelect(
		select => {
			// Get editor selectors for post type and meta data
			const { getEditedPostAttribute, getCurrentPostType } = select('core/editor');
			const postType = getCurrentPostType();
			const meta = getEditedPostAttribute('meta');
			const value = meta ? meta[metaKey] : '';

			// Return valid state if required data is missing
			// This prevents validation errors when editor is not ready
			if (!postType || !metaKey) {
				return {
					isValid: true,
					hasErrors: false,
					hasWarnings: false,
					issues: [],
					wrapperClassName: '',
				};
			}

			// Run all registered validation checks for this meta field
			const result = validateAllMetaChecks(postType, metaKey, value);

			// Determine CSS class based on validation severity
			// Errors take precedence over warnings for styling
			let wrapperClassName = '';
			if (result.hasErrors) {
				wrapperClassName = 'ba11y-meta-error';
			} else if (result.hasWarnings) {
				wrapperClassName = 'ba11y-meta-warning';
			}

			// Return validation result with wrapper class appended
			return {
				...result,
				wrapperClassName,
			};
		},
		[metaKey]
	);
}
