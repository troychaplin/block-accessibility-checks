/**
 * Resolves which part of the block tree validation should consider.
 *
 * In the post editor with a template rendered around the content, the block
 * tree includes template blocks (site title, navigation, footer) that the
 * author cannot edit from here. Validating those produces issues that can
 * never be acted on, and - for document-wide checks such as heading order -
 * lets template headings distort the outline.
 *
 * Mirrors how core's own Document Outline scopes itself; see
 * packages/editor/src/components/document-outline in Gutenberg.
 */

/**
 * Internal dependencies
 */
import { getEditorContext } from './get-validation-config';

/**
 * Work out which scope applies.
 *
 * Kept separate from the block lookup below so callers can read it in its own
 * useSelect. It returns a plain string, so subscribing to the editor store for
 * it cannot churn a caller that returns something less stable.
 *
 * @param {Function} select The `select` function from `@wordpress/data`.
 * @return {string} Either 'all' or 'post-content'.
 */
export function getValidationRootScope(select) {
	// In the site editor the template *is* the document, and it usually
	// contains a core/post-content block. Narrowing to that would skip
	// everything the author is actually editing.
	if (getEditorContext() === 'site-editor') {
		return 'all';
	}

	// getRenderingMode is the editor's own signal for whether a template is
	// rendered around the post content. Guard it: the editor store is absent
	// in some contexts, and the selector post-dates the plugin's minimum WP.
	const renderingMode = select('core/editor')?.getRenderingMode?.();

	return renderingMode === 'post-only' ? 'all' : 'post-content';
}

/**
 * Get the client IDs validation should run against, in document order.
 *
 * Reads only the block editor store, so a caller can subscribe to block changes
 * without also subscribing to the editor store.
 *
 * @param {Function} select The `select` function from `@wordpress/data`.
 * @param {string}   scope  From getValidationRootScope().
 * @return {string[]} Client IDs in document order (pre-order, depth first).
 */
export function getValidationRootClientIds(select, scope) {
	const blockEditor = select('core/block-editor');

	if ('all' === scope) {
		return blockEditor.getClientIdsWithDescendants();
	}

	const [postContentClientId] = blockEditor.getBlocksByName('core/post-content');

	// No post content block: a template that does not render the content. Fall
	// back to the whole tree.
	if (!postContentClientId) {
		return blockEditor.getClientIdsWithDescendants();
	}

	return blockEditor.getClientIdsOfDescendants(postContentClientId);
}
