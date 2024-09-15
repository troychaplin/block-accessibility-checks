import { useDispatch } from '@wordpress/data';
import { GetInvalidBlocks } from './getInvalidBlocks'; // Assuming this is the function that retrieves invalid blocks
import { useEffect } from '@wordpress/element';

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
		// Check if any block has a mode set to 'error'
		const hasErrors = invalidBlocks.some((block) => block.mode === 'error');

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
