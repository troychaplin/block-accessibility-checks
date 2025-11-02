import { useSelect } from '@wordpress/data';
import { validateAllMetaChecks } from './validateMeta';

/**
 * Hook that returns validation state for a meta field
 * Internal use only - not exported globally
 *
 * @param {string} metaKey - The meta key to validate
 * @return {Object} Validation state object
 */
export function useMetaValidation(metaKey) {
	const { validation } = useSelect(
		select => {
			const editor = select('core/editor');
			const meta = editor.getEditedPostAttribute('meta') || {};
			const currentPostType = editor.getCurrentPostType();
			const fieldValue = meta[metaKey];

			return {
				postType: currentPostType,
				value: fieldValue,
				validation: validateAllMetaChecks(currentPostType, metaKey, fieldValue),
			};
		},
		[metaKey]
	);

	return {
		isValid: validation.isValid,
		hasErrors: validation.hasErrors,
		hasWarnings: validation.hasWarnings,
		issues: validation.issues,
		errors: validation.issues.filter(issue => issue.type === 'error'),
		warnings: validation.issues.filter(issue => issue.type === 'warning'),
		wrapperClassName: (() => {
			if (validation.hasErrors) {
				return 'meta-field-error';
			}
			if (validation.hasWarnings) {
				return 'meta-field-warning';
			}
			return '';
		})(),
	};
}
