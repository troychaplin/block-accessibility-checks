/**
 * Internal dependencies
 */
import {
	DEFAULT_STATE,
	SET_INVALID_BLOCKS,
	SET_INVALID_META,
	SET_INVALID_EDITOR_CHECKS,
	SET_BLOCK_VALIDATION,
	CLEAR_BLOCK_VALIDATION,
} from './constants';

/**
 * Reducer for the validation store.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 * @return {Object} Updated state.
 */
export function reducer(state = DEFAULT_STATE, action) {
	switch (action.type) {
		case SET_INVALID_BLOCKS:
			return { ...state, blocks: action.results };

		case SET_INVALID_META:
			return { ...state, meta: action.results };

		case SET_INVALID_EDITOR_CHECKS:
			return { ...state, editor: action.issues };

		case SET_BLOCK_VALIDATION:
			return {
				...state,
				blockValidation: {
					...state.blockValidation,
					[action.clientId]: action.result,
				},
			};

		case CLEAR_BLOCK_VALIDATION: {
			const { [action.clientId]: _removed, ...remaining } = state.blockValidation;
			return { ...state, blockValidation: remaining };
		}

		default:
			return state;
	}
}
