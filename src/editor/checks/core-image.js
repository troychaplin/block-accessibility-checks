import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
	'block-accessibility-checks/imageValidation',
	(isValid, blockType, attributes, checkName) => {
		if (blockType !== 'core/image') {
			return isValid;
		}

		switch (checkName) {
			case 'check_image_alt_text':
				return validateImageAltText(attributes);
			case 'check_image_alt_text_length':
				return validateImageAltTextLength(attributes);
			case 'check_image_alt_caption_match':
				return validateImageAltCaptionMatch(attributes);
			case 'check_image_alt_text_patterns':
				return validateImageAltTextPatterns(attributes);
			default:
				return isValid;
		}
	}
);

function validateImageAltText(attributes) {
	if (!attributes.url || attributes.url.trim() === '') {
		return true;
	}
	if (attributes.isDecorative) {
		return true;
	}
	return !!(attributes.alt && attributes.alt.trim());
}

function validateImageAltTextLength(attributes) {
	if (!attributes.url || attributes.url.trim() === '') {
		return true;
	}
	if (!attributes.alt) {
		return true;
	}
	return attributes.alt.length <= 125;
}

function validateImageAltCaptionMatch(attributes) {
	if (!attributes.url || attributes.url.trim() === '') {
		return true;
	}
	if (!attributes.alt || !attributes.caption) {
		return true;
	}
	const alt = attributes.alt.trim().toLowerCase();
	const caption = attributes.caption.trim().toLowerCase();
	return alt !== caption;
}

function validateImageAltTextPatterns(attributes) {
	if (!attributes.url || attributes.url.trim() === '') {
		return true;
	}
	if (!attributes.alt || attributes.alt.trim() === '') {
		return true;
	}
	if (attributes.isDecorative) {
		return true;
	}

	const alt = attributes.alt.trim().toLowerCase();

	if (alt.length > 20) {
		return true;
	}

	const exactBlocks = [
		'image',
		'picture',
		'photo',
		'photograph',
		'img',
		'pic',
		'pics',
		'dsc',
		'dsc_',
		'dscn',
		'dscn_',
		'img_',
		'photo_',
		'picture_',
		'image_',
		'alt text',
		'alt tag',
		'alternative text',
		'alt',
		' ',
		'""',
		"''",
		'&nbsp;',
		'&amp;nbsp;',
		'nbsp;',
		'-',
		'--',
		'...',
		'untitled',
		'default',
		'placeholder',
		'.jpg',
		'.jpeg',
		'.png',
		'.gif',
		'.webp',
		'.svg',
	];

	for (const pattern of exactBlocks) {
		if (alt === pattern) {
			return false;
		}
	}

	if (/^[a-z0-9_-]+\.[a-z0-9]+$/i.test(alt)) {
		return false;
	}

	const prefixBlocks = [
		'image of',
		'picture of',
		'photo of',
		'photograph of',
		'img of',
		'pic of',
	];

	for (const pattern of prefixBlocks) {
		if (alt.startsWith(pattern) && alt.length <= 25) {
			return false;
		}
	}

	if (/^[a-z]+[0-9]+$/i.test(alt)) {
		return false;
	}
	if (/^[0-9]+$/i.test(alt)) {
		return false;
	}
	if (/^[^a-z0-9]*$/i.test(alt)) {
		return false;
	}

	return true;
}
