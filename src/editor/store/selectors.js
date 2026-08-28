/**
 * Internal dependencies
 */
import { DEFAULT_BLOCK_RESULT } from './constants';

/**
 * Get all invalid block validation results for the current post.
 *
 * @param {Object} state Store state.
 * @return {Array} Array of invalid block results.
 */
export function getInvalidBlocks(state) {
	return state.blocks;
}

/**
 * Get all invalid meta validation results for the current post.
 *
 * @param {Object} state Store state.
 * @return {Array} Array of invalid meta results.
 */
export function getInvalidMeta(state) {
	return state.meta;
}

/**
 * Get all editor-level validation issues for the current post.
 *
 * @param {Object} state Store state.
 * @return {Array} Array of editor check issues.
 */
export function getInvalidEditorChecks(state) {
	return state.editor;
}

/**
 * Get a single block's validation result.
 *
 * Returns `{ mode: 'none', issues: [] }` when no result has been stored.
 *
 * @param {Object} state    Store state.
 * @param {string} clientId Block client ID.
 * @return {Object} Validation result ({ mode, issues }).
 */
export function getBlockValidation(state, clientId) {
	return state.blockValidation[clientId] || DEFAULT_BLOCK_RESULT;
}

/**
 * Check if any validation errors exist across blocks, meta, and editor checks.
 *
 * @param {Object} state Store state.
 * @return {boolean} True if any errors exist.
 */
export function hasErrors(state) {
	const hasBlockErrors = state.blocks.some(block => block.mode === 'error');
	const hasMetaErrors = state.meta.some(meta => meta.hasErrors);
	const hasEditorErrors = state.editor.some(issue => issue.type === 'error');
	return hasBlockErrors || hasMetaErrors || hasEditorErrors;
}

/**
 * Check if any validation warnings exist (only when no errors are present).
 *
 * @param {Object} state Store state.
 * @return {boolean} True if warnings exist and no errors exist.
 */
export function hasWarnings(state) {
	if (hasErrors(state)) {
		return false;
	}
	const hasBlockWarnings = state.blocks.some(block => block.mode === 'warning');
	const hasMetaWarnings = state.meta.some(meta => meta.hasWarnings && !meta.hasErrors);
	const hasEditorWarnings = state.editor.some(issue => issue.type === 'warning');
	return hasBlockWarnings || hasMetaWarnings || hasEditorWarnings;
}

/**
 * Get a value that changes whenever the document heading outline changes.
 *
 * @param {Object} state Store state.
 * @return {string} The outline signature.
 */
export function getHeadingSignature(state) {
	return state.headingSignature;
}

/**
 * Get the heading outline invalidation counter.
 *
 * @param {Object} state Store state.
 * @return {number} Number of times the outline has been invalidated.
 */
export function getHeadingInvalidation(state) {
	return state.headingInvalidation;
}
