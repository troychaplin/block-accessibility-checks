/**
 * WordPress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_NAME } from './constants';
import { reducer } from './reducer';
import * as selectors from './selectors';
import * as actions from './actions';

/**
 * Block Accessibility Checks validation data store.
 *
 * Centralizes all validation state (blocks, meta, editor checks, per-block
 * results) so multiple consumers can subscribe via useSelect without
 * duplicating computation.
 */
const store = createReduxStore(STORE_NAME, {
	reducer,
	selectors,
	actions,
});

register(store);

export { STORE_NAME } from './constants';
export {
	setInvalidBlocks,
	setInvalidMeta,
	setInvalidEditorChecks,
	setBlockValidation,
	clearBlockValidation,
} from './actions';
export {
	getInvalidBlocks,
	getInvalidMeta,
	getInvalidEditorChecks,
	getBlockValidation,
	hasErrors,
	hasWarnings,
} from './selectors';
