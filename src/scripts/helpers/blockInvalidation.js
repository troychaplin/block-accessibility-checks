import { useDispatch } from '@wordpress/data';
import { GetInvalidBlocks } from './getInvalidBlocks';
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
		if (
			invalidBlocks.length > 0 &&
			// eslint-disable-next-line no-undef -- blockAccessibilitySettings is defined in PHP
			blockAccessibilitySettings.mode === 'DENY'
		) {
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
