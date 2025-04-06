/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode = BlockAccessibilityChecks.blockChecksOptions.coreImageBlockCheck;

/**
 * Checks if an image block has an alt attribute and is not decorative.
 *
 * @param {Object} block - The image block to be checked.
 * @return {Object} - The validation response object.
 */
export function checkImageAlt(block) {
	if (block.name === 'core/image' && !block.attributes.alt && !block.attributes.isDecorative) {
		const response = {
			isValid: true,
			message: '',
			clientId: block.clientId,
			mode: validationMode,
		};

		switch (validationMode) {
			case 'error':
				response.isValid = false;
				response.message = __(
					'Error: Images are required to have alternative text',
					'block-accessibility-checks'
				);
				break;
			case 'warning':
				response.isValid = false;
				response.message = __(
					'Warning: Images are required to have alternative text',
					'block-accessibility-checks'
				);
				break;
			case 'none':
			default:
				response.isValid = true;
		}

		return response;
	}

	return { isValid: true, mode: 'none' };
}
