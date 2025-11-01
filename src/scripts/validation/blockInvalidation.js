import { useDispatch } from '@wordpress/data';
import { GetInvalidBlocks } from './getInvalidBlocks';
import { GetInvalidMeta } from './getInvalidMeta';
import { useEffect } from '@wordpress/element';

/**
 * Function that handles block invalidation.
 *
 * @return {null} Returns null.
 */
export function BlockInvalidation() {
	// Check if we're in the post editor context by checking if the core/editor store exists.
	// The site editor uses different data stores, so this is a reliable way to detect context.
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
