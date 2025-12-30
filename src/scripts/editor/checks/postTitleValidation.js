/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

/**
 * Post Title Validation
 *
 * Validates that posts and pages have a title set for accessibility and SEO.
 * This check ensures content has a descriptive title before publishing.
 */
addFilter(
	'ba11yc_validate_editor',
	'ba11yc/post-title-validation',
	(isValid, blocks, postType, checkName) => {
		// Only handle the post_title_required check
		if (checkName !== 'post_title_required') {
			return isValid;
		}

		// Get the current post title from the editor
		const title = select('core/editor')?.getEditedPostAttribute('title');

		// Validation fails if title is empty or only whitespace
		if (!title || title.trim().length === 0) {
			return false;
		}

		// Title exists and has content
		return true;
	}
);
