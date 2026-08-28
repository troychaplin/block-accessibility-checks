/**
 * Internal dependencies
 */
import {
	SET_INVALID_BLOCKS,
	SET_INVALID_META,
	SET_INVALID_EDITOR_CHECKS,
	SET_BLOCK_VALIDATION,
	CLEAR_BLOCK_VALIDATION,
	SET_HEADING_SIGNATURE,
	INVALIDATE_HEADING_OUTLINE,
} from './constants';

/**
 * Set the array of invalid block validation results.
 *
 * @param {Array} results Invalid block results from useInvalidBlocks.
 * @return {Object} Action object.
 */
export function setInvalidBlocks(results) {
	return { type: SET_INVALID_BLOCKS, results };
}

/**
 * Set the array of invalid meta validation results.
 *
 * @param {Array} results Invalid meta results from useInvalidMeta.
 * @return {Object} Action object.
 */
export function setInvalidMeta(results) {
	return { type: SET_INVALID_META, results };
}

/**
 * Set the array of editor-level validation issues.
 *
 * @param {Array} issues Editor check issues from useInvalidEditorChecks.
 * @return {Object} Action object.
 */
export function setInvalidEditorChecks(issues) {
	return { type: SET_INVALID_EDITOR_CHECKS, issues };
}

/**
 * Store a single block's validation result.
 *
 * @param {string} clientId Block client ID.
 * @param {Object} result   Validation result ({ mode, issues }).
 * @return {Object} Action object.
 */
export function setBlockValidation(clientId, result) {
	return { type: SET_BLOCK_VALIDATION, clientId, result };
}

/**
 * Remove a single block's validation result.
 *
 * @param {string} clientId Block client ID.
 * @return {Object} Action object.
 */
export function clearBlockValidation(clientId) {
	return { type: CLEAR_BLOCK_VALIDATION, clientId };
}

/**
 * Record a value that changes whenever the document heading outline changes.
 *
 * Blocks depend on this to know when to re-check their heading level, since one
 * block's heading can change the verdict on another's.
 *
 * @param {string} signature A value that changes whenever the outline does.
 * @return {Object} Action object.
 */
export function setHeadingSignature(signature) {
	return { type: SET_HEADING_SIGNATURE, signature };
}

/**
 * Force the heading outline to be recomputed.
 *
 * The heading level a block contributes is normally derived from its own
 * attributes, so a block editor change is enough to trigger a recompute. Code
 * that resolves levels from anywhere else - an asynchronous lookup, or state
 * outside the block - calls this when its answer changes.
 *
 * @return {Object} Action object.
 */
export function invalidateHeadingOutline() {
	return { type: INVALIDATE_HEADING_OUTLINE };
}
