import { useSelect } from '@wordpress/data';
import { blockChecksArray } from '../registerPlugin';

/**
 * Retrieves the invalid blocks from the block editor.
 *
 * @return {Array} An array of invalid blocks.
 */
export function GetInvalidBlocks() {
	const allBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(),
		[]
	);
	return allBlocks
		.flatMap((block) => blockChecksArray.map((check) => check(block)))
		.filter((result) => !result.isValid);
}
