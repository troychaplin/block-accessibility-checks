import { useDispatch } from '@wordpress/data';
import { GetInvalidBlocks } from './getInvalidBlocks';
import { useEffect } from '@wordpress/element';

/**
 * Function that handles block invalidation.
 *
 * @return {null} Returns null.
 */
export function BlockInvalidation() {
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
	]);

	return null;
}
