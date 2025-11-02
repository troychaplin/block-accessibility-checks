/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { GetInvalidBlocks } from './getInvalidBlocks';
import { GetInvalidMeta } from './getInvalidMeta';

/**
 * Validation API
 *
 * Handles the validation of blocks and post meta.
 */
export function ValidationAPI() {
	const isPostEditor = wp.data && wp.data.select && wp.data.select('core/editor');
	const invalidBlocks = GetInvalidBlocks();
	const invalidMeta = GetInvalidMeta();
	const {
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
	} = useDispatch('core/editor');

	useEffect(() => {
		// Only run if we're in the post editor context.
		if (!isPostEditor) {
			return;
		}

		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);

		if (hasBlockErrors || hasMetaErrors) {
			lockPostSaving();
			lockPostAutosaving();
			disablePublishSidebar();
		} else {
			unlockPostSaving();
			unlockPostAutosaving();
			enablePublishSidebar();
		}
	}, [
		invalidBlocks,
		invalidMeta,
		disablePublishSidebar,
		enablePublishSidebar,
		lockPostAutosaving,
		lockPostSaving,
		unlockPostAutosaving,
		unlockPostSaving,
		isPostEditor,
	]);

	// Add body classes for meta validation state
	useEffect(() => {
		if (!isPostEditor) {
			return;
		}

		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasMetaWarnings = invalidMeta.some(meta => meta.hasWarnings && !meta.hasErrors);

		// Add/remove error class
		if (hasMetaErrors) {
			document.body.classList.add('has-meta-validation-errors');
		} else {
			document.body.classList.remove('has-meta-validation-errors');
		}

		// Add/remove warning class
		if (hasMetaWarnings) {
			document.body.classList.add('has-meta-validation-warnings');
		} else {
			document.body.classList.remove('has-meta-validation-warnings');
		}

		// Cleanup on unmount
		return () => {
			document.body.classList.remove(
				'has-meta-validation-errors',
				'has-meta-validation-warnings'
			);
		};
	}, [invalidMeta, isPostEditor]);

	return null;
}
