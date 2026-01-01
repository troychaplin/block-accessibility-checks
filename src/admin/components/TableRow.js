/**
 * Table Row Component
 *
 * Renders a single table row with cells for each column.
 * Uses column configuration to determine what to render in each cell.
 */

import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	CheckboxControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function TableRow({
	row,
	columns,
	onSettingChange,
	onHeadingLevelChange,
	onSiteEditorChange,
}) {
	/**
	 * Render cell content based on column ID
	 *
	 * @param {Object} column - The column configuration object.
	 * @return {JSX.Element|null} The rendered cell content.
	 */
	const renderCell = column => {
		switch (column.id) {
			case 'check':
				return <span className="ba11y-check-description">{row.check.description}</span>;

			case 'block':
				return <span className="ba11y-block-badge">{row.blockLabel}</span>;

			case 'category':
				// For meta checks, show post type instead of category
				if (row.postTypeLabel) {
					return <span className="ba11y-category-badge">{row.postTypeLabel}</span>;
				}
				return (
					<span className="ba11y-category-badge">
						{row.check.category === 'accessibility'
							? __('Accessibility', 'block-accessibility-checks')
							: __('Validation', 'block-accessibility-checks')}
					</span>
				);

			case 'level':
				// Special handling for heading levels
				if (row.isHeadingLevels) {
					return (
						<div className="ba11y-heading-levels-checkboxes">
							{['h1', 'h5', 'h6'].map(level => (
								<CheckboxControl
									key={level}
									label={level.toUpperCase()}
									checked={row.headingLevels?.includes(level) || false}
									onChange={checked => onHeadingLevelChange(level, checked)}
									__nextHasNoMarginBottom
								/>
							))}
						</div>
					);
				}

				return (
					<ToggleGroupControl
						value={row.value}
						onChange={newValue => onSettingChange(row.check.fieldName, newValue)}
						isBlock
						__nextHasNoMarginBottom
						className="ba11y-level-control"
						aria-label={__('Validation level', 'block-accessibility-checks')}
					>
						<ToggleGroupControlOption
							value="error"
							label={__('Error', 'block-accessibility-checks')}
						/>
						<ToggleGroupControlOption
							value="warning"
							label={__('Warning', 'block-accessibility-checks')}
						/>
						<ToggleGroupControlOption
							value="none"
							label={__('None', 'block-accessibility-checks')}
						/>
					</ToggleGroupControl>
				);

			case 'siteEditor':
				// Skip site editor toggle for heading levels row
				if (row.isHeadingLevels) {
					return null;
				}

				// Determine if toggle should be disabled (when priority level is 'none')
				const isDisabled = row.value === 'none';
				const siteEditorEnabled = row.siteEditorEnabled ?? true;

				return (
					<ToggleControl
						label={__('Enable in Editor', 'block-accessibility-checks')}
						checked={siteEditorEnabled}
						onChange={checked => {
							if (onSiteEditorChange) {
								onSiteEditorChange(row.check.fieldName, checked);
							}
						}}
						disabled={isDisabled}
						__nextHasNoMarginBottom
						aria-label={__('Enable in site editor', 'block-accessibility-checks')}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div
			className={`ba11y-dataview-row ${row.isHeadingLevels ? 'ba11y-dataview-row-heading-levels' : ''}`}
			role="row"
		>
			{columns.map(column => (
				<div
					key={column.id}
					className={`ba11y-dataview-cell ba11y-dataview-cell-${column.id} ${
						column.primary ? 'ba11y-dataview-cell-primary' : ''
					}`}
					role="cell"
					style={{
						textAlign: column.align || 'left',
					}}
				>
					{renderCell(column)}
				</div>
			))}
		</div>
	);
}
