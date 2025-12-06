/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useMetaValidation } from './useMetaValidation';

/**
 * Custom React hook to manage meta field state, validation, and UI integration.
 *
 * Provides a unified interface for meta field controls in the editor, handling:
 * - Reading current meta field value from the editor store
 * - Updating meta field value when user changes input
 * - Displaying validation errors/warnings in the help text
 * - Applying validation-specific CSS classes for styling
 *
 * This hook integrates validation results into the field's help text, appending
 * error or warning messages to provide immediate feedback to users.
 *
 * @param {string} metaKey      - The meta key to manage (e.g., '_wp_page_template').
 * @param {string} originalHelp - Optional original help text to display alongside validation messages.
 * @return {Object} Object containing value, onChange handler, help text, and className for the control.
 */
export function useMetaField(metaKey, originalHelp = '') {
	// Get validation state for this meta field
	const validation = useMetaValidation(metaKey);

	// Retrieve current meta field value from the editor store
	const { value } = useSelect(
		select => {
			const editor = select('core/editor');
			// Guard against editor not being available (e.g., in site editor)
			if (!editor) {
				return { value: '' };
			}

			// Get the meta object and extract the value for this specific meta key
			const meta = editor.getEditedPostAttribute('meta');
			return {
				value: meta ? meta[metaKey] : '',
			};
		},
		[metaKey]
	);

	// Get dispatch function to update meta field value
	const { editPost } = useDispatch('core/editor');

	// Start with the original help text (if provided)
	let helpText = originalHelp;

	// Enhance help text with validation messages if issues exist
	if (validation && (validation.hasErrors || validation.hasWarnings)) {
		// Extract all validation messages from issues
		// Priority: message > error_msg > warning_msg
		const messages = validation.issues
			.map(issue => issue.message || issue.error_msg || issue.warning_msg)
			.join('. ');

		// Determine CSS class based on severity (errors take precedence)
		const messageClass = validation.hasErrors ? 'ba11y-error-text' : 'ba11y-warning-text';

		// Append validation messages to existing help text, or create new help text
		if (helpText) {
			// Combine original help with validation messages
			helpText = (
				<>
					{helpText}
					<span className={messageClass}>* {messages}</span>
				</>
			);
		} else {
			// Use only validation messages if no original help text exists
			helpText = <span className={messageClass}>* {messages}</span>;
		}
	}

	// Return props object to be spread onto the meta field control
	return {
		// Current meta field value (default to empty string)
		value: value || '',
		// Handler to update meta field when user changes input
		onChange: newValue => {
			if (editPost) {
				editPost({ meta: { [metaKey]: newValue } });
			}
		},
		// Help text with validation messages appended if issues exist
		help: helpText,
		// CSS classes for styling validation state (error/warning indicators)
		className: validation?.wrapperClassName ? `ba11y-field ${validation.wrapperClassName}` : '',
	};
}
