/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateEditor } from './validateEditor';

/**
 * Get all invalid editor checks for current post.
 *
 * @return {Array} Array of invalid editor validation results.
 */
export function GetInvalidEditorChecks() {
	const { blocks, postType } = useSelect(select => {
		const editor = select('core/editor');
		const blockEditor = select('core/block-editor');

		return {
			postType: editor.getCurrentPostType(),
			blocks: blockEditor.getBlocks(),
		};
	}, []);

	if (!postType || !blocks) {
		return [];
	}

	const validation = validateEditor(blocks, postType);

	return validation.results;
}
