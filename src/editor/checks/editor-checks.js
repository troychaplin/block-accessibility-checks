/**
 * Document-level (editor) validation logic.
 *
 * Implements the `post_title_required` editor check registered in PHP by
 * reading the current post title from the editor store.
 */

import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

addFilter(
	'ba11yc.validateEditor',
	'block-accessibility-checks/editorChecks',
	(isValid, blocks, postType, checkName) => {
		if (checkName === 'post_title_required') {
			const title = select('core/editor').getEditedPostAttribute('title');
			return !!(title && title.trim());
		}

		return isValid;
	}
);
