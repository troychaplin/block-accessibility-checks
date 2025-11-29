import { useMetaValidation } from './useMetaValidation';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Hook that returns props for a validated input field
 *
 * This hook handles the entire state management for a meta field,
 * including fetching the value, handling updates, and providing
 * validation feedback.
 *
 * It is designed to be robust: if the meta key doesn't exist
 * (e.g., wrong post type), it gracefully returns empty values
 * without crashing, allowing for unconditional hook usage.
 *
 * @param {string} metaKey        - The meta key to validate
 * @param {string} [originalHelp] - Optional original help text to preserve
 * @return {Object} Props object to spread onto the component
 *
 * @example
 * const props = useMetaField('band_origin', 'Enter the city');
 * <TextControl label="City" {...props} />
 */
export function useMetaField(metaKey, originalHelp = '') {
	// Get validation state - assume unconditional usage safe inside useMetaValidation too
	// If useMetaValidation assumes post type matches, we might need to guard it,
	// but typically useSelect inside it will just return undefined/empty.
	const validation = useMetaValidation(metaKey);

	// Get current value and setter
	const { value } = useSelect(
		select => {
			const editor = select('core/editor');
			if (!editor) {
				return { value: '' };
			}

			const meta = editor.getEditedPostAttribute('meta');
			return {
				value: meta ? meta[metaKey] : '',
			};
		},
		[metaKey]
	);

	const { editPost } = useDispatch('core/editor');

	// Construct the help text
	let helpText = originalHelp;

	if (validation && (validation.hasErrors || validation.hasWarnings)) {
		const messages = validation.issues
			.map(issue => issue.message || issue.error_msg || issue.warning_msg)
			.join('. ');

		if (helpText) {
			helpText = (
				<>
					{helpText}
					<br />
					<span
						className={validation.hasErrors ? 'ba11y-error-text' : 'ba11y-warning-text'}
					>
						{messages}
					</span>
				</>
			);
		} else {
			helpText = (
				<span className={validation.hasErrors ? 'ba11y-error-text' : 'ba11y-warning-text'}>
					{messages}
				</span>
			);
		}
	}

	return {
		value: value || '',
		onChange: newValue => {
			if (editPost) {
				editPost({ meta: { [metaKey]: newValue } });
			}
		},
		help: helpText,
		className: validation?.wrapperClassName ? `ba11y-field ${validation.wrapperClassName}` : '',
	};
}

// Alias for backwards compatibility if needed, or just export both
export const useMetaValidationProps = useMetaField;
