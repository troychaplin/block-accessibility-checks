/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useMetaValidation } from './useMetaValidation';

/**
 * Custom hook to manage meta field state and validation.
 *
 * @param {string} metaKey      The meta key to manage.
 * @param {string} originalHelp The original help text for the control.
 * @return {Object} Props to be spread onto the control (value, onChange, help, className).
 */
export function useMetaField(metaKey, originalHelp = '') {
	const validation = useMetaValidation(metaKey);

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

	let helpText = originalHelp;

	// If there are validation issues, append them to the help text
	if (validation && (validation.hasErrors || validation.hasWarnings)) {
		// Extract messages
		const messages = validation.issues
			.map(issue => issue.message || issue.error_msg || issue.warning_msg)
			.join('. ');

		// Determine class for the message
		const messageClass = validation.hasErrors ? 'ba11y-error-text' : 'ba11y-warning-text';

		if (helpText) {
			helpText = (
				<>
					{helpText}
					<br />
					<span className={messageClass}>{messages}</span>
				</>
			);
		} else {
			helpText = <span className={messageClass}>{messages}</span>;
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
