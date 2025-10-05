/**
 * URL Validation Helper
 *
 * Provides robust URL validation for accessibility checks using the tldts library
 * for real TLD validation against the Public Suffix List (PSL).
 *
 */

import { parse } from 'tldts';

// Pre-compiled regex patterns for performance
const RELATIVE_PATH_PATTERN = /^(\/|#|\?)/i;
const ALLOWED_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel']);

/**
 * Check if a URL is a valid relative path, fragment, or query string
 *
 * @param {string} value - The URL string to check
 * @return {boolean} - True if it's a relative path, fragment, or query string
 */
function isRelativeUrl(value) {
	return RELATIVE_PATH_PATTERN.test(value);
}

/**
 * Check if the URL uses an allowed protocol
 *
 * @param {URL} url - The parsed URL object
 * @return {boolean} - True if the protocol is allowed
 */
function isAllowedProtocol(url) {
	return ALLOWED_PROTOCOLS.has(url.protocol.replace(':', '').toLowerCase());
}

/**
 * Validate if a URL is structurally valid and has a legitimate domain
 *
 * This function provides comprehensive URL validation for accessibility purposes:
 * - Validates against the Public Suffix List for real TLD verification
 * - Supports international domains, punycode, and complex TLDs (e.g., .co.uk)
 * - Allows development URLs (localhost, IP addresses)
 * - Rejects fake domains like "foo.notworking"
 *
 * @param {string} value - The URL string to validate
 * @return {boolean} - True if the URL is valid, false otherwise
 */
export function isValidUrl(value) {
	// Input validation: reject non-string values
	if (typeof value !== 'string') {
		return false;
	}

	const trimmedUrl = value.trim();
	if (!trimmedUrl) {
		return false;
	}

	// Fast path: Allow relative paths, fragments, and query strings
	// Examples: "/page", "#section", "?param=value"
	if (isRelativeUrl(trimmedUrl)) {
		return true;
	}

	// Parse the URL using the platform's URL constructor
	let parsedUrl;
	try {
		parsedUrl = new URL(trimmedUrl);
	} catch {
		// Invalid URL format (e.g., "example.com" without protocol)
		return false;
	}

	// Check if the protocol is allowed for accessibility
	if (!isAllowedProtocol(parsedUrl)) {
		return false;
	}

	// Non-host-based protocols (mailto, tel) don't need domain validation
	const protocol = parsedUrl.protocol.slice(0, -1).toLowerCase();
	if (protocol === 'mailto' || protocol === 'tel') {
		return true;
	}

	// For http/https URLs, validate the hostname
	const hostname = parsedUrl.hostname;

	// Parse hostname using tldts for Public Suffix List validation
	const domainInfo = parse(hostname);

	// Validate hostname structure
	// Must have either a valid domain, be an IP address, or be localhost
	if (!domainInfo.domain && !domainInfo.isIp && hostname.toLowerCase() !== 'localhost') {
		return false;
	}

	// Ensure the host has a registrable domain (not just a public suffix)
	// This prevents URLs like "https://co.uk/" from being valid
	const isSpecialHost =
		domainInfo.isIp ||
		hostname.toLowerCase() === 'localhost' ||
		hostname.endsWith('.localhost');

	if (!isSpecialHost && (!domainInfo.publicSuffix || !domainInfo.domain)) {
		return false;
	}

	return true;
}
