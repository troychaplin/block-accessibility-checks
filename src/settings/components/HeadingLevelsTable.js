import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const HEADING_LEVELS = [
	{ value: 'h1', label: 'H1' },
	{ value: 'h2', label: 'H2' },
	{ value: 'h3', label: 'H3' },
	{ value: 'h4', label: 'H4' },
	{ value: 'h5', label: 'H5' },
	{ value: 'h6', label: 'H6' },
];

/**
 * Secondary table for restricting which heading levels are available in the editor.
 *
 * Stores the list of *restricted* (disabled) heading levels. Toggle ON means the
 * level is available; toggle OFF means it is removed from the heading block's options.
 *
 * @param {Object}   props
 * @param {string[]} props.headingLevels - Array of currently restricted levels (e.g. ['h1']).
 * @param {Function} props.onChange      - Called with the updated restricted-levels array.
 */
export function HeadingLevelsTable({ headingLevels = ['h1'], onChange }) {
	const isEnabled = level => !headingLevels.includes(level);

	const toggle = (level, enabled) => {
		const next = enabled ? headingLevels.filter(l => l !== level) : [...headingLevels, level];
		onChange(next);
	};

	return (
		<div className="ba11yc-heading-levels">
			<h2 className="ba11yc-heading-levels__title">
				{__('Heading Level Restrictions', 'block-accessibility-checks')}
			</h2>
			<p className="ba11yc-heading-levels__description">
				{__(
					'Disable heading levels to remove them from the heading block toolbar in the editor.',
					'block-accessibility-checks'
				)}
			</p>
			<table className="ba11yc-heading-levels__table">
				<thead>
					<tr>
						<th scope="col">{__('Level', 'block-accessibility-checks')}</th>
						<th scope="col">{__('Enable in editor', 'block-accessibility-checks')}</th>
					</tr>
				</thead>
				<tbody>
					{HEADING_LEVELS.map(({ value, label }) => (
						<tr key={value}>
							<td>
								<code>{label}</code>
							</td>
							<td>
								<ToggleControl
									__nextHasNoMarginBottom
									label={label}
									hideLabelFromVision
									checked={isEnabled(value)}
									onChange={enabled => toggle(value, enabled)}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
