/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateAllMetaChecks } from './validate-meta';

/**
 * Custom React hook to manage meta field state, validation, and UI integration.
 *
 * Spread the returned object onto a `TextControl` (or compatible component) to
 * wire value, change handler, help text, and validation styling in one line.
 *
 * @param {string} metaKey      - The meta key to manage (e.g., 'seo_description').
 * @param {string} originalHelp - Optional help text to display alongside validation messages.
 * @return {Object} Props for TextControl: { value, onChange, help, className }.
 */
export function useMetaField(metaKey, originalHelp = '') {
	const { value, validation } = useSelect(
		select => {
			const editor = select('core/editor');
			if (!editor) {
				return {
					value: '',
					validation: {
						isValid: true,
						hasErrors: false,
						hasWarnings: false,
						issues: [],
						wrapperClassName: '',
					},
				};
			}

			const postType = editor.getCurrentPostType();
			const meta = editor.getEditedPostAttribute('meta');
			const currentValue = meta ? meta[metaKey] : '';

			if (!postType || !metaKey) {
				return {
					value: currentValue,
					validation: {
						isValid: true,
						hasErrors: false,
						hasWarnings: false,
						issues: [],
						wrapperClassName: '',
					},
				};
			}

			const result = validateAllMetaChecks(postType, metaKey, currentValue);

			let wrapperClassName = '';
			if (result.hasErrors) {
				wrapperClassName = 'ba11yc-meta-error';
			} else if (result.hasWarnings) {
				wrapperClassName = 'ba11yc-meta-warning';
			}

			return {
				value: currentValue,
				validation: { ...result, wrapperClassName },
			};
		},
		[metaKey]
	);

	const { editPost } = useDispatch('core/editor');

	let helpText = originalHelp;
	if (validation && (validation.hasErrors || validation.hasWarnings)) {
		const messages = validation.issues
			.map(issue => issue.message || issue.errorMsg || issue.warningMsg)
			.join('. ');
		const messageClass = validation.hasErrors ? 'ba11yc-error-text' : 'ba11yc-warning-text';

		if (helpText) {
			helpText = (
				<>
					{helpText}
					<span className={messageClass}>* {messages}</span>
				</>
			);
		} else {
			helpText = <span className={messageClass}>* {messages}</span>;
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
		className: validation?.wrapperClassName
			? `ba11yc-field ${validation.wrapperClassName}`
			: '',
	};
}
