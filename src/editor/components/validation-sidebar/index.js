/**
 * WordPress dependencies
 */
import { PluginSidebar } from '@wordpress/editor';
import { PanelBody, PanelRow } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { ValidationIcon } from '../validation-icon';
import { filterIssuesByType, getErrors, getWarnings } from '../../utils/issue-helpers';
import { useValidationIssues } from '../../utils/use-validation-issues';

/**
 * Get display name for a block type.
 *
 * @param {string} blockType - The block type (e.g., 'core/button').
 * @return {string} The display name for the block.
 */
function getBlockDisplayName(blockType) {
	const blockTypeInfo = getBlockType(blockType);
	if (blockTypeInfo && blockTypeInfo.title) {
		return blockTypeInfo.title;
	}

	const parts = blockType.split('/');
	const blockName = parts[1] || blockType;
	return blockName
		.split(/[-_]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Deduplicate block issues by block type and message.
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
				severity === 'error' ? issue.errorMsg : issue.warningMsg || issue.errorMsg;
			const key = `${block.name}|${message}`;

			if (!issueMap.has(key)) {
				issueMap.set(key, {
					blockName: getBlockDisplayName(block.name),
					blockType: block.name,
					message,
					clientIds: [],
				});
			}

			if (block.clientId && !issueMap.get(key).clientIds.includes(block.clientId)) {
				issueMap.get(key).clientIds.push(block.clientId);
			}
		});
	});

	return Array.from(issueMap.values());
}

/**
 * Deduplicate meta issues by meta key and message.
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
				severity === 'error' ? issue.errorMsg : issue.warningMsg || issue.errorMsg;
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
 * Deduplicate editor issues by message.
 *
 * @param {Array}  issues   - Array of editor validation issues.
 * @param {string} severity - The severity to filter by ('error' or 'warning').
 * @return {Array} Array of deduplicated issues with message.
 */
function deduplicateEditorIssues(issues, severity) {
	const issueMap = new Map();

	issues.forEach(issue => {
		const message = severity === 'error' ? issue.errorMsg : issue.warningMsg || issue.errorMsg;
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
 * Unified Validation Sidebar Component.
 *
 * Consolidates all validation issues from blocks, editor checks, and meta fields
 * into a single sidebar panel. Only rendered when validation issues exist.
 */
export function ValidationSidebar() {
	const { invalidBlocks, invalidMeta, invalidEditorChecks } = useValidationIssues();

	const { selectBlock } = useDispatch('core/block-editor');

	const scrollTimeoutRef = useRef(null);

	const editorErrors = filterIssuesByType(invalidEditorChecks, 'error');
	const editorWarnings = filterIssuesByType(invalidEditorChecks, 'warning');

	const deduplicatedBlockErrors = deduplicateBlockIssues(invalidBlocks, 'error');
	const deduplicatedBlockWarnings = deduplicateBlockIssues(invalidBlocks, 'warning');
	const deduplicatedMetaErrors = deduplicateMetaIssues(invalidMeta, 'error');
	const deduplicatedMetaWarnings = deduplicateMetaIssues(invalidMeta, 'warning');
	const deduplicatedEditorErrors = deduplicateEditorIssues(editorErrors, 'error');
	const deduplicatedEditorWarnings = deduplicateEditorIssues(editorWarnings, 'warning');

	const totalErrors =
		deduplicatedBlockErrors.length +
		deduplicatedMetaErrors.length +
		deduplicatedEditorErrors.length;
	const totalWarnings =
		deduplicatedBlockWarnings.length +
		deduplicatedMetaWarnings.length +
		deduplicatedEditorWarnings.length;

	let iconColor = 'currentColor';
	if (totalErrors > 0) {
		iconColor = '#d82000';
	} else if (totalWarnings > 0) {
		iconColor = '#dbc900';
	}

	const sidebarIcon = <ValidationIcon fill={iconColor} />;

	/**
	 * Handle clicking on a block validation issue.
	 *
	 * @param {string} clientId - The unique client ID of the block to navigate to.
	 */
	const handleBlockClick = clientId => {
		if (!clientId) {
			return;
		}

		selectBlock(clientId);

		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		scrollTimeoutRef.current = setTimeout(() => {
			let blockElement = document.querySelector(`[data-block="${clientId}"]`);

			if (!blockElement) {
				blockElement = document.querySelector(`[data-type][data-block="${clientId}"]`);
			}

			if (!blockElement) {
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

	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	if (totalErrors === 0 && totalWarnings === 0) {
		return null;
	}

	return (
		<PluginSidebar
			name="block-a11y-checks-sidebar"
			title={__('Validation', 'block-accessibility-checks')}
			icon={sidebarIcon}
			className="ba11yc-validation-sidebar"
		>
			{totalErrors > 0 && (
				<PanelBody
					title={sprintf(
						/* translators: %d: number of errors */
						__('Errors (%d)', 'block-accessibility-checks'),
						totalErrors
					)}
					initialOpen={true}
					className="ba11yc-errors-panel"
				>
					{deduplicatedBlockErrors.length > 0 && (
						<PanelRow>
							<div className="ba11yc-error-group">
								<p className="ba11yc-error-subheading">
									{__('Block Issues', 'block-accessibility-checks')}
								</p>
								<ul className="ba11yc-error-list">
									{deduplicatedBlockErrors.map((issue, index) => {
										const count = issue.clientIds.length;
										const countDisplay = count > 1 ? ` (x${count})` : '';
										return (
											<li key={`block-error-${index}`}>
												<button
													type="button"
													className="ba11yc-issue-link"
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

					{deduplicatedMetaErrors.length > 0 && (
						<PanelRow>
							<div className="ba11yc-error-group">
								<p className="ba11yc-error-subheading">
									{__('Field Issues', 'block-accessibility-checks')}
								</p>
								<ul className="ba11yc-error-list">
									{deduplicatedMetaErrors.map((issue, index) => (
										<li key={`meta-error-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{deduplicatedEditorErrors.length > 0 && (
						<PanelRow>
							<div className="ba11yc-error-group">
								<p className="ba11yc-error-subheading">
									{__('Editor Issues', 'block-accessibility-checks')}
								</p>
								<ul className="ba11yc-error-list">
									{deduplicatedEditorErrors.map((issue, index) => (
										<li key={`editor-error-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			)}

			{totalWarnings > 0 && (
				<PanelBody
					title={sprintf(
						/* translators: %d: number of warnings */
						__('Warnings (%d)', 'block-accessibility-checks'),
						totalWarnings
					)}
					initialOpen={true}
					className="ba11yc-warnings-panel"
				>
					{deduplicatedBlockWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11yc-warning-group">
								<p className="ba11yc-warning-subheading">
									{__('Block Issues', 'block-accessibility-checks')}
								</p>
								<ul className="ba11yc-warning-list">
									{deduplicatedBlockWarnings.map((issue, index) => {
										const count = issue.clientIds.length;
										const countDisplay = count > 1 ? ` (x${count})` : '';
										return (
											<li key={`block-warning-${index}`}>
												<button
													type="button"
													className="ba11yc-issue-link"
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

					{deduplicatedMetaWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11yc-warning-group">
								<p className="ba11yc-warning-subheading">
									{__('Field Issues', 'block-accessibility-checks')}
								</p>
								<ul className="ba11yc-warning-list">
									{deduplicatedMetaWarnings.map((issue, index) => (
										<li key={`meta-warning-${index}`}>{issue.message}</li>
									))}
								</ul>
							</div>
						</PanelRow>
					)}

					{deduplicatedEditorWarnings.length > 0 && (
						<PanelRow>
							<div className="ba11yc-warning-group">
								<p className="ba11yc-warning-subheading">
									{__('Editor Issues', 'block-accessibility-checks')}
								</p>
								<ul className="ba11yc-warning-list">
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

export default ValidationSidebar;
