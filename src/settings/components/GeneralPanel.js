import { Panel, PanelBody, PanelRow, ToggleControl, CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const REMOVABLE_HEADINGS = [
	{ value: 'h1', label: __('Remove H1', 'block-accessibility-checks') },
	{ value: 'h5', label: __('Remove H5', 'block-accessibility-checks') },
	{ value: 'h6', label: __('Remove H6', 'block-accessibility-checks') },
];

/**
 * General (non-check) settings panel: heading-level removal and the global
 * site-editor validation toggle.
 *
 * @param {Object}   props
 * @param {Object}   props.general  - { headingLevels: string[], siteEditorEnabled: boolean }.
 * @param {Function} props.onChange - Called with the updated general object.
 */
export function GeneralPanel({ general, onChange }) {
	const headingLevels = general?.headingLevels || [];
	const siteEditorEnabled = general?.siteEditorEnabled !== false;

	const toggleHeading = (level, isChecked) => {
		const next = isChecked ? [...headingLevels, level] : headingLevels.filter(l => l !== level);
		onChange({ ...general, headingLevels: next });
	};

	return (
		<Panel className="ba11yc-settings__general">
			<PanelBody
				title={__('General settings', 'block-accessibility-checks')}
				initialOpen={false}
			>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Validate in the site editor', 'block-accessibility-checks')}
						help={__(
							'When disabled, no validation runs while editing templates and template parts.',
							'block-accessibility-checks'
						)}
						checked={siteEditorEnabled}
						onChange={value => onChange({ ...general, siteEditorEnabled: value })}
					/>
				</PanelRow>
				<PanelRow>
					<fieldset>
						<legend>
							{__('Restrict heading levels', 'block-accessibility-checks')}
						</legend>
						{REMOVABLE_HEADINGS.map(({ value, label }) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={value}
								label={label}
								checked={headingLevels.includes(value)}
								onChange={isChecked => toggleHeading(value, isChecked)}
							/>
						))}
					</fieldset>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
}
