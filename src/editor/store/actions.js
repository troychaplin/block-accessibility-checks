/**
 * Internal dependencies
 */
import {
	SET_INVALID_BLOCKS,
	SET_INVALID_META,
	SET_INVALID_EDITOR_CHECKS,
	SET_BLOCK_VALIDATION,
	CLEAR_BLOCK_VALIDATION,
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
