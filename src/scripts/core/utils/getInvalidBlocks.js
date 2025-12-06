/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateBlock } from '../../block/validation';

/**
 * Recursively retrieves invalid blocks from a block tree.
 *
 * Traverses the entire block hierarchy, validating each block and its
 * nested innerBlocks. Collects and returns all blocks that fail validation.
 * This function handles blocks of any nesting depth.
 *
 * @param {Array} blocks - Array of block objects to validate.
 * @return {Array} Array of validation results for blocks that failed validation.
 */
function getInvalidBlocksRecursive(blocks) {
	return blocks.flatMap(block => {
		// Validate the current block using the unified validation system
		const result = validateBlock(block);
		const results = [];

		// Collect this block's result if it failed validation
		if (!result.isValid) {
			results.push(result);
		}

		// Recursively validate nested innerBlocks if present
		if (block.innerBlocks && block.innerBlocks.length > 0) {
			return [...results, ...getInvalidBlocksRecursive(block.innerBlocks)];
		}

		return results;
	});
}

/**
 * React hook that retrieves all invalid blocks from the current editor state.
 *
 * Fetches all top-level blocks from the block editor store and recursively
 * validates them along with their nested children. Returns an array of
 * validation results for blocks that failed accessibility or validation checks.
 * Updates automatically when blocks change due to useSelect reactivity.
 *
 * @return {Array} Array of validation results for all invalid blocks in the editor.
 */
export function GetInvalidBlocks() {
	// Retrieve all top-level blocks from the editor store
	const allBlocks = useSelect(select => select('core/block-editor').getBlocks(), []);

	// Recursively validate all blocks and their innerBlocks, collecting failures
	const invalidBlocks = getInvalidBlocksRecursive(allBlocks);

	// Return the array of invalid block validation results
	// Note: getInvalidBlocksRecursive already filters to only invalid blocks
	return invalidBlocks.filter(result => !result.isValid);
}
