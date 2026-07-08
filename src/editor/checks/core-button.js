import { addFilter } from '@wordpress/hooks';
import { isValidUrl } from './isValidUrl';

addFilter(
	'ba11yc.validateBlock',
	'block-accessibility-checks/buttonValidation',
	(isValid, blockType, attributes, checkName) => {
		if (blockType !== 'core/button') {
			return isValid;
		}

		switch (checkName) {
			case 'check_button_link':
				return validateButtonLink(attributes);
			case 'check_button_text':
				return validateButtonText(attributes);
			default:
				return isValid;
		}
	}
);

function validateButtonLink(attributes) {
	// <button> elements don't navigate, so a URL isn't required.
	if (attributes.tagName === 'button') {
		return true;
	}
	const hasUrl = !!(attributes.url && attributes.url.trim());
	return hasUrl && isValidUrl(attributes.url);
}

function validateButtonText(attributes) {
	if (!attributes.text) {
		return false;
	}

	let textContent = '';
	if (typeof attributes.text === 'string') {
		textContent = attributes.text;
	} else if (attributes.text.originalHTML) {
		textContent = attributes.text.originalHTML;
	}

	const text = textContent.replace(/<[^>]*>/g, '').trim();
	return text.length > 0 && /[a-zA-Z0-9]/.test(text);
}
