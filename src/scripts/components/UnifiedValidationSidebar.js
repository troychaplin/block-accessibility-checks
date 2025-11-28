/**
 * WordPress dependencies
 */
import { PluginSidebar } from '@wordpress/editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { caution } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GetInvalidBlocks } from '../validation/getInvalidBlocks';
import { GetInvalidMeta } from '../validation/getInvalidMeta';
import { GetInvalidEditorChecks } from '../validation/getInvalidEditorChecks';

/**
 * Unified Validation Sidebar
 *
 * Consolidates all validation issues (blocks, editor, meta) into a single sidebar.
 * Allows users to click on issues to navigate to the relevant block or field.
 */
export function UnifiedValidationSidebar() {
	const invalidBlocks = GetInvalidBlocks();
	const invalidMeta = GetInvalidMeta();
	const invalidEditorChecks = GetInvalidEditorChecks();
	const { selectBlock } = useDispatch('core/block-editor');
	const scrollTimeoutRef = useRef(null);

	// Group blocks by error/warning
	const blockErrors = invalidBlocks.filter(block => block.mode === 'error');
	const blockWarnings = invalidBlocks.filter(block => block.mode === 'warning');

	// Group editor checks by type
	const editorErrors = invalidEditorChecks.filter(check => check.type === 'error');
	const editorWarnings = invalidEditorChecks.filter(check => check.type === 'warning');

	// Group meta by error/warning
	const metaErrors = invalidMeta.filter(meta => meta.hasErrors);
	const metaWarnings = invalidMeta.filter(meta => meta.hasWarnings && !meta.hasErrors);

	// Calculate totals
	const totalErrors = blockErrors.length + editorErrors.length + metaErrors.length;
	const totalWarnings = blockWarnings.length + editorWarnings.length + metaWarnings.length;

	// Handle clicking on a block issue - select and scroll to it
	const handleBlockClick = clientId => {
		if (!clientId) {
			return;
		}

		// Select the block
		selectBlock(clientId);

		// Scroll to block after a short delay to ensure it's selected
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		scrollTimeoutRef.current = setTimeout(() => {
			// Try multiple selectors to find the block element
			let blockElement = document.querySelector(`[data-block="${clientId}"]`);

			if (!blockElement) {
				// Try alternative selector
				blockElement = document.querySelector(`[data-type][data-block="${clientId}"]`);
			}

			if (!blockElement) {
				// Try finding by block class
				blockElement = document.querySelector(`.wp-block[data-block="${clientId}"]`);
			}

			if (blockElement) {
				blockElement.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		}, 100);
	};

	// Handle clicking on a meta field issue - open document settings
	const handleMetaClick = metaKey => {
		// Note: We can't directly scroll to meta fields
		// The meta field should be visible in its sidebar/panel
		// Users can navigate there manually
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	// Don't render if no issues
	if (totalErrors === 0 && totalWarnings === 0) {
		return null;
	}

	return (
		<PluginSidebar
			name="unified-validation-sidebar"
			title={__('Accessibility & Validation', 'block-accessibility-checks')}
			icon={caution}
			className="ba11y-unified-validation-sidebar"
		>
			{/* Errors Section */}
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
					{/* Block Errors */}
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

			{/* Warnings Section */}
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
					{/* Block Warnings */}
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
