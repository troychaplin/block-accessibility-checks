/**
 * WordPress dependencies
 */
import { PluginSidebar } from '@wordpress/editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
// import { caution } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GetInvalidBlocks } from '../core/utils/getInvalidBlocks';
import { GetInvalidMeta } from '../core/utils/getInvalidMeta';
import { GetInvalidEditorChecks } from '../core/utils/getInvalidEditorChecks';
import { filterIssuesByType, getErrors, getWarnings } from '../core/utils/issueHelpers';

/**
 * Unified Validation Sidebar Component
 *
 * Consolidates all validation issues from blocks, editor checks, and meta fields
 * into a single sidebar panel. Provides a comprehensive view of all accessibility
 * and validation issues in the current post, organized by severity (errors/warnings)
 * and source type. Users can click on issues to navigate directly to the relevant
 * block or field in the editor.
 *
 * The sidebar only renders when validation issues exist and displays an icon
 * that changes color based on the highest severity issue present.
 */
export function ValidationSidebar() {
	// Retrieve validation results from all sources
	const invalidBlocks = GetInvalidBlocks() || [];
	const invalidMeta = GetInvalidMeta() || [];
	const invalidEditorChecks = GetInvalidEditorChecks() || [];

	// Get dispatch function to select blocks when user clicks on issues
	const { selectBlock } = useDispatch('core/block-editor');

	// Ref to track scroll timeout for cleanup
	const scrollTimeoutRef = useRef(null);

	// Organize validation issues by type and severity for display
	const blockErrors = invalidBlocks.filter(block => block.mode === 'error');
	const blockWarnings = invalidBlocks.filter(block => block.mode === 'warning');

	const editorErrors = filterIssuesByType(invalidEditorChecks, 'error');
	const editorWarnings = filterIssuesByType(invalidEditorChecks, 'warning');

	// Meta warnings only shown if no errors exist (errors take precedence)
	const metaErrors = invalidMeta.filter(meta => meta.hasErrors);
	const metaWarnings = invalidMeta.filter(meta => meta.hasWarnings && !meta.hasErrors);

	// Calculate total counts across all validation sources
	const totalErrors = blockErrors.length + editorErrors.length + metaErrors.length;
	const totalWarnings = blockWarnings.length + editorWarnings.length + metaWarnings.length;

	// Set icon color based on highest severity issue (errors > warnings > none)
	let iconColor = 'currentColor';
	if (totalErrors > 0) {
		iconColor = '#d82000';
	} else if (totalWarnings > 0) {
		iconColor = '#dbc900';
	}

	// Accessibility icon SVG that changes color based on validation severity
	const ba11yIcon = (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill={iconColor}
			className="ba11y-sidebar-icon"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M8 0C9.77663 0 11.4175 0.57979 12.7451 1.55957L11.5498 2.75488C10.5372 2.06824 9.3156 1.66699 8 1.66699C4.5022 1.66699 1.66699 4.5022 1.66699 8C1.66699 11.4978 4.5022 14.333 8 14.333C11.2302 14.333 13.8933 11.9148 14.2822 8.79004L10.2256 12.8477C10.0614 13.0117 9.84597 13.0923 9.63086 13.0908C9.41575 13.0923 9.20031 13.0117 9.03613 12.8477L3.75586 7.56738C3.43077 7.24201 3.43077 6.71502 3.75586 6.38965C4.0813 6.06421 4.60913 6.06421 4.93457 6.38965L7.40137 8.85645L13.6689 2.58887C13.9944 2.26363 14.5223 2.26361 14.8477 2.58887C15.173 2.91425 15.1729 3.44213 14.8477 3.76758L8.58008 10.0352L9.63086 11.0859L14.3271 6.38965C14.3588 6.35799 14.3926 6.32921 14.4277 6.30371L15.5059 5.22656C15.8253 6.09066 16 7.0249 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C2.2549e-07 3.58172 3.58172 2.25497e-07 8 0Z"
				fill={iconColor}
			/>
		</svg>
	);

	/**
	 * Handle clicking on a block validation issue
	 *
	 * Selects the block in the editor and scrolls it into view. Uses multiple
	 * selector strategies to find the block element since WordPress block DOM
	 * structure can vary. Includes a delay to ensure block selection completes
	 * before attempting to scroll.
	 *
	 * @param {string} clientId - The unique client ID of the block to navigate to.
	 */
	const handleBlockClick = clientId => {
		if (!clientId) {
			return;
		}

		// Select the block in the editor (highlights it in the UI)
		selectBlock(clientId);

		// Clear any existing scroll timeout to prevent conflicts
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		// Delay scroll to ensure block selection and DOM update complete
		scrollTimeoutRef.current = setTimeout(() => {
			// Try primary selector: standard block data attribute
			let blockElement = document.querySelector(`[data-block="${clientId}"]`);

			// Fallback: try with data-type attribute
			if (!blockElement) {
				blockElement = document.querySelector(`[data-type][data-block="${clientId}"]`);
			}

			// Fallback: try with WordPress block class
			if (!blockElement) {
				blockElement = document.querySelector(`.wp-block[data-block="${clientId}"]`);
			}

			// Scroll block into view if found
			if (blockElement) {
				blockElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}, 100);
	};

	/**
	 * Handle clicking on a meta field validation issue
	 *
	 * Placeholder for future enhancement. Meta fields are typically in document
	 * settings panels that aren't directly scrollable. Users must navigate to
	 * the appropriate settings panel manually.
	 *
	 * @param {string} metaKey - The meta key of the field with the issue (reserved for future use).
	 */
	// eslint-disable-next-line no-unused-vars
	const handleMetaClick = metaKey => {
		// Meta fields are in document settings panels that can't be directly scrolled to
		// Users should navigate to the appropriate settings panel manually
		// Future: Use metaKey to open/focus the relevant settings panel
	};

	/**
	 * Cleanup scroll timeout on component unmount
	 *
	 * Prevents memory leaks by clearing any pending scroll timeouts when
	 * the component is unmounted or when the user navigates away.
	 */
	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	// Always render the sidebar to maintain consistent icon position
	// This ensures the icon appears in the same location regardless of validation state
	return (
		<PluginSidebar
			name="unified-validation-sidebar"
			title={__('Accessibility & Validation', 'block-accessibility-checks')}
			icon={ba11yIcon}
			className="ba11y-unified-validation-sidebar"
		>
			{/* Errors Panel: Displays all validation errors grouped by source type */}
			{totalErrors > 0 && (
				<PanelBody
					title={sprintf(
						/* translators: %d: number of errors */
						__('Errors (%d)', 'block-accessibility-checks'),
						totalErrors
					)}
					initialOpen={true}
					className="ba11y-errors-panel"
				>
					{/* Block Errors: Individual block validation issues */}
					{blockErrors.length > 0 && (
						<PanelRow>
							<div className="ba11y-error-group">
								<p className="ba11y-error-subheading">
									<strong>
										{__('Block Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-error-list">
									{blockErrors.map((block, index) => {
										// Separate errors and warnings for this block
										const errors = getErrors(block.issues || []);
										const warnings = getWarnings(block.issues || []);

										return (
											<li key={`block-error-${block.clientId}-${index}`}>
												<button
													type="button"
													className="ba11y-issue-link"
													onClick={() => handleBlockClick(block.clientId)}
												>
													{errors.map((issue, issueIndex) => (
														<div key={`error-${issueIndex}`}>
															<strong>
																{__(
																	'Error:',
																	'block-accessibility-checks'
																)}
															</strong>{' '}
															{issue.error_msg}
														</div>
													))}
													{warnings.map((issue, issueIndex) => (
														<div key={`warning-${issueIndex}`}>
															<strong>
																{__(
																	'Warning:',
																	'block-accessibility-checks'
																)}
															</strong>{' '}
															{issue.warning_msg || issue.error_msg}
														</div>
													))}
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Editor Errors */}
					{editorErrors.length > 0 && (
						<PanelRow>
							<div className="ba11y-error-group">
								<p className="ba11y-error-subheading">
									<strong>
										{__('Editor Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-error-list">
									{editorErrors.map((check, index) => (
										<li key={`editor-error-${index}`}>
											<div>
												<strong>
													{__('Error:', 'block-accessibility-checks')}
												</strong>{' '}
												{check.error_msg}
											</div>
											{check.description && (
												<div className="ba11y-validation-description">
													{check.description}
												</div>
											)}
										</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Meta Errors */}
					{metaErrors.length > 0 && (
						<PanelRow>
							<div className="ba11y-error-group">
								<p className="ba11y-error-subheading">
									<strong>
										{__('Meta Field Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-error-list">
									{metaErrors.map((meta, index) => {
										const errors = getErrors(meta.issues || []);

										return (
											<li key={`meta-error-${meta.metaKey}-${index}`}>
												<button
													type="button"
													className="ba11y-issue-link"
													onClick={() => handleMetaClick(meta.metaKey)}
												>
													<strong>{meta.metaKey}:</strong>{' '}
													{errors.map((issue, issueIndex) => (
														<span key={`error-${issueIndex}`}>
															{issue.error_msg}
														</span>
													))}
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			)}

			{/* Warnings Panel: Displays all validation warnings grouped by source type */}
			{totalWarnings > 0 && (
				<PanelBody
					title={sprintf(
						/* translators: %d: number of warnings */
						__('Warnings (%d)', 'block-accessibility-checks'),
						totalWarnings
					)}
					initialOpen={true}
					className="ba11y-warnings-panel"
				>
					{/* Block Warnings: Individual block validation warnings */}
					{blockWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11y-warning-group">
								<p className="ba11y-warning-subheading">
									<strong>
										{__('Block Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-warning-list">
									{blockWarnings.map((block, index) => {
										// Extract warnings for this block
										const warnings = getWarnings(block.issues || []);

										return (
											<li key={`block-warning-${block.clientId}-${index}`}>
												<button
													type="button"
													className="ba11y-issue-link"
													onClick={() => handleBlockClick(block.clientId)}
												>
													{warnings.map((issue, issueIndex) => (
														<div key={`warning-${issueIndex}`}>
															<strong>
																{__(
																	'Warning:',
																	'block-accessibility-checks'
																)}
															</strong>{' '}
															{issue.warning_msg || issue.error_msg}
														</div>
													))}
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Editor Warnings */}
					{editorWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11y-warning-group">
								<p className="ba11y-warning-subheading">
									<strong>
										{__('Editor Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-warning-list">
									{editorWarnings.map((check, index) => (
										<li key={`editor-warning-${index}`}>
											<div>
												<strong>
													{__('Warning:', 'block-accessibility-checks')}
												</strong>{' '}
												{check.warning_msg || check.error_msg}
											</div>
											{check.description && (
												<div className="ba11y-validation-description">
													{check.description}
												</div>
											)}
										</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Meta Warnings */}
					{metaWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11y-warning-group">
								<p className="ba11y-warning-subheading">
									<strong>
										{__('Meta Field Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-warning-list">
									{metaWarnings.map((meta, index) => {
										const warnings = getWarnings(meta.issues || []);

										return (
											<li key={`meta-warning-${meta.metaKey}-${index}`}>
												<button
													type="button"
													className="ba11y-issue-link"
													onClick={() => handleMetaClick(meta.metaKey)}
												>
													<strong>{meta.metaKey}:</strong>{' '}
													{warnings.map((issue, issueIndex) => (
														<span key={`warning-${issueIndex}`}>
															{issue.warning_msg || issue.error_msg}
														</span>
													))}
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			)}
		</PluginSidebar>
	);
}
