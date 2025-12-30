/**
 * Table Row Component
 *
 * Renders a single table row with cells for each column.
 * Uses column configuration to determine what to render in each cell.
 */

import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function TableRow({ row, columns, gridTemplate, onSettingChange }) {
	/**
	 * Render cell content based on column ID
	 *
	 * @param {Object} column - The column configuration object.
	 * @return {JSX.Element|null} The rendered cell content.
	 */
	const renderCell = column => {
		switch (column.id) {
			case 'check':
				return (
					<div className="ba11y-dataview-cell-content">
						<span className="ba11y-check-description">{row.check.description}</span>
					</div>
				);

			case 'block':
				return (
					<div className="ba11y-dataview-cell-content">
						<span className="ba11y-block-badge">{row.blockLabel}</span>
					</div>
				);

			case 'category':
				return (
					<div className="ba11y-dataview-cell-content">
						<span className="ba11y-category-badge">
							{row.check.category === 'accessibility'
								? __('Accessibility', 'block-accessibility-checks')
								: __('Validation', 'block-accessibility-checks')}
						</span>
					</div>
				);

			case 'level':
				return (
					<div className="ba11y-dataview-cell-content ba11y-level-control">
						<ToggleGroupControl
							value={row.value}
							onChange={newValue => onSettingChange(row.check.fieldName, newValue)}
							isBlock
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
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div
			className="ba11y-dataview-row"
			role="row"
			style={{ gridTemplateColumns: gridTemplate }}
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
