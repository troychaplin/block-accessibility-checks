/**
 * Editor Validation Settings Entry Point
 *
 * Initializes the React app for the Editor Validation settings page.
 */

import { render } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import EditorValidationApp from './settings/EditorValidationApp';

const rootElement = document.getElementById('ba11y-editor-validation-settings-root');
if (rootElement) {
	render(
		<SlotFillProvider>
			<EditorValidationApp />
		</SlotFillProvider>,
		rootElement
	);
}
