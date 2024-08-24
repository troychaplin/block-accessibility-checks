import { __ } from '@wordpress/i18n';
import { VALIDATION_MODES } from '../helpers/validationModes'; // Adjust the path accordingly
const validationMode = VALIDATION_MODES.WARNING;

export function checkHeadingLevel(block) {
	if (block.name === 'core/heading' && block.attributes.level === 1) {
		const response = {
			isValid: true,
			message: '',
			clientId: block.clientId,
			mode: validationMode, // Use the default mode here
		};

		switch (validationMode) {
			case VALIDATION_MODES.WARNING:
				response.isValid = false;
				response.message = __(
					'Warning: Level 1 headings are discouraged in your content area.',
					'block-accessibility-checks'
				);
				break;
			case VALIDATION_MODES.ERROR:
				response.isValid = false;
				response.message = __(
					'Accessibility Error: Level 1 headings are not allowed in your content area.',
					'block-accessibility-checks'
				);
				break;
			case VALIDATION_MODES.NONE:
			default:
				response.isValid = true;
		}

		return response;
	}
	return { isValid: true };
}
