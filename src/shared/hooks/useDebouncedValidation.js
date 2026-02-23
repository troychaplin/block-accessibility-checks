/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';

/**
 * Custom hook that debounces validation to prevent rapid re-renders during typing.
 *
 * Runs the validation function immediately on mount to establish initial state,
 * then debounces subsequent invocations. This prevents focus loss and performance
 * issues caused by synchronous validation on every keystroke.
 *
 * @param {Function} validationFn  - Function that performs validation and returns a result.
 * @param {Array}    deps          - Dependency array that triggers re-validation.
 * @param {Object}   options       - Configuration options.
 * @param {number}   options.delay - Debounce delay in milliseconds. Defaults to 300.
 * @return {*} The most recent validation result.
 */
export function useDebouncedValidation(validationFn, deps, options = {}) {
	const { delay = 300 } = options;

	// Initialize state with immediate validation result
	const [result, setResult] = useState(() => validationFn());
	const timeoutRef = useRef(null);
	const isFirstRender = useRef(true);

	useEffect(() => {
		// Run synchronously on first render for immediate initial state
		if (isFirstRender.current) {
			isFirstRender.current = false;
			setResult(validationFn());
			return;
		}

		// Clear any pending debounced validation
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Schedule debounced validation
		timeoutRef.current = setTimeout(() => {
			setResult(validationFn());
		}, delay);

		// Cleanup timeout on unmount or before next effect
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, deps); // eslint-disable-line react-hooks/exhaustive-deps

	return result;
}
