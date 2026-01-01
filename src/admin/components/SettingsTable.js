/**
 * Settings Table Component
 *
 * DataViews-style table with extensible column architecture.
 * Handles both regular validation checks and heading level configuration.
 */

import { __ } from '@wordpress/i18n';
import { COLUMNS, getGridTemplate } from '../config/columns';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export default function SettingsTable({
	blocks,
	settings,
	headingLevels,
	onSettingChange,
	onHeadingLevelChange,
	checkHeaderLabel,
	blockHeaderLabel,
	categoryHeaderLabel,
}) {
	// Flatten all checks from all blocks for table display
	const rows = [];

	blocks.forEach(block => {
		// Special handling for heading block - add heading levels row first
		if (block.blockType === 'core/heading' && typeof onHeadingLevelChange === 'function') {
			rows.push({
				id: 'heading_levels_config',
				blockType: 'core/heading',
				blockLabel: block.label,
				isHeadingLevels: true,
				headingLevels,
				check: {
					description: __(
						'Select which heading levels you want to remove from the editor. H2, H3 and H4 are always available.',
						'block-accessibility-checks'
					),
					category: 'validation',
					fieldName: 'heading_levels',
				},
			});
		}

		block.checks.forEach(check => {
			rows.push({
				id: check.fieldName,
				blockType: block.blockType,
				blockLabel: block.label,
				postTypeLabel: block.postTypeLabel,
				check,
				value: settings[check.fieldName] || 'error',
				isHeadingLevels: false,
			});
		});
	});

	const gridTemplate = getGridTemplate();

	// Create custom columns with dynamic headers
	const customColumns = COLUMNS.map(col => {
		if (col.id === 'check' && checkHeaderLabel) {
			return { ...col, header: checkHeaderLabel };
		}
		if (col.id === 'block' && blockHeaderLabel) {
			return { ...col, header: blockHeaderLabel };
		}
		if (col.id === 'category' && categoryHeaderLabel) {
			return { ...col, header: categoryHeaderLabel };
		}
		return col;
	});

	return (
		<div className="ba11y-dataview">
			<div className="ba11y-dataview-wrapper">
				<div
					className="ba11y-dataview-table"
					role="table"
					aria-label={__('Validation checks settings', 'block-accessibility-checks')}
				>
					<TableHeader columns={customColumns} gridTemplate={gridTemplate} />

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
									columns={customColumns}
									gridTemplate={gridTemplate}
									onSettingChange={onSettingChange}
									onHeadingLevelChange={onHeadingLevelChange}
								/>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
