/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { GetInvalidBlocks } from './utils/getInvalidBlocks';
import { GetInvalidMeta } from './utils/getInvalidMeta';
import { GetInvalidEditorChecks } from './utils/getInvalidEditorChecks';
import { hasErrors, hasWarnings } from './utils/issueHelpers';

/**
 * Validation API Component
 *
 * Central component that orchestrates validation across blocks, meta fields, and editor checks.
 * Manages post/template saving restrictions and body classes based on validation results. When
 * errors are detected, prevents saving/autosaving and disables the publish sidebar to ensure
 * content meets accessibility requirements before publication.
 *
 * Supports multiple editor contexts:
 * - post-editor: Default post/page editing
 * - post-editor-template: Post/page editing with template visible
 * - site-editor: Template editing in site editor
 *
 * This component doesn't render any UI but manages validation state and editor behavior.
 */
export function ValidationAPI() {
	// Get the editor context from PHP
	const editorContext = window.BlockAccessibilityChecks?.editorContext || 'none';

	// Check if we're in a supported editor context
	const isPostEditor =
		editorContext === 'post-editor' || editorContext === 'post-editor-template';
	const isSiteEditor = editorContext === 'site-editor';
	const isValidContext = isPostEditor || isSiteEditor;

	// Get dispatch functions based on editor context
	// IMPORTANT: lockPostSaving/unlockPostSaving are ONLY in 'core/editor'
	// Even in site editor, we need to use 'core/editor' for locking functionality
	// The core/edit-site store does not have these methods
	const editorStore = 'core/editor';

	// Call useDispatch unconditionally (React Hook rules - must be before any early returns)
	const dispatch = useDispatch(editorStore);

	// Verify the store exists before using it
	const storeExists = wp.data && wp.data.select && wp.data.select(editorStore);

	// Exit early if not in a supported context or store doesn't exist
	if (!isValidContext || editorContext === 'none' || !storeExists) {
		return null;
	}

	// Retrieve validation results from all validation sources
	const invalidBlocks = GetInvalidBlocks();
	const invalidMeta = GetInvalidMeta();
	const invalidEditorChecks = GetInvalidEditorChecks();

	// Destructure functions - these exist in core/editor for both contexts
	const {
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
	} = dispatch || {};

	/**
	 * Manage post/template saving restrictions based on validation errors
	 *
	 * Monitors validation results from blocks, meta fields, and editor checks.
	 * When any errors are detected, locks both manual and automatic saving
	 * and disables the publish sidebar. This prevents publishing content with
	 * accessibility issues. When all errors are resolved, re-enables saving.
	 *
	 * Works in both post editor and site editor contexts.
	 */
	useEffect(() => {
		// Verify we have the necessary dispatch functions
		if (!lockPostSaving || !unlockPostSaving) {
			return;
		}

		// Check for errors across all validation types
		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasEditorErrors = hasErrors(invalidEditorChecks);

		// Lock saving if any validation errors exist
		if (hasBlockErrors || hasMetaErrors || hasEditorErrors) {
			lockPostSaving('block-accessibility-checks');
			if (lockPostAutosaving) {
				lockPostAutosaving('block-accessibility-checks');
			}
			if (disablePublishSidebar) {
				disablePublishSidebar();
			}
		} else {
			// Re-enable saving when all errors are resolved
			unlockPostSaving('block-accessibility-checks');
			if (unlockPostAutosaving) {
				unlockPostAutosaving('block-accessibility-checks');
			}
			if (enablePublishSidebar) {
				enablePublishSidebar();
			}
		}
	}, [
		invalidBlocks,
		invalidMeta,
		invalidEditorChecks,
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
	]);

	/**
	 * Manage body classes for validation state styling
	 *
	 * Adds CSS classes to the document body based on validation results from blocks,
	 * meta fields, and editor checks. These classes enable theme/plugin developers to
	 * style the editor interface based on validation state (e.g., highlighting
	 * areas with issues). Classes are removed when validation passes or component unmounts.
	 *
	 * Works in both post editor and site editor contexts.
	 */
	useEffect(() => {
		// Ensure document.body is available before manipulating classes
		if (!document.body) {
			return;
		}

		// Check for errors and warnings across all validation types
		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasBlockWarnings = invalidBlocks.some(block => block.mode === 'warning');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasMetaWarnings = invalidMeta.some(meta => meta.hasWarnings && !meta.hasErrors);
		const hasEditorErrors = hasErrors(invalidEditorChecks);
		const hasEditorWarnings = hasWarnings(invalidEditorChecks);

		// Check for overall errors first (blocks, meta, or editor)
		const hasAnyErrors = hasBlockErrors || hasMetaErrors || hasEditorErrors;

		// Check for overall warnings only if no errors exist
		const hasAnyWarnings =
			!hasAnyErrors && (hasBlockWarnings || hasMetaWarnings || hasEditorWarnings);

		// Apply error class if errors exist
		if (hasAnyErrors) {
			document.body.classList.add('has-meta-validation-errors');
			document.body.classList.remove('has-meta-validation-warnings');
		}
		// Apply warning class only if no errors but warnings exist
		else if (hasAnyWarnings) {
			document.body.classList.add('has-meta-validation-warnings');
			document.body.classList.remove('has-meta-validation-errors');
		}
		// Remove both classes if no issues
		else {
			document.body.classList.remove(
				'has-meta-validation-errors',
				'has-meta-validation-warnings'
			);
		}

		// Cleanup: Remove classes when component unmounts
		return () => {
			if (document.body) {
				document.body.classList.remove(
					'has-meta-validation-errors',
					'has-meta-validation-warnings'
				);
			}
		};
	}, [invalidBlocks, invalidMeta, invalidEditorChecks]);

	// This component manages side effects only, no UI rendering
	return null;
}
