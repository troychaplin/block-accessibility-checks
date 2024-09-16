/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions.coreButtonBlockCheck;

/**
 * Checks the attributes of a button block for accessibility.
 *
 * @param {Object} block - The button block to check.
 * @return {Object} - The validation result object.
 */
export function checkButtonAttributes(block) {
	const checkButton = (innerBlocks = [], parentClientId) => {
		for (const innerBlock of innerBlocks) {
			if (innerBlock.name === 'core/button') {
				const { text, url } = innerBlock.attributes;

				if (!text || !url) {
					const response = {
						isValid: true,
						message: '',
						clientId: parentClientId,
						mode: validationMode,
					};

					switch (validationMode) {
						case 'error':
							response.isValid = false;
							response.message = __(
								'Accessibility Error: Each button must have both text and URL.',
								'block-accessibility-checks'
							);
							break;
						case 'warning':
							response.isValid = false;
							response.message = __(
								'Accessibility Warning: Each button should have both text and URL.',
								'block-accessibility-checks'
							);
							break;
						case 'none':
						default:
							response.isValid = true;
					}

					// console.log('button mode:', validationMode);
					// console.log('button isValid:', response.isValid);

					return response;
				}
			}

			if (
				Array.isArray(innerBlock.innerBlocks) &&
				innerBlock.innerBlocks.length > 0
			) {
				const result = checkButton(
					innerBlock.innerBlocks,
					parentClientId
				);
				if (!result.isValid) {
					return result;
				}
			}
		}
		return { isValid: true, mode: 'none' };
	};

	return checkButton(block.innerBlocks, block.clientId);
}
