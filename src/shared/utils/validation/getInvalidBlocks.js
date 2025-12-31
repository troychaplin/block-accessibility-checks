/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateBlock } from '@editor/validation/blocks';

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
 * Find the core/post-content block anywhere in the block tree
 *
 * Recursively searches through all blocks and their innerBlocks at any depth
 * to find the core/post-content block. This works regardless of theme structure.
 *
 * @param {Array} blocks - The block tree to search
 * @return {Object|null} The post-content block or null if not found
 */
function findPostContentBlock(blocks) {
	for (const block of blocks) {
		// Found it!
		if (block.name === 'core/post-content') {
			return block;
		}

		// Search deeper
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
 * Fetches all top-level blocks from the block editor store and recursively
 * validates them along with their nested children. Returns an array of
 * validation results for blocks that failed accessibility or validation checks.
 * Updates automatically when blocks change due to useSelect reactivity.
 *
 * In post editor context, only validates content blocks (not template blocks).
 * In site editor context, validates all blocks including template parts.
 *
 * @return {Array} Array of validation results for all invalid blocks in the editor.
 */
export function GetInvalidBlocks() {
	// Get editor context to determine filtering strategy
	const editorContext = window.BlockAccessibilityChecks?.editorContext || 'none';
	const isPostEditor =
		editorContext === 'post-editor' || editorContext === 'post-editor-template';
	const isSiteEditor = editorContext === 'site-editor';

	// Retrieve all top-level blocks from the editor store
	const allBlocks = useSelect(
		select => {
			const blockEditorSelect = select('core/block-editor');

			// Get all blocks from the editor
			// IMPORTANT: Calling getBlocks() subscribes to block changes
			const blocks = blockEditorSelect.getBlocks();

			// Site editor: validate all blocks including template parts
			if (isSiteEditor) {
				return blocks;
			}

			// Post editor: search for core/post-content block to determine if template is shown
			if (isPostEditor) {
				const postContentBlock = findPostContentBlock(blocks);

				if (postContentBlock) {
					// Template is shown - get the actual innerBlocks using getBlock
					// Note: getBlocks() excludes child blocks of nested inner block controllers
					// So we need to fetch the block directly by clientId to get its innerBlocks
					const fullBlock = blockEditorSelect.getBlock(postContentBlock.clientId);

					// Get blocks by client ID - this approach works when innerBlocks is empty
					// but the block order is available (common during template loading)
					const blockOrder = blockEditorSelect.getBlockOrder(postContentBlock.clientId);

					// IMPORTANT: Map over block IDs and call getBlock for each to establish
					// proper subscriptions. This ensures re-renders when template parts finish loading.
					const childBlocks = blockOrder
						.map(childId => {
							const childBlock = blockEditorSelect.getBlock(childId);
							// Also subscribe to each child's block order to catch nested changes
							blockEditorSelect.getBlockOrder(childId);
							return childBlock;
						})
						.filter(Boolean);

					// Use childBlocks if available, otherwise use fullBlock.innerBlocks
					// During template loading, childBlocks will be populated via getBlock calls
					// even if fullBlock.innerBlocks is temporarily empty
					const blocksToValidate =
						childBlocks.length > 0 ? childBlocks : fullBlock?.innerBlocks || [];

					return blocksToValidate;
				}
				// No template - validate all blocks (normal post editing)
				return blocks;
			}

			// Fallback for unknown contexts
			return blocks;
		},
		[isPostEditor, isSiteEditor]
	);

	// Recursively validate all blocks and their innerBlocks, collecting failures
	const invalidBlocks = getInvalidBlocksRecursive(allBlocks);

	// Return the array of invalid block validation results
	// Note: getInvalidBlocksRecursive already filters to only invalid blocks
	return invalidBlocks.filter(result => !result.isValid);
}
