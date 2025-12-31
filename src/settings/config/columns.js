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
		width: '3fr',
		minWidth: '300px',
		enableSorting: true,
		primary: true, // Primary column gets bold treatment
	},
	{
		id: 'block',
		header: __('Block', 'block-accessibility-checks'),
		// width: '180px',
		width: '1fr',
		minWidth: '180px',
		enableSorting: true,
	},
	{
		id: 'category',
		header: __('Category', 'block-accessibility-checks'),
		// width: '140px',
		width: '1fr',
		minWidth: '140px',
		enableSorting: true,
	},
	{
		id: 'level',
		header: __('Level', 'block-accessibility-checks'),
		// width: '240px',
		width: '1fr',
		minWidth: '240px',
		align: 'right',
	},
];

/**
 * Get grid template columns string for CSS Grid
 */
export function getGridTemplate() {
	return COLUMNS.map(col => col.width).join(' ');
}
