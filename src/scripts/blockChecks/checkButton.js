/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode = BlockAccessibilityChecks.blockChecksOptions.core_button_block_check;

/**
 * Checks the heading level of a block.
 *
 * @param {Object} block - The block object to be checked.
 * @return {Object} - The response object containing the validation result.
 */
export function checkButtonAttributes(block) {
	if (
		block.name === 'core/button' &&
		!block.attributes.url &&
		!block.attributes.text.originalHTML
	) {
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
					'Error: Buttons must have text and a link',
					'block-accessibility-checks'
				);
				break;
			case 'warning':
				response.isValid = false;
				response.message = __(
					'Warning: Buttons must have text and a link',
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
