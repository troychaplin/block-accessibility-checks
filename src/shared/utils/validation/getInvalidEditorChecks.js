/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { validateEditor } from '@editor/validation/editor';

/**
 * React hook that retrieves all invalid editor-level validation checks.
 *
 * Fetches the current post type and blocks from the editor, then runs
 * editor-level validation rules (distinct from block-level validation).
 * Editor checks validate overall document structure and post-level
 * accessibility requirements. Updates automatically when editor state changes.
 *
 * @return {Array} Array of validation issues for editor-level checks that failed.
 */
export function GetInvalidEditorChecks() {
	// Retrieve current post type, blocks, and title from the editor store
	// Including title ensures validation updates in real-time as user types
	const { blocks, postType } = useSelect(select => {
		const editor = select('core/editor');
		const blockEditor = select('core/block-editor');

		return {
			postType: editor.getCurrentPostType(),
			blocks: blockEditor.getBlocks(),
			title: editor.getEditedPostAttribute('title'),
		};
	}, []);

	// Return empty array if required data is not yet available
	if (!postType || !blocks) {
		return [];
	}

	// Run editor-level validation for the current post type and blocks
	// The title dependency ensures this re-runs when title changes
	const validation = validateEditor(postType, blocks);

	// Return only the issues array from the validation result
	return validation.issues;
}
