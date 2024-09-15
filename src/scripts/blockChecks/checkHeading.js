import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions['coreHeadingBlockCheck'];

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
					'Accessibility Error: Level 1 headings are not allowed in your content area.',
					'block-accessibility-checks'
				);
				break;
			case 'warning':
				response.isValid = false;
				response.message = __(
					'Warning: Level 1 headings are discouraged in your content area.',
					'block-accessibility-checks'
				);
				break;
			case 'none':
			default:
				response.isValid = true;
		}

		// console.log('heading mode:', validationMode);
		// console.log('heading isValid:', response.isValid);

		return response;
	}
	return { isValid: true, mode: 'none' };
}
