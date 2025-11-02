import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter, addAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { useRef, useEffect, useState } from '@wordpress/element';
import { validateBlock } from './validateBlocks';

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
		const prevHeadingLevelRef = useRef(attributes.level);

		// Listen for global heading structure changes
		useEffect(() => {
			if (name === 'core/heading') {
				const handleHeadingStructureChange = () => {
					// Re-validate this heading block when the document structure changes
					const result = validateBlock({ name, attributes, clientId });
					setValidationResult(
						result.isValid ? { isValid: true, mode: 'none', issues: [] } : result
					);
				};

				// Subscribe to heading structure changes
				addAction(
					'ba11yc.headingStructureChanged',
					`ba11yc/heading-validation-${clientId}`,
					handleHeadingStructureChange
				);

				// Cleanup function
				return () => {
					wp.hooks.removeAction(
						'ba11yc.headingStructureChanged',
						`ba11yc/heading-validation-${clientId}`
					);
				};
			}
		}, [name, attributes, clientId]);

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
			} else if (
				name === 'core/heading' &&
				prevHeadingLevelRef.current !== attributes.level
			) {
				// For heading blocks with level changes, add a small delay
				timeoutRef.current = setTimeout(() => {
					// Use unified validation system
					const result = validateBlock({ name, attributes, clientId });
					setValidationResult(
						result.isValid ? { isValid: true, mode: 'none', issues: [] } : result
					);
				}, 200); // Short delay for headings

				prevHeadingLevelRef.current = attributes.level;
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

		// Group issues by type and category
		const errors = issues.filter(issue => issue.type === 'error');
		const warnings = issues.filter(issue => issue.type === 'warning');

		// Group by category
		const accessibilityErrors = errors.filter(issue => issue.category === 'accessibility');
		const validationErrors = errors.filter(issue => issue.category === 'validation');
		const accessibilityWarnings = warnings.filter(issue => issue.category === 'accessibility');
		const validationWarnings = warnings.filter(issue => issue.category === 'validation');

		return (
			<>
				{validationResult.mode !== 'none' && (
					<InspectorControls>
						<PanelBody
							title={__('Accessibility & Validation', 'block-accessibility-checks')}
							initialOpen={true}
						>
							{/* Display All Errors Group */}
							{(accessibilityErrors.length > 0 || validationErrors.length > 0) && (
								<PanelRow>
									<div className="a11y-error-group">
										{accessibilityErrors.length > 0 && (
											<>
												<p className="a11y-error-subheading">
													<strong>
														{__(
															'Accessibility Errors',
															'block-accessibility-checks'
														)}
													</strong>
												</p>
												<ul className="a11y-error-list">
													{accessibilityErrors.map((issue, index) => (
														<li
															key={`accessibility-error-${issue.checkName}-${index}`}
														>
															{issue.error_msg}
														</li>
													))}
												</ul>
											</>
										)}

										{validationErrors.length > 0 && (
											<>
												<p className="a11y-error-subheading">
													<strong>
														{__(
															'Validation Errors',
															'block-accessibility-checks'
														)}
													</strong>
												</p>
												<ul className="a11y-error-list">
													{validationErrors.map((issue, index) => (
														<li
															key={`validation-error-${issue.checkName}-${index}`}
														>
															{issue.error_msg}
														</li>
													))}
												</ul>
											</>
										)}
									</div>
								</PanelRow>
							)}

							{/* Display All Warnings Group */}
							{(accessibilityWarnings.length > 0 ||
								validationWarnings.length > 0) && (
								<PanelRow>
									<div className="a11y-warning-group">
										{accessibilityWarnings.length > 0 && (
											<>
												<p className="a11y-warning-subheading">
													<strong>
														{__(
															'Accessibility Warnings',
															'block-accessibility-checks'
														)}
													</strong>
												</p>
												<ul className="a11y-warning-list">
													{accessibilityWarnings.map((issue, index) => (
														<li
															key={`accessibility-warning-${issue.checkName}-${index}`}
														>
															{issue.warning_msg || issue.error_msg}
														</li>
													))}
												</ul>
											</>
										)}

										{validationWarnings.length > 0 && (
											<>
												<p className="a11y-warning-subheading">
													<strong>
														{__(
															'Validation Warnings',
															'block-accessibility-checks'
														)}
													</strong>
												</p>
												<ul className="a11y-warning-list">
													{validationWarnings.map((issue, index) => (
														<li
															key={`validation-warning-${issue.checkName}-${index}`}
														>
															{issue.warning_msg || issue.error_msg}
														</li>
													))}
												</ul>
											</>
										)}
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
