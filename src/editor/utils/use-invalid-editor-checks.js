/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateEditor } from './validate-editor';

/**
 * React hook that retrieves all invalid editor-level validation checks.
 *
 * @return {Array} Array of validation issues for editor-level checks that failed.
 */
export function useInvalidEditorChecks() {
	const { blocks, postType } = useSelect(select => {
		const editor = select('core/editor');
		const blockEditor = select('core/block-editor');

		return {
			postType: editor.getCurrentPostType(),
			blocks: blockEditor.getBlocks(),
			title: editor.getEditedPostAttribute('title'),
		};
	}, []);

	if (!postType || !blocks) {
		return [];
	}

	const validation = validateEditor(postType, blocks);

	return validation.issues;
}
