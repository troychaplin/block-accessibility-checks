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
 * Custom DataForm control for the heading level restrictions.
 *
 * DataViews has no multi-checkbox control — its `array` control is a token
 * field, which suits free-form tags rather than a fixed set of six — so this
 * renders the toggles directly while still living inside DataForm's chrome.
 *
 * Note the inversion: the stored value is the list of *restricted* levels, so a
 * toggle is ON when its level is absent from the array, and switching it ON
 * removes the entry. That inversion is contained here; everything outside this
 * component sees the stored (restricted) shape.
 *
 * @param {Object}   props
 * @param {Object}   props.data     - The form data object ({ headingLevels }).
 * @param {Object}   props.field    - The normalized field definition.
 * @param {Function} props.onChange - Called with a partial patch of the form data.
 */
export function HeadingLevelsEdit({ data, field, onChange }) {
	const restricted = field.getValue({ item: data }) || [];

	const toggle = (level, enabled) => {
		const next = enabled
			? restricted.filter(l => l !== level)
			: [...restricted, level].filter((l, i, all) => all.indexOf(l) === i);

		onChange({ [field.id]: next });
	};

	return (
		<div className="ba11yc-heading-levels">
			<p className="ba11yc-heading-levels__description">
				{__(
					'Disable a heading level to remove it from the heading block in the editor.',
					'block-accessibility-checks'
				)}
			</p>
			<div className="ba11yc-heading-levels__grid">
				{HEADING_LEVELS.map(({ value, label }) => (
					<ToggleControl
						key={value}
						__nextHasNoMarginBottom
						label={label}
						checked={!restricted.includes(value)}
						onChange={enabled => toggle(value, enabled)}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * Field definitions for the heading levels DataForm.
 */
export const HEADING_LEVEL_FIELDS = [
	{
		id: 'headingLevels',
		label: __('Heading Level Restrictions', 'block-accessibility-checks'),
		Edit: HeadingLevelsEdit,
	},
];

/**
 * Form config: a single card holding the heading level toggles.
 *
 * Open by default so the toggles are discoverable — this is the only place the
 * restrictions can be changed, and collapsing it by default hid the feature.
 * Still collapsible for anyone who wants it out of the way.
 */
export const HEADING_LEVEL_FORM = {
	layout: {
		type: 'card',
		withHeader: true,
		isCollapsible: true,
		isOpened: true,
	},
	fields: ['headingLevels'],
};
