/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions.coreImageBlockCheck;

export function checkImageAlt(block) {
	if (
		block.name === 'core/image' &&
		!block.attributes.alt && // Image has no alt attribute
		!block.attributes.isDecorative // Image is not decorative
	) {
		const response = {
			isValid: true,
			message: '',
			clientId: block.clientId,
			mode: validationMode,
		};

		// Switch based on the validation mode
		switch (validationMode) {
			case 'error':
				response.isValid = false;
				response.message = __(
					'Accessibility Error: Images are required to have alternative text.',
					'block-accessibility-checks'
				);
				break;
			case 'warning':
				response.isValid = false;
				response.message = __(
					'Accessibility Warning: Images without alternative text are discouraged in your content area.',
					'block-accessibility-checks'
				);
				break;
			case 'none':
			default:
				response.isValid = true;
		}

		// console.log('image mode:', validationMode);
		// console.log('image isValid:', response.isValid);

		return response;
	}

	// If the block does not meet the conditions, return valid by default
	return { isValid: true, mode: 'none' };
}
