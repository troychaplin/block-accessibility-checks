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

/**
 * Validation API Component
 *
 * Central component that orchestrates validation across blocks, meta fields, and editor checks.
 * Manages post saving restrictions and body classes based on validation results. When errors
 * are detected, prevents post saving/autosaving and disables the publish sidebar to ensure
 * content meets accessibility requirements before publication.
 *
 * This component doesn't render any UI but manages validation state and editor behavior.
 */
export function ValidationAPI() {
	// Check if we're in the post editor context (not site editor or other contexts)
	const isPostEditor = wp.data && wp.data.select && wp.data.select('core/editor');

	// Retrieve validation results from all validation sources
	const invalidBlocks = GetInvalidBlocks();
	const invalidMeta = GetInvalidMeta();
	const invalidEditorChecks = GetInvalidEditorChecks();

	// Get dispatch functions for managing post saving state
	const {
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
	} = useDispatch('core/editor');

	/**
	 * Manage post saving restrictions based on validation errors
	 *
	 * Monitors validation results from blocks, meta fields, and editor checks.
	 * When any errors are detected, locks both manual and automatic post saving
	 * and disables the publish sidebar. This prevents publishing content with
	 * accessibility issues. When all errors are resolved, re-enables saving.
	 */
	useEffect(() => {
		// Only apply restrictions in the post editor context
		if (!isPostEditor) {
			return;
		}

		// Check for errors across all validation types
		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasEditorErrors = invalidEditorChecks.some(check => check.type === 'error');

		// Lock saving if any validation errors exist
		if (hasBlockErrors || hasMetaErrors || hasEditorErrors) {
			lockPostSaving();
			lockPostAutosaving();
			disablePublishSidebar();
		} else {
			// Re-enable saving when all errors are resolved
			unlockPostSaving();
			unlockPostAutosaving();
			enablePublishSidebar();
		}
	}, [
		invalidBlocks,
		invalidMeta,
		invalidEditorChecks,
		disablePublishSidebar,
		enablePublishSidebar,
		lockPostAutosaving,
		lockPostSaving,
		unlockPostAutosaving,
		unlockPostSaving,
		isPostEditor,
	]);

	/**
	 * Manage body classes for validation state styling
	 *
	 * Adds CSS classes to the document body based on validation results from meta
	 * fields and editor checks. These classes enable theme/plugin developers to
	 * style the editor interface based on validation state (e.g., highlighting
	 * areas with issues). Classes are removed when validation passes or component unmounts.
	 */
	useEffect(() => {
		// Only manage classes in the post editor context
		if (!isPostEditor) {
			return;
		}

		// Check for errors and warnings in meta and editor validation
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasMetaWarnings = invalidMeta.some(meta => meta.hasWarnings && !meta.hasErrors);
		const hasEditorErrors = invalidEditorChecks.some(check => check.type === 'error');
		const hasEditorWarnings = invalidEditorChecks.some(check => check.type === 'warning');

		// Toggle error class based on validation state
		if (hasMetaErrors || hasEditorErrors) {
			document.body.classList.add('has-meta-validation-errors');
		} else {
			document.body.classList.remove('has-meta-validation-errors');
		}

		// Toggle warning class (only if no errors present)
		if (hasMetaWarnings || hasEditorWarnings) {
			document.body.classList.add('has-meta-validation-warnings');
		} else {
			document.body.classList.remove('has-meta-validation-warnings');
		}

		// Cleanup: Remove classes when component unmounts
		return () => {
			document.body.classList.remove(
				'has-meta-validation-errors',
				'has-meta-validation-warnings'
			);
		};
	}, [invalidMeta, invalidEditorChecks, isPostEditor]);

	// This component manages side effects only, no UI rendering
	return null;
}
