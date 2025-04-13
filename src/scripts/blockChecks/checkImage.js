/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';
const validationMode = BlockAccessibilityChecks.blockChecksOptions.core_image_block_check;

/**
 * Checks if an image block meets accessibility requirements.
 *
 * @param {Object} block - The image block to be checked.
 * @return {Object} - The validation response object.
 */
export function checkImageAlt(block) {
	if (block.name === 'core/image') {
		const response = {
			isValid: true,
			message: '',
			clientId: block.clientId,
			mode: validationMode,
		};

		// Check if image is marked as decorative
		const isDecorative = block.attributes.isDecorative === true;

		// Check if alt text exists and is not empty
		const hasAltText = block.attributes.alt && block.attributes.alt.trim() !== '';

		// Check if alt text is not too long (max 125 characters)
		const altTextLength = hasAltText ? block.attributes.alt.length : 0;
		const isAltTextLengthValid = altTextLength <= 125;

		// Check if caption doesn't match alt text
		const hasCaption = block.attributes.caption && block.attributes.caption.trim() !== '';
		const captionMatchesAlt =
			hasCaption &&
			hasAltText &&
			block.attributes.caption.trim() === block.attributes.alt.trim();

		// Determine if any validation fails, if image is decorative, we don't need alt text
		const validationFails =
			(!hasAltText && !isDecorative) || !isAltTextLengthValid || captionMatchesAlt;

		if (validationFails) {
			// Build appropriate error message based on which conditions failed
			let errorMessage = '';

			if (!hasAltText && !isDecorative) {
				errorMessage = __(
					'Images are required to have alternative text',
					'block-accessibility-checks'
				);
			} else if (!isAltTextLengthValid) {
				errorMessage = __(
					'Image alternative text cannot be longer than 125 characters',
					'block-accessibility-checks'
				);
			} else if (captionMatchesAlt) {
				errorMessage = __(
					'Image caption cannot be the same as the alternative text',
					'block-accessibility-checks'
				);
			}

			switch (validationMode) {
				case 'error':
					response.isValid = false;
					response.message = __('Error:', 'block-accessibility-checks') + errorMessage;
					break;
				case 'warning':
					response.isValid = false;
					response.message = __('Warning:', 'block-accessibility-checks') + errorMessage;
					break;
				case 'none':
				default:
					response.isValid = true;
			}

			return response;
		}
	}

	return { isValid: true, mode: 'none' };
}
