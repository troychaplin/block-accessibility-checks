/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';

/**
 * Custom hook that debounces validation to prevent rapid re-renders during typing.
 *
 * Runs the validation function immediately on mount to establish initial state,
 * then debounces subsequent invocations.
 *
 * @param {Function} validationFn  - Function that performs validation and returns a result.
 * @param {Array}    deps          - Dependency array that triggers re-validation.
 * @param {Object}   options       - Configuration options.
 * @param {number}   options.delay - Debounce delay in milliseconds. Defaults to 300.
 * @return {*} The most recent validation result.
 */
export function useDebouncedValidation(validationFn, deps, options = {}) {
	const { delay = 300 } = options;

	const [result, setResult] = useState(() => validationFn());
	const timeoutRef = useRef(null);
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			setResult(validationFn());
			return;
		}

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setResult(validationFn());
		}, delay);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, deps); // eslint-disable-line react-hooks/exhaustive-deps

	return result;
}
