/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateBlock } from './validate-block';
import { getEditorContext } from './get-validation-config';

/**
 * Recursively retrieves invalid blocks from a block tree.
 *
 * @param {Array} blocks - Array of block objects to validate.
 * @return {Array} Array of validation results for blocks that failed validation.
 */
function getInvalidBlocksRecursive(blocks) {
	return blocks.flatMap(block => {
		const result = validateBlock(block);
		const results = [];

		if (!result.isValid) {
			results.push(result);
		}

		if (block.innerBlocks && block.innerBlocks.length > 0) {
			return [...results, ...getInvalidBlocksRecursive(block.innerBlocks)];
		}

		return results;
	});
}

/**
 * Find the core/post-content block anywhere in the block tree.
 *
 * @param {Array} blocks - The block tree to search.
 * @return {Object|null} The post-content block or null if not found.
 */
function findPostContentBlock(blocks) {
	for (const block of blocks) {
		if (block.name === 'core/post-content') {
			return block;
		}

		if (block.innerBlocks && block.innerBlocks.length > 0) {
			const found = findPostContentBlock(block.innerBlocks);
			if (found) {
				return found;
			}
		}
	}

	return null;
}

/**
 * React hook that retrieves all invalid blocks from the current editor state.
 *
 * In post editor context, only validates content blocks (not template blocks).
 *
 * @return {Array} Array of validation results for all invalid blocks in the editor.
 */
export function useInvalidBlocks() {
	const editorContext = getEditorContext();
	const isPostEditor =
		editorContext === 'post-editor' || editorContext === 'post-editor-template';

	const allBlocks = useSelect(
		select => {
			const blockEditorSelect = select('core/block-editor');

			const blocks = blockEditorSelect.getBlocks();

			if (isPostEditor) {
				const postContentBlock = findPostContentBlock(blocks);

				if (postContentBlock) {
					const fullBlock = blockEditorSelect.getBlock(postContentBlock.clientId);
					const blockOrder = blockEditorSelect.getBlockOrder(postContentBlock.clientId);

					const childBlocks = blockOrder
						.map(childId => {
							const childBlock = blockEditorSelect.getBlock(childId);
							blockEditorSelect.getBlockOrder(childId);
							return childBlock;
						})
						.filter(Boolean);

					const blocksToValidate =
						childBlocks.length > 0 ? childBlocks : fullBlock?.innerBlocks || [];

					return blocksToValidate;
				}
				return blocks;
			}

			return blocks;
		},
		[isPostEditor]
	);

	return getInvalidBlocksRecursive(allBlocks);
}
