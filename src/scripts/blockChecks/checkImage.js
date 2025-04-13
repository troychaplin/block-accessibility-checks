/* global BlockAccessibilityChecks */
import { __ } from '@wordpress/i18n';

// Get validation mode from plugin settings
const validationMode = BlockAccessibilityChecks.blockChecksOptions.core_image_block_check;

/**
 * Checks if an image block meets accessibility requirements.
 *
 * @param {Object} block - The image block to be checked.
 * @return {Object} - The validation response object.
 */
export function checkImageAlt(block) {
	// Only process image blocks
	if (block.name !== 'core/image') {
		return { isValid: true, mode: 'none' };
	}

	// Check all validation conditions
	const validationResult = validateImageAccessibility(block);

	// Create response object based on validation result
	const response = {
		isValid: validationResult.isValid,
		message: '',
		clientId: block.clientId,
		mode: validationResult.isValid ? 'none' : validationMode,
	};

	// If validation fails, set appropriate error message
	if (!validationResult.isValid) {
		response.message = getValidationMessage(validationResult.failureReason, validationMode);
	}

	return response;
}

/**
 * Validates an image block against accessibility requirements.
 *
 * @param {Object} block - The image block to validate.
 * @return {Object} - Object containing validation result and failure reason if any.
 */
function validateImageAccessibility(block) {
	const result = {
		isValid: true,
		failureReason: null,
	};

	// Check if image is marked as decorative
	const isDecorative = block.attributes.isDecorative === true;

	// Check if alt text exists and is not empty
	const hasAltText = block.attributes.alt && block.attributes.alt.trim() !== '';

	// Check if alt text is not too long
	const altTextLength = hasAltText ? block.attributes.alt.length : 0;
	const isAltTextLengthValid = altTextLength <= 125;

	// Check if caption doesn't match alt text
	const hasCaption = block.attributes.caption && block.attributes.caption.trim() !== '';
	const captionMatchesAlt =
		hasCaption && hasAltText && block.attributes.caption.trim() === block.attributes.alt.trim();

	// Determine which validation fails (if any)
	if (!hasAltText && !isDecorative) {
		result.isValid = false;
		result.failureReason = 'missing_alt';
	} else if (!isAltTextLengthValid) {
		result.isValid = false;
		result.failureReason = 'alt_too_long';
	} else if (captionMatchesAlt) {
		result.isValid = false;
		result.failureReason = 'caption_matches_alt';
	}

	return result;
}

/**
 * Gets the appropriate validation message based on the failure reason and validation mode.
 *
 * @param {string} failureReason - The reason for validation failure.
 * @param {string} mode          - The validation mode (error, warning, none).
 * @return {string} - The formatted validation message.
 */
function getValidationMessage(failureReason, mode) {
	// Get the base message based on the failure reason
	let baseMessage = '';

	switch (failureReason) {
		case 'missing_alt':
			baseMessage = __(
				'Images are required to have alternative text',
				'block-accessibility-checks'
			);
			break;
		case 'alt_too_long':
			baseMessage = __(
				'Image alternative text cannot be longer than 125 characters',
				'block-accessibility-checks'
			);
			break;
		case 'caption_matches_alt':
			baseMessage = __(
				'Image caption cannot be the same as the alternative text',
				'block-accessibility-checks'
			);
			break;
		default:
			return '';
	}

	// Add the appropriate prefix based on the validation mode
	switch (mode) {
		case 'error':
			return __('Error:', 'block-accessibility-checks') + ' ' + baseMessage;
		case 'warning':
			return __('Warning:', 'block-accessibility-checks') + ' ' + baseMessage;
		case 'none':
		default:
			return baseMessage;
	}
}
