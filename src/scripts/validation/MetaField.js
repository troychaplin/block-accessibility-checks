import { ValidationDisplay } from './ValidationDisplay';

/**
 * MetaField - Generic wrapper for any component
 *
 * Wraps any form control with automatic meta validation display.
 * Works with any component in any context (PluginSidebar, PluginDocumentSettingPanel, blocks, etc.)
 *
 * @param {Object}                    props                     - Component props.
 * @param {string}                    props.metaKey             - Meta key to validate.
 * @param {import('react').ReactNode} props.children            - Component(s) to wrap.
 * @param {boolean}                   [props.showMessages=true] - Whether to show validation messages.
 * @return {import('react').ReactElement} The rendered element.
 *
 * @example
 * <MetaField metaKey="band_origin">
 *   <TextControl
 *     label="City of Origin"
 *     value={origin}
 *     onChange={updateOrigin}
 *   />
 * </MetaField>
 */
export function MetaField({ metaKey, children, showMessages = true }) {
	return (
		<ValidationDisplay metaKey={metaKey} showMessages={showMessages}>
			{children}
		</ValidationDisplay>
	);
}
