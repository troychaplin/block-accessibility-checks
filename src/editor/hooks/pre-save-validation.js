/**
 * Side-effect module. Adds the `editor.preSavePost` async filter as a
 * save-time safety net layered on top of `lockPostSaving`.
 */

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';

addFilter('editor.preSavePost', 'block-accessibility-checks/pre-save-gate', async edits => {
	const validationStore = select(STORE_NAME);
	if (validationStore && validationStore.hasErrors && validationStore.hasErrors()) {
		throw new Error(
			__('Validation errors must be resolved before saving.', 'block-accessibility-checks')
		);
	}
	return edits;
});
