import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { useRef, useEffect, useState } from '@wordpress/element';
import { getBlockChecksArray } from '../registerPlugin';

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
			// Get current checks array (including external plugin checks)
			const blockChecksArray = getBlockChecksArray();

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// For image blocks with alt text changes, add a delay
			if (name === 'core/image' && prevAltRef.current !== attributes.alt) {
				timeoutRef.current = setTimeout(() => {
					// Run all applicable checks for this block
					const results = blockChecksArray.map(check =>
						check({ name, attributes, clientId })
					);
					const firstInvalid = results.find(result => !result.isValid);

					setValidationResult(
						firstInvalid || { isValid: true, mode: 'none', message: '' }
					);
				}, 1500);

				prevAltRef.current = attributes.alt;
			} else {
				// Immediate validation for other cases
				const results = blockChecksArray.map(check =>
					check({ name, attributes, clientId })
				);
				const firstInvalid = results.find(result => !result.isValid);

				setValidationResult(firstInvalid || { isValid: true, mode: 'none', message: '' });
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
