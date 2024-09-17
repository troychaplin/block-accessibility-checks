/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions.coreHeadingBlockCheck;

/**
 * Checks the heading level of a block.
 *
 * @param {Object} block - The block object to be checked.
 * @return {Object} - The response object containing the validation result.
 */
export function checkHeadingLevel(block) {
	if (block.name === 'core/heading' && block.attributes.level === 1) {
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
					'Error: Level 1 headings should only be used for page titles',
					'block-accessibility-checks'
				);
				break;
			case 'warning':
				response.isValid = false;
				response.message = __(
					'Warning: Level 1 headings should only be used for page titles',
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
