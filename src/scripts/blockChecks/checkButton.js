/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode =
	BlockAccessibilityChecks.blockChecksOptions.coreButtonBlockCheck;

export function checkButtonAttributes(block) {
	// Safeguard: Ensure innerBlocks is an array before attempting to iterate over it
	const checkButton = (innerBlocks = [], parentClientId) => {
		for (const innerBlock of innerBlocks) {
			if (innerBlock.name === 'core/button') {
				const { text, url } = innerBlock.attributes;

				// Check if the button has text and URL
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

			// Recursively check nested inner blocks, ensure innerBlocks is always an array
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

	// Start checking for buttons in the inner blocks of the current block
	return checkButton(block.innerBlocks, block.clientId);
}
