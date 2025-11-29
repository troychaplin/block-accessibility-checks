import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useRef, useEffect, useState } from '@wordpress/element';
import { validateAllMetaChecks } from './validateMeta';

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
			{validation.errors.map((errorIssue, index) => (
				<div key={`error-${index}`} className="meta-validation-error">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="8" cy="8" r="4" fill="#D82000" />
					</svg>
					<span>{__('Required', 'block-accessibility-checks')}</span>
				</div>
			))}
			{validation.warnings.map((warning, index) => (
				<div key={`warning-${index}`} className="meta-validation-warning">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="8" cy="8" r="4" fill="#DBC900" />
					</svg>
					<span>{__('Recommended', 'block-accessibility-checks')}</span>
				</div>
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
			{children}
			{validationMessages}
		</div>
	);
}
