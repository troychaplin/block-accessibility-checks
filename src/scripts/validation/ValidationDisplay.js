import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useRef, useEffect, useState, cloneElement, isValidElement } from '@wordpress/element';
import { validateAllMetaChecks } from './validateMeta';

/**
 * ValidationDisplay - Shared component for displaying validation
 * Internal component - handles all validation display logic in ONE place
 *
 * @param {Object}                    props                     - Component props
 * @param {string}                    props.metaKey             - Meta key to validate
 * @param {import('react').ReactNode} props.children            - Content to wrap
 * @param {boolean}                   [props.showMessages=true] - Whether to show validation messages
 * @return {import('react').ReactElement} - Rendered validation display component
 */
export function ValidationDisplay({ metaKey, children, showMessages = true }) {
	// Get current meta value and post type
	const { currentValue, postType } = useSelect(
		select => {
			const editor = select('core/editor');
			const meta = editor.getEditedPostAttribute('meta') || {};
			return {
				currentValue: meta[metaKey],
				postType: editor.getCurrentPostType(),
			};
		},
		[metaKey]
	);

	const [validationResult, setValidationResult] = useState({
		isValid: true,
		issues: [],
		hasErrors: false,
		hasWarnings: false,
	});

	const timeoutRef = useRef(null);
	const prevValueRef = useRef(currentValue);

	useEffect(() => {
		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// If value changed, add a delay before validating
		if (prevValueRef.current !== currentValue) {
			timeoutRef.current = setTimeout(() => {
				const result = validateAllMetaChecks(postType, metaKey, currentValue);
				setValidationResult(result);
			}, 1000); // 1 second delay like image alt text

			prevValueRef.current = currentValue;
		} else {
			// Immediate validation for initial render or when value hasn't changed
			const result = validateAllMetaChecks(postType, metaKey, currentValue);
			setValidationResult(result);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [currentValue, postType, metaKey]);

	// Calculate wrapper class name
	const wrapperClassName = (() => {
		if (validationResult.hasErrors) {
			return 'meta-field-error';
		}
		if (validationResult.hasWarnings) {
			return 'meta-field-warning';
		}
		return '';
	})();

	// Create validation object that matches useMetaValidation interface
	const validation = {
		...validationResult,
		errors: validationResult.issues.filter(issue => issue.type === 'error'),
		warnings: validationResult.issues.filter(issue => issue.type === 'warning'),
		wrapperClassName,
	};

	// If children is a single valid element and we have validation issues,
	// inject message into the placeholder
	if (showMessages && validation.issues.length > 0 && isValidElement(children)) {
		let messageText = '';
		if (validation.errors.length > 0) {
			messageText = __('Required', 'block-accessibility-checks');
		} else if (validation.warnings.length > 0) {
			messageText = __('Recommended', 'block-accessibility-checks');
		}

		if (messageText) {
			const existingPlaceholder = children.props.placeholder || '';
			// Only wrap in parens if appending to existing placeholder
			const finalMessage = existingPlaceholder
				? `${existingPlaceholder} (${messageText})`
				: messageText;

			return cloneElement(children, {
				placeholder: finalMessage,
				className: `${children.props.className || ''} ${wrapperClassName}`.trim(),
			});
		}
	}

	// Fallback: if we can't inject into placeholder (e.g. multiple children),
	// render simple text above
	if (showMessages && validation.issues.length > 0) {
		let fallbackMessage = '';
		if (validation.errors.length > 0) {
			fallbackMessage = __('Required', 'block-accessibility-checks');
		} else if (validation.warnings.length > 0) {
			fallbackMessage = __('Recommended', 'block-accessibility-checks');
		}

		if (fallbackMessage) {
			// For fallback, we can try to apply the class to the children if possible
			const childrenWithClass = isValidElement(children)
				? cloneElement(children, {
						className: `${children.props.className || ''} ${wrapperClassName}`.trim(),
					})
				: children;

			return (
				<>
					<div className="meta-validation-fallback-message">{fallbackMessage}</div>
					{childrenWithClass}
				</>
			);
		}
	}

	// Even if no validation message (or showMessages is false), we still need to apply the class for border styling if there are issues
	if (wrapperClassName && isValidElement(children)) {
		return cloneElement(children, {
			className: `${children.props.className || ''} ${wrapperClassName}`.trim(),
		});
	}

	return children;
}
