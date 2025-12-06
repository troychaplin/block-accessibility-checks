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
export function UnifiedValidationSidebar() {
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

	const editorErrors = invalidEditorChecks.filter(check => check.type === 'error');
	const editorWarnings = invalidEditorChecks.filter(check => check.type === 'warning');

	// Meta warnings only shown if no errors exist (errors take precedence)
	const metaErrors = invalidMeta.filter(meta => meta.hasErrors);
	const metaWarnings = invalidMeta.filter(meta => meta.hasWarnings && !meta.hasErrors);

	// Calculate total counts across all validation sources
	const totalErrors = blockErrors.length + editorErrors.length + metaErrors.length;
	const totalWarnings = blockWarnings.length + editorWarnings.length + metaWarnings.length;

	// Set icon color based on highest severity issue (errors > warnings > none)
	let iconColor = '#000000';
	if (totalErrors > 0) {
		iconColor = '#d82000'; // Red for errors
	} else if (totalWarnings > 0) {
		iconColor = '#dbc900'; // Yellow/amber for warnings
	}

	// Accessibility icon SVG that changes color based on validation severity
	const ba11yIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="480"
			height="480"
			fill="none"
			viewBox="0 0 480 480"
		>
			<path
				fill={iconColor}
				d="M240 0c53.307 0 102.554 17.379 142.386 46.78L346.52 82.647C316.139 62.04 279.476 50 240 50 135.066 50 50 135.066 50 240s85.066 190 190 190c96.919 0 176.889-72.568 188.539-166.333L306.781 385.426c-4.926 4.927-11.398 7.365-17.855 7.319-6.457.046-12.929-2.392-17.856-7.319L112.678 227.033c-9.763-9.763-9.763-25.592 0-35.355s25.592-9.763 35.355 0l74.019 74.018L410.07 77.678c9.763-9.763 25.593-9.763 35.356 0s9.763 25.592 0 35.355L257.407 301.052l31.519 31.518 140.892-140.892a25 25 0 0 1 3.233-2.731l32.137-32.136C474.767 182.729 480 210.753 480 240c0 132.548-107.452 240-240 240S0 372.548 0 240 107.452 0 240 0"
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

	// Don't render sidebar if there are no validation issues
	if (totalErrors === 0 && totalWarnings === 0) {
		return null;
	}

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
										const errors =
											block.issues?.filter(issue => issue.type === 'error') ||
											[];
										const warnings =
											block.issues?.filter(
												issue => issue.type === 'warning'
											) || [];

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
										const errors =
											meta.issues?.filter(issue => issue.type === 'error') ||
											[];

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
										const warnings =
											block.issues?.filter(
												issue => issue.type === 'warning'
											) || [];

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
										const warnings =
											meta.issues?.filter(
												issue => issue.type === 'warning'
											) || [];

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
