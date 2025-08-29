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
			issues: [],
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
					result.isValid ? { isValid: true, mode: 'none', issues: [] } : result
				);
			}

			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, [name, attributes, clientId]);

		// Generate messages for all issues
		const issues = validationResult.issues || [];

		// Group issues by type
		const errors = issues.filter(issue => issue.type === 'error');
		const warnings = issues.filter(issue => issue.type === 'warning');

		return (
			<>
				{validationResult.mode !== 'none' && (
					<InspectorControls>
						<PanelBody
							title={__('Validation & Accessibility', 'block-accessibility-checks')}
							initialOpen={true}
						>
							{/* Display Errors Group */}
							{errors.length > 0 && (
								<PanelRow>
									<div className="a11y-error-group">
										<p className="a11y-error-msg">
											<strong>
												{__(
													'Accessibility Errors',
													'block-accessibility-checks'
												)}
											</strong>
										</p>
										<ul className="a11y-error-list">
											{errors.map((issue, index) => (
												<li key={`error-${issue.checkName}-${index}`}>
													{issue.error_msg}
												</li>
											))}
										</ul>
									</div>
								</PanelRow>
							)}

							{/* Display Warnings Group */}
							{warnings.length > 0 && (
								<PanelRow>
									<div className="a11y-warning-group">
										<p className="a11y-warning-msg">
											<strong>
												{__(
													'Accessibility Warnings',
													'block-accessibility-checks'
												)}
											</strong>
										</p>
										<ul className="a11y-warning-list">
											{warnings.map((issue, index) => (
												<li key={`warning-${issue.checkName}-${index}`}>
													{issue.warning_msg || issue.error_msg}
												</li>
											))}
										</ul>
									</div>
								</PanelRow>
							)}
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
