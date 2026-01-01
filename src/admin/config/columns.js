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
 * - width: CSS width value (optional)
 * - minWidth: Minimum width (optional)
 * - enableSorting: Whether column can be sorted (optional)
 * - renderCell: Function to render cell content
 */
export const COLUMNS = [
	{
		id: 'check',
		header: __('Validation Check', 'block-accessibility-checks'),
		width: 'minmax(200px, 2fr)',
		enableSorting: true,
		primary: true, // Primary column gets bold treatment
	},
	{
		id: 'block',
		header: __('Block', 'block-accessibility-checks'),
		width: 'minmax(120px, 0.75fr)',
		enableSorting: true,
	},
	{
		id: 'category',
		header: __('Category', 'block-accessibility-checks'),
		width: 'minmax(100px, 0.75fr)',
		enableSorting: true,
	},
	{
		id: 'level',
		header: __('Priority Level', 'block-accessibility-checks'),
		width: 'minmax(180px, 1fr)',
		align: 'right',
	},
	{
		id: 'siteEditor',
		header: __('Site Editor', 'block-accessibility-checks'),
		width: 'minmax(180px, 0.85fr)',
		align: 'center',
	},
];

/**
 * Get grid template columns string for CSS Grid
 */
export function getGridTemplate() {
	return COLUMNS.map(col => col.width).join(' ');
}
