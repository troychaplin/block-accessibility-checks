import { useDispatch } from '@wordpress/data';
import { GetInvalidBlocks } from './getInvalidBlocks';
import { useEffect } from '@wordpress/element';

/**
 * Function that handles block invalidation.
 *
 * @return {null} Returns null.
 */
export function BlockInvalidation() {
	// Check if we're in the post editor context.
	const isPostEditor = wp.data && wp.data.select && wp.data.select('core/editor');

	const invalidBlocks = GetInvalidBlocks();

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

		const hasErrors = invalidBlocks.some(block => block.mode === 'error');

		if (hasErrors) {
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
