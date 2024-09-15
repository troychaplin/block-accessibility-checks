/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions.coreTableBlockCheck;

export function checkTableHeaderRow(block) {
	if (
		block.name === 'core/table' &&
		block.attributes.body.length !== 0 &&
		block.attributes.head.length === 0
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
					'Accessibility Error: Tables are required to have a header row.',
					'block-accessibility-checks'
				);
				break;
			case 'warning':
				response.isValid = false;
				response.message = __(
					'Warning: It is recommended that tables have a header row.',
					'block-accessibility-checks'
				);
				break;
			case 'none':
			default:
				response.isValid = true;
		}

		// console.log('table mode:', validationMode);
		// console.log('table isValid:', response.isValid);

		return response;
	}
	// Return valid if block doesn't match table conditions
	return { isValid: true, mode: 'none' };
}
