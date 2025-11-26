import { useSelect } from '@wordpress/data';
import { useRef, useEffect, useState } from '@wordpress/element';
import { validateAllMetaChecks } from './validateMeta';
import { MetaIndicator } from '../components/MetaIndicator';

/**
 * ValidationDisplay - Shared component for displaying validation
 * Internal component - handles all validation display logic in ONE place
 *
 * @param {Object}                    props                     - Component props
 * @param {string}                    props.metaKey             - Meta key to validate
 * @param {import('react').ReactNode} props.children            - Content to wrap
 * @param {boolean}                   [props.showMessages=true] - Whether to show validation messages
 * @param {boolean}                   [props.skipWrapper=false] - Skip the wrapper div (when parent provides it)
 * @return {import('react').ReactElement} - Rendered validation display component
 */
export function ValidationDisplay({ metaKey, children, showMessages = true, skipWrapper = false }) {
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

	// No validation issues - return children as-is
	if (validation.isValid) {
		return children;
	}

	// Validation messages component (reused everywhere)
	const validationMessages = showMessages && validation.issues.length > 0 && (
		<div className="meta-validation-messages">
			{validation.errors.map((error, index) => (
				<p key={`error-${index}`} className="meta-validation-error">
					{error.error_msg}
				</p>
			))}
			{validation.warnings.map((warning, index) => (
				<p key={`warning-${index}`} className="meta-validation-warning">
					{warning.warning_msg || warning.error_msg}
				</p>
			))}
		</div>
	);

	// If skipWrapper is true, parent will provide the wrapper
	if (skipWrapper) {
		return (
			<>
				{children}
				{validationMessages}
			</>
		);
	}

	// Otherwise, provide the wrapper
	return (
		<div className={validation.wrapperClassName}>
			<MetaIndicator issues={validation.issues} metaKey={metaKey} />
			{children}
			{validationMessages}
		</div>
	);
}
