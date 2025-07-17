import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { useRef, useEffect, useState } from '@wordpress/element';
import { validateBlock } from './validationHooks';

/**
 * A higher-order component that adds error handling and accessibility checks to a block component.
 *
 * @param {Function} BlockEdit - The block component to wrap with error handling.
 * @return {Function} - The wrapped block component with error handling.
 */
const withErrorHandling = createHigherOrderComponent(BlockEdit => {
	return props => {
		const { name, attributes, clientId } = props;
		const [validationResult, setValidationResult] = useState({
			isValid: true,
			mode: 'none',
			message: '',
		});
		const timeoutRef = useRef(null);
		const prevAltRef = useRef(attributes.alt);

		useEffect(() => {
			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// For image blocks with alt text changes, add a delay
			if (name === 'core/image' && prevAltRef.current !== attributes.alt) {
				timeoutRef.current = setTimeout(() => {
					// Use unified validation system
					const result = validateBlock({ name, attributes, clientId });
					setValidationResult(
						result.isValid ? { isValid: true, mode: 'none', message: '' } : result
					);
				}, 1500);

				prevAltRef.current = attributes.alt;
			} else {
				// Immediate validation for other cases using unified system
				const result = validateBlock({ name, attributes, clientId });
				setValidationResult(
					result.isValid ? { isValid: true, mode: 'none', message: '' } : result
				);
			}

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, [name, attributes, clientId]);

		// Determine the message based on the validation result
		let message = '';
		if (validationResult.message) {
			message = validationResult.message;
		} else if (validationResult.mode === 'error') {
			message = __(
				'Accessibility Error: This block does not meet accessibility standards.',
				'block-accessibility-checks'
			);
		} else if (validationResult.mode === 'warning') {
			message = __(
				'Accessibility Warning: This block may have accessibility issues.',
				'block-accessibility-checks'
			);
		}

		return (
			<>
				{validationResult.mode !== 'none' && (
					<InspectorControls>
						<PanelBody
							title={__('Accessibility Check', 'block-accessibility-checks')}
							initialOpen={true}
						>
							<PanelRow>
								<p
									className={
										validationResult.mode === 'error'
											? 'a11y-error-msg'
											: 'a11y-warning-msg'
									}
								>
									{message}
								</p>
							</PanelRow>
						</PanelBody>
					</InspectorControls>
				)}
				{validationResult.mode !== 'none' && (
					<div
						className={
							validationResult.mode === 'error'
								? 'a11y-block-error'
								: 'a11y-block-warning'
						}
					>
						<BlockEdit {...props} />
					</div>
				)}
				{validationResult.mode === 'none' && <BlockEdit {...props} />}
			</>
		);
	};
}, 'withErrorHandling');

addFilter('editor.BlockEdit', 'block-accessibility-checks/with-error-handling', withErrorHandling);
