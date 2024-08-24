import { __ } from '@wordpress/i18n';
import { VALIDATION_MODES } from '../helpers/validationModes'; // Adjust the path accordingly
const validationMode = VALIDATION_MODES.ERROR;

export function checkImageAlt(block) {
	if (
		block.name === 'core/image' &&
		!block.attributes.alt &&
		!block.attributes.isDecorative
	) {
		const response = {
			isValid: true,
			message: '',
			clientId: block.clientId,
			mode: validationMode,
		};

		switch (validationMode) {
			case VALIDATION_MODES.WARNING:
				response.isValid = false;
				response.message = __(
					'Accessibility Warning: Images without alternative text are discouraged in your content area.',
					'block-accessibility-checks'
				);
				break;
			case VALIDATION_MODES.ERROR:
				response.isValid = false;
				response.message = __(
					'Accessibility Error: Images are required to have alternative text.',
					'block-accessibility-checks'
				);
				break;
			case VALIDATION_MODES.NONE:
			default:
				response.isValid = true;
		}

		return response;
	}
	return { isValid: true, mode: VALIDATION_MODES.NONE };
}
