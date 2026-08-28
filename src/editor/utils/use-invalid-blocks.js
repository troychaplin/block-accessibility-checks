/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateBlock } from './validate-block';
import { getValidationRootScope, getValidationRootClientIds } from './get-validation-root';

/**
 * React hook that retrieves all invalid blocks from the current editor state.
 *
 * Scoped to the blocks the author can act on: in the post editor with a
 * template around the content, template blocks are skipped.
 *
 * @return {Array} Array of validation results for all invalid blocks in the editor.
 */
export function useInvalidBlocks() {
	const scope = useSelect(select => getValidationRootScope(select), []);

	// Returns the blocks themselves, whose references are stable until they
	// change, so useSelect can compare them. Validation happens below rather
	// than in here: it reads several stores and builds a fresh result object
	// every time, which would both over-subscribe this hook and defeat that
	// comparison.
	const blocks = useSelect(
		select => {
			const { getBlock } = select('core/block-editor');

			// Already flat and in document order, descendants included.
			return getValidationRootClientIds(select, scope)
				.map(clientId => getBlock(clientId))
				.filter(Boolean);
		},
		[scope]
	);

	const results = [];

	for (const block of blocks) {
		const result = validateBlock(block);

		if (!result.isValid) {
			results.push(result);
		}
	}

	return results;
}
