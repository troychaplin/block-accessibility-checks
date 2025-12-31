/**
 * External Plugins Settings Entry Point
 *
 * Initializes the React app for external plugin settings pages.
 */

import { render } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import ExternalPluginsApp from './settings/ExternalPluginsApp';

const rootElement = document.getElementById('ba11y-external-plugin-settings-root');
if (rootElement) {
	render(
		<SlotFillProvider>
			<ExternalPluginsApp />
		</SlotFillProvider>,
		rootElement
	);
}
