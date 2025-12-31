/**
 * Core Block Checks Settings Entry Point
 *
 * Initializes the React app for the Core Block Checks settings page.
 */

import { render } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import CoreBlocksApp from './settings/CoreBlocksApp';

const rootElement = document.getElementById('ba11y-core-blocks-settings-root');
if (rootElement) {
	render(
		<SlotFillProvider>
			<CoreBlocksApp />
		</SlotFillProvider>,
		rootElement
	);
}
