/**
 * Settings Demo - Proof of Concept
 *
 * React-based settings page using @wordpress/components
 */

import { render } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import DemoSettingsApp from './settings-demo/DemoSettingsApp';
import './settings-demo.scss';

const rootElement = document.getElementById('ba11y-demo-settings-root');

if (rootElement) {
	render(
		<SlotFillProvider>
			<DemoSettingsApp />
		</SlotFillProvider>,
		rootElement
	);
}
