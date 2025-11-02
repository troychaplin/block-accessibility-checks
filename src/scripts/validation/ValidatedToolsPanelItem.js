import { __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';
import { ValidationDisplay } from './ValidationDisplay';

/**
 * ValidatedToolsPanelItem - Drop-in replacement for ToolsPanelItem with validation
 *
 * Works exactly like __experimentalToolsPanelItem but adds automatic meta validation
 * when the metaKey prop is provided.
 *
 * @param {Object}                    props                               - Component props.
 * @param {string}                    [props.metaKey]                     - Meta key to validate (optional).
 * @param {import('react').ReactNode} props.children                      - The control component(s).
 * @param {boolean}                   [props.showValidationMessages=true] - Show validation messages (default: true).
 * @param {*}                         [props.toolsPanelItemProps]         - Additional ToolsPanelItem props (hasValue, label, onDeselect, etc.).
 * @return {import('react').ReactElement} The rendered ValidatedToolsPanelItem component.
 *
 * @example
 * <ValidatedToolsPanelItem
 *   metaKey="band_origin"
 *   hasValue={() => bandOrigin !== ''}
 *   label="City of Origin"
 *   isShownByDefault
 * >
 *   <TextControl
 *     label="City of Origin"
 *     value={bandOrigin}
 *     onChange={updateBandOrigin}
 *   />
 * </ValidatedToolsPanelItem>
 */
export function ValidatedToolsPanelItem({
	metaKey,
	children,
	showValidationMessages = true,
	...toolsPanelItemProps
}) {
	// If no metaKey, render standard ToolsPanelItem
	if (!metaKey) {
		return <ToolsPanelItem {...toolsPanelItemProps}>{children}</ToolsPanelItem>;
	}

	// Use ValidationDisplay to add validation
	return (
		<ToolsPanelItem {...toolsPanelItemProps}>
			<ValidationDisplay
				metaKey={metaKey}
				showMessages={showValidationMessages}
				skipWrapper={false}
			>
				{children}
			</ValidationDisplay>
		</ToolsPanelItem>
	);
}
