import { useSelect } from '@wordpress/data';
import { validateBlock } from './validationHooks';

/**
 * Recursively retrieves invalid blocks from a list of blocks.
 *
 * @param {Array} blocks - Array of blocks to check.
 * @return {Array} An array of invalid blocks.
 */
function getInvalidBlocksRecursive(blocks) {
	// Recursive function to check each block and its inner blocks
	return blocks.flatMap(block => {
		// Use unified validation system
		const result = validateBlock(block);
		const results = [];

		if (!result.isValid) {
			results.push(result);
		}

		// If the block has inner blocks, recursively check them
		if (block.innerBlocks && block.innerBlocks.length > 0) {
			return [...results, ...getInvalidBlocksRecursive(block.innerBlocks)];
		}

		return results;
	});
}

/**
 * Retrieves the invalid blocks from the block editor.
 *
 * @return {Array} An array of invalid blocks.
 */
export function GetInvalidBlocks() {
	// Hook to get all blocks once, at the top level
	const allBlocks = useSelect(select => select('core/block-editor').getBlocks(), []);

	// Now, use the recursive function to check all blocks and their inner blocks
	const invalidBlocks = getInvalidBlocksRecursive(allBlocks);

	// Filter out valid blocks and return only invalid ones
	return invalidBlocks.filter(result => !result.isValid);
}
