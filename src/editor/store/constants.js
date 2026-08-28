/**
 * Store constants for the block-accessibility-checks data store.
 */

export const STORE_NAME = 'block-accessibility-checks';

export const SET_INVALID_BLOCKS = 'SET_INVALID_BLOCKS';
export const SET_INVALID_META = 'SET_INVALID_META';
export const SET_INVALID_EDITOR_CHECKS = 'SET_INVALID_EDITOR_CHECKS';
export const SET_BLOCK_VALIDATION = 'SET_BLOCK_VALIDATION';
export const CLEAR_BLOCK_VALIDATION = 'CLEAR_BLOCK_VALIDATION';
export const SET_HEADING_SIGNATURE = 'SET_HEADING_SIGNATURE';
export const INVALIDATE_HEADING_OUTLINE = 'INVALIDATE_HEADING_OUTLINE';

export const DEFAULT_STATE = {
	blocks: [],
	meta: [],
	editor: [],
	blockValidation: {},
	headingSignature: '',
	headingInvalidation: 0,
};

/**
 * Returned by `getBlockValidation` when no result has been dispatched for
 * a given clientId. Frozen so consumers can compare by reference.
 */
export const DEFAULT_BLOCK_RESULT = Object.freeze({
	mode: 'none',
	issues: [],
});
