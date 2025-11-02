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

	return null;
}
