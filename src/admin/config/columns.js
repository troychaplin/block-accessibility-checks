/**
 * Column Configuration for Core Block Settings
 *
 * Defines the table columns for the core blocks settings page.
 * Easy to extend with new columns in the future.
 */

import { __ } from '@wordpress/i18n';

/**
 * Column definitions for the core block settings table
 *
 * Each column should have:
 * - id: Unique identifier
 * - header: Display name for column header
 * - enableSorting: Whether column can be sorted (optional)
 * - primary: Whether this is the primary column (optional)
 */
export const COLUMNS = [
	{
		id: 'check',
		header: __('Validation Check', 'block-accessibility-checks'),
		enableSorting: true,
		primary: true, // Primary column gets bold treatment
	},
	{
		id: 'block',
		header: __('Block', 'block-accessibility-checks'),
		enableSorting: true,
	},
	{
		id: 'category',
		header: __('Category', 'block-accessibility-checks'),
		enableSorting: true,
	},
	{
		id: 'level',
		header: __('Priority Level', 'block-accessibility-checks'),
	},
	{
		id: 'siteEditor',
		header: __('Site Editor', 'block-accessibility-checks'),
	},
];
