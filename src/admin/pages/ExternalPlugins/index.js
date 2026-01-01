/**
 * External Plugins Settings Entry Point
 *
 * Initializes the React app for the External Plugins settings page.
 */

import { render } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import ExternalPluginsPage from './ExternalPluginsPage';

const rootElement = document.getElementById('ba11y-external-plugin-settings-root');
if (rootElement) {
	render(
		<SlotFillProvider>
			<ExternalPluginsPage />
		</SlotFillProvider>,
		rootElement
	);
}
