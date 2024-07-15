import { __ } from '@wordpress/i18n';

export function checkHeadingLevel( block ) {
	if ( block.name === 'core/heading' && block.attributes.level === 1 ) {
		return {
			isValid: false,
			message: __(
				'Accessibility Error: Level 1 headings are not allowed in your content area.',
				'block-accessibility-checks'
			),
			clientId: block.clientId,
		};
	}
	return { isValid: true };
}
