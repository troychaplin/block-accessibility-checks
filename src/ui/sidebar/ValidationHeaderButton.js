/**
 * WordPress dependencies
 */
import { PluginMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { caution } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GetInvalidBlocks } from '../../core/utils/getInvalidBlocks';
import { GetInvalidMeta } from '../../core/utils/getInvalidMeta';
import { GetInvalidEditorChecks } from '../../core/utils/getInvalidEditorChecks';

/**
 * Validation Header Button
 *
 * Displays a button in the editor header with a badge count of validation issues.
 * Clicking the button opens the unified validation sidebar.
 */
export function ValidationHeaderButton() {
	const invalidBlocks = GetInvalidBlocks();
	const invalidMeta = GetInvalidMeta();
	const invalidEditorChecks = GetInvalidEditorChecks();
	const { openGeneralSidebar, closeGeneralSidebar } = useDispatch('core/edit-post');
	const isSidebarOpen = useSelect(select => {
		const sidebar = select('core/edit-post')?.getActiveGeneralSidebarName();
		// PluginSidebar name might be prefixed with plugin name
		return (
			sidebar === 'unified-validation-sidebar' ||
			sidebar === 'validation-api/unified-validation-sidebar' ||
			sidebar?.includes('unified-validation-sidebar')
		);
	}, []);

	// Calculate totals
	const blockErrors = invalidBlocks.filter(block => block.mode === 'error');
	const blockWarnings = invalidBlocks.filter(block => block.mode === 'warning');
	const editorErrors = invalidEditorChecks.filter(check => check.type === 'error');
	const editorWarnings = invalidEditorChecks.filter(check => check.type === 'warning');
	const metaErrors = invalidMeta.filter(meta => meta.hasErrors);
	const metaWarnings = invalidMeta.filter(meta => meta.hasWarnings && !meta.hasErrors);

	const totalErrors = blockErrors.length + editorErrors.length + metaErrors.length;
	const totalWarnings = blockWarnings.length + editorWarnings.length + metaWarnings.length;
	const totalIssues = totalErrors + totalWarnings;

	// Handle button click - toggle sidebar
	const handleClick = () => {
		if (isSidebarOpen) {
			closeGeneralSidebar();
		} else {
			// Try opening sidebar - WordPress will handle the correct name format
			// PluginSidebar registers with name="unified-validation-sidebar"
			// but might be accessible as "validation-api/unified-validation-sidebar"
			openGeneralSidebar('validation-api/unified-validation-sidebar');
		}
	};

	// Don't render if no issues
	if (totalIssues === 0) {
		return null;
	}

	return (
		<PluginMoreMenuItem
			icon={caution}
			onClick={handleClick}
			className="ba11y-validation-header-button"
		>
			{__('Accessibility & Validation', 'block-accessibility-checks')}
			{totalIssues > 0 && ` (${totalIssues})`}
		</PluginMoreMenuItem>
	);
}
