/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions.coreTableBlockCheck;

/**
 * Checks if a table block has a header row.
 *
 * @param {Object} block - The table block to be checked.
 * @return {Object} - The validation response object.
 */
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

		return response;
	}

	return { isValid: true, mode: 'none' };
}
