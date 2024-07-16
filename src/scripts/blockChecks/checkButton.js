import { __ } from '@wordpress/i18n';

export function checkButtonAttributes(block) {
	const checkButton = (innerBlocks, parentClientId) => {
		for (const innerBlock of innerBlocks) {
			if (innerBlock.name === 'core/button') {
				const { text, url } = innerBlock.attributes;
				if (text === '' || url === undefined) {
					return {
						isValid: false,
						message: __(
							'Accessibility Error: Each button must have both text and URL.',
							'block-accessibility-checks'
						),
						clientId: parentClientId,
					};
				}
			}
			// Recursively check nested inner blocks
			if (innerBlock.innerBlocks.length > 0) {
				const result = checkButton(
					innerBlock.innerBlocks,
					parentClientId
				);
				if (!result.isValid) {
					return result;
				}
			}
		}
		return { isValid: true };
	};
	return checkButton(block.innerBlocks, block.clientId);
}
