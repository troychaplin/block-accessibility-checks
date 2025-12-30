/**
 * Settings Table Component
 *
 * DataViews-style table with extensible column architecture.
 */

import { __ } from '@wordpress/i18n';
import { COLUMNS, getGridTemplate } from '../config/columns';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export default function SettingsTable({ blocks, settings, onSettingChange }) {
	// Flatten all checks from all blocks for table display
	const rows = [];

	blocks.forEach(block => {
		block.checks.forEach(check => {
			rows.push({
				id: check.fieldName,
				blockType: block.blockType,
				blockLabel: block.label,
				check,
				value: settings[check.fieldName] || 'error',
			});
		});
	});

	const gridTemplate = getGridTemplate();

	return (
		<div className="ba11y-dataview">
			<div className="ba11y-dataview-wrapper">
				<div
					className="ba11y-dataview-table"
					role="table"
					aria-label={__('Validation checks settings', 'block-accessibility-checks')}
				>
					<TableHeader columns={COLUMNS} gridTemplate={gridTemplate} />

					<div className="ba11y-dataview-tbody" role="rowgroup">
						{rows.length === 0 ? (
							<div className="ba11y-dataview-no-results">
								{__('No validation checks found.', 'block-accessibility-checks')}
							</div>
						) : (
							rows.map(row => (
								<TableRow
									key={row.id}
									row={row}
									columns={COLUMNS}
									gridTemplate={gridTemplate}
									onSettingChange={onSettingChange}
								/>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
