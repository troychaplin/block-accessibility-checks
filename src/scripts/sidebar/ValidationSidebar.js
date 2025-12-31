/**
 * WordPress dependencies
 */
import { PluginSidebar } from '@wordpress/editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';
// import { caution } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GetInvalidBlocks } from '../core/utils/getInvalidBlocks';
import { GetInvalidMeta } from '../core/utils/getInvalidMeta';
import { GetInvalidEditorChecks } from '../core/utils/getInvalidEditorChecks';
import { filterIssuesByType, getErrors, getWarnings } from '../core/utils/issueHelpers';

/**
 * Get display name for a block type
 *
 * Uses WordPress getBlockType to get the official block title, with fallback
 * to a formatted version of the block type name.
 *
 * @param {string} blockType - The block type (e.g., 'core/button').
 * @return {string} The display name for the block.
 */
function getBlockDisplayName(blockType) {
	const blockTypeInfo = getBlockType(blockType);
	if (blockTypeInfo && blockTypeInfo.title) {
		return blockTypeInfo.title;
	}

	// Fallback: format block type name
	const parts = blockType.split('/');
	const blockName = parts[1] || blockType;
	// Convert kebab-case to title case
	return blockName
		.split(/[-_]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Deduplicate block issues by block type and message
 *
 * Groups issues by block type + message, collecting all clientIds that have
 * the same issue. Returns unique issues with block names and clientIds.
 *
 * @param {Array}  blocks   - Array of invalid block validation results.
 * @param {string} severity - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with blockName, message, and clientIds.
 */
function deduplicateBlockIssues(blocks, severity) {
	const issueMap = new Map();

	blocks.forEach(block => {
		const issues =
			severity === 'error' ? getErrors(block.issues || []) : getWarnings(block.issues || []);

		issues.forEach(issue => {
			const message =
				severity === 'error' ? issue.error_msg : issue.warning_msg || issue.error_msg;
			const key = `${block.name}|${message}`;

			if (!issueMap.has(key)) {
				issueMap.set(key, {
					blockName: getBlockDisplayName(block.name),
					blockType: block.name,
					message,
					clientIds: [],
				});
			}

			// Add clientId if not already present
			if (block.clientId && !issueMap.get(key).clientIds.includes(block.clientId)) {
				issueMap.get(key).clientIds.push(block.clientId);
			}
		});
	});

	return Array.from(issueMap.values());
}

/**
 * Deduplicate meta issues by meta key and message
 *
 * Groups issues by meta key + message, returning unique issues.
 *
 * @param {Array}  metaArray - Array of invalid meta validation results.
 * @param {string} severity  - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with metaKey and message.
 */
function deduplicateMetaIssues(metaArray, severity) {
	const issueMap = new Map();

	metaArray.forEach(meta => {
		const issues =
			severity === 'error' ? getErrors(meta.issues || []) : getWarnings(meta.issues || []);

		issues.forEach(issue => {
			const message =
				severity === 'error' ? issue.error_msg : issue.warning_msg || issue.error_msg;
			const key = `${meta.metaKey}|${message}`;

			if (!issueMap.has(key)) {
				issueMap.set(key, {
					metaKey: meta.metaKey,
					message,
				});
			}
		});
	});

	return Array.from(issueMap.values());
}

/**
 * Deduplicate editor issues by message
 *
 * Groups editor issues by message only, returning unique issues.
 *
 * @param {Array}  issues   - Array of editor validation issues.
 * @param {string} severity - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with message.
 */
function deduplicateEditorIssues(issues, severity) {
	const issueMap = new Map();

	issues.forEach(issue => {
		// Handle both camelCase (errorMsg) and snake_case (error_msg) for compatibility
		const message =
			severity === 'error'
				? issue.errorMsg || issue.error_msg
				: issue.warningMsg || issue.warning_msg || issue.errorMsg || issue.error_msg;
		const key = message;

		if (!issueMap.has(key)) {
			issueMap.set(key, {
				message,
				description: issue.description,
			});
		}
	});

	return Array.from(issueMap.values());
}

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

	// Organize validation issues by type and severity for deduplication
	// Note: Pass all invalid blocks to deduplication functions, not just those with matching mode
	// A block can have both errors AND warnings in its issues array, even if mode is 'error'
	const editorErrors = filterIssuesByType(invalidEditorChecks, 'error');
	const editorWarnings = filterIssuesByType(invalidEditorChecks, 'warning');

	// Deduplicate issues by type and severity
	// Extract errors and warnings from all blocks, regardless of their mode
	const deduplicatedBlockErrors = deduplicateBlockIssues(invalidBlocks, 'error');
	const deduplicatedBlockWarnings = deduplicateBlockIssues(invalidBlocks, 'warning');
	// Extract errors and warnings from all meta, regardless of primary severity
	const deduplicatedMetaErrors = deduplicateMetaIssues(invalidMeta, 'error');
	const deduplicatedMetaWarnings = deduplicateMetaIssues(invalidMeta, 'warning');
	const deduplicatedEditorErrors = deduplicateEditorIssues(editorErrors, 'error');
	const deduplicatedEditorWarnings = deduplicateEditorIssues(editorWarnings, 'warning');

	// Calculate total counts across all validation sources (using deduplicated counts)
	const totalErrors =
		deduplicatedBlockErrors.length +
		deduplicatedMetaErrors.length +
		deduplicatedEditorErrors.length;
	const totalWarnings =
		deduplicatedBlockWarnings.length +
		deduplicatedMetaWarnings.length +
		deduplicatedEditorWarnings.length;

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
			name="validation-sidebar"
			title={__('Accessibility & Validation', 'block-accessibility-checks')}
			icon={ba11yIcon}
			className="ba11y-validation-sidebar"
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
					{/* Block Errors: Deduplicated block validation issues */}
					{deduplicatedBlockErrors.length > 0 && (
						<PanelRow>
							<div className="ba11y-error-group">
								<p className="ba11y-error-subheading">
									<strong>
										<span className="ba11y-indicator-circle"></span>
										{__('Block Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-error-list">
									{deduplicatedBlockErrors.map((issue, index) => {
										const count = issue.clientIds.length;
										const countDisplay = count > 1 ? ` (x${count})` : '';
										return (
											<li key={`block-error-${index}`}>
												<button
													type="button"
													className="ba11y-issue-link"
													onClick={() =>
														handleBlockClick(issue.clientIds[0])
													}
												>
													{issue.blockName}
												</button>
												: {issue.message}
												{countDisplay}
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Meta Errors: Deduplicated meta field validation issues */}
					{deduplicatedMetaErrors.length > 0 && (
						<PanelRow>
							<div className="ba11y-error-group">
								<p className="ba11y-error-subheading">
									<strong>
										<span className="ba11y-indicator-circle"></span>
										{__('Meta Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-error-list">
									{deduplicatedMetaErrors.map((issue, index) => (
										<li key={`meta-error-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Editor Errors: Deduplicated editor validation issues */}
					{deduplicatedEditorErrors.length > 0 && (
						<PanelRow>
							<div className="ba11y-error-group">
								<p className="ba11y-error-subheading">
									<strong>
										<span className="ba11y-indicator-circle"></span>
										{__('Editor Errors', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-error-list">
									{deduplicatedEditorErrors.map((issue, index) => (
										<li key={`editor-error-${index}`}>{issue.message}</li>
									))}
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
					{/* Block Warnings: Deduplicated block validation warnings */}
					{deduplicatedBlockWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11y-warning-group">
								<p className="ba11y-warning-subheading">
									<strong>
										<span className="ba11y-indicator-circle"></span>
										{__('Block Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-warning-list">
									{deduplicatedBlockWarnings.map((issue, index) => {
										const count = issue.clientIds.length;
										const countDisplay = count > 1 ? ` (x${count})` : '';
										return (
											<li key={`block-warning-${index}`}>
												<button
													type="button"
													className="ba11y-issue-link"
													onClick={() =>
														handleBlockClick(issue.clientIds[0])
													}
												>
													{issue.blockName}
												</button>
												: {issue.message}
												{countDisplay}
											</li>
										);
									})}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Meta Warnings: Deduplicated meta field validation warnings */}
					{deduplicatedMetaWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11y-warning-group">
								<p className="ba11y-warning-subheading">
									<strong>
										<span className="ba11y-indicator-circle"></span>
										{__('Meta Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-warning-list">
									{deduplicatedMetaWarnings.map((issue, index) => (
										<li key={`meta-warning-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{/* Editor Warnings: Deduplicated editor validation warnings */}
					{deduplicatedEditorWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11y-warning-group">
								<p className="ba11y-warning-subheading">
									<strong>
										<span className="ba11y-indicator-circle"></span>
										{__('Editor Warnings', 'block-accessibility-checks')}
									</strong>
								</p>
								<ul className="ba11y-warning-list">
									{deduplicatedEditorWarnings.map((issue, index) => (
										<li key={`editor-warning-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			)}
		</PluginSidebar>
	);
}
