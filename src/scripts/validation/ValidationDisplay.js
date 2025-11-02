import { useMetaValidation } from './useMetaValidation';

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
	const validation = useMetaValidation(metaKey);

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
			{children}
			{validationMessages}
		</div>
	);
}
