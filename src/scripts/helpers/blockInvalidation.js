import { VALIDATION_MODES } from './validationModes'; // Adjust the path according to your file structure

/* global blockAccessibilitySettings */
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
		// Check if any block has an ERROR validation mode
		const hasErrors = invalidBlocks.some(
			(block) => block.mode === VALIDATION_MODES.ERROR
		);

		if (hasErrors && blockAccessibilitySettings.mode === 'DENY') {
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
