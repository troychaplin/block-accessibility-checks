import { __ } from '@wordpress/i18n';

export function checkImageAlt(block) {
	if (block.name === 'core/image' && !block.attributes.alt) {
		return {
			isValid: false,
			message: __(
				'Accessibility Error: Images are required to have alternative text.',
				'block-accessibility-checks'
			),
			clientId: block.clientId,
		};
	}
	return { isValid: true };
}
