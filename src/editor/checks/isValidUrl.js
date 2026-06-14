/**
 * Lightweight URL validation helper for editor checks.
 *
 * Accepts relative URLs, mailto:, tel:, and http/https URLs that parse
 * successfully with the native URL constructor.
 *
 * @param {string} value
 * @return {boolean}
 */

const ALLOWED_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel']);

export function isValidUrl(value) {
	if (typeof value !== 'string') {
		return false;
	}
	const trimmed = value.trim();
	if (!trimmed) {
		return false;
	}
	if (/^(\/|#|\?)/.test(trimmed)) {
		return true;
	}

	try {
		const url = new URL(trimmed);
		return ALLOWED_PROTOCOLS.has(url.protocol.replace(':', '').toLowerCase());
	} catch {
		return false;
	}
}
