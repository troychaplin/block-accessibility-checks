import { __ } from '@wordpress/i18n';

export function checkTableHeaderRow(block) {
	if (
		block.name === 'core/table' &&
		block.attributes.body.length !== 0 &&
		block.attributes.head.length === 0
	) {
		return {
			isValid: false,
			message: __(
				'Accessibility Error: Tables are required to have a header row.',
				'block-accessibility-checks'
			),
			clientId: block.clientId,
		};
	}
	return { isValid: true };
}
