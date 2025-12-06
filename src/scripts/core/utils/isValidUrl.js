/**
 * URL Validation Helper
 *
 * Provides robust URL validation for accessibility checks using the tldts library
 * for real TLD validation against the Public Suffix List (PSL). This ensures that
 * URLs are not only syntactically correct but also have legitimate domain names.
 */

/**
 * External dependencies
 */
import { parse } from 'tldts';

/**
 * Pre-compiled regex pattern for detecting relative URLs
 *
 * Matches URLs starting with /, #, or ? which are valid relative paths,
 * fragment identifiers, or query strings that don't require domain validation.
 */
const RELATIVE_PATH_PATTERN = /^(\/|#|\?)/i;

/**
 * Set of allowed URL protocols for accessibility validation
 *
 * Restricts URLs to common web protocols to prevent security issues
 * and ensure links are accessible in standard browsers.
 */
const ALLOWED_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel']);

/**
 * Checks if a URL string is a valid relative path, fragment, or query string.
 *
 * Relative URLs don't require domain validation since they're resolved
 * relative to the current page. This includes paths (/about), fragments
 * (#section), and query strings (?param=value).
 *
 * @param {string} value - The URL string to check.
 * @return {boolean} True if the URL is relative, false otherwise.
 */
function isRelativeUrl(value) {
	return RELATIVE_PATH_PATTERN.test(value);
}

/**
 * Checks if a URL uses an allowed protocol.
 *
 * Validates that the URL protocol is in the allowed list to prevent
 * potentially dangerous protocols (like javascript:, data:, file:) from
 * being used in accessibility-checked links.
 *
 * @param {URL} url - The parsed URL object.
 * @return {boolean} True if the protocol is allowed, false otherwise.
 */
function isAllowedProtocol(url) {
	return ALLOWED_PROTOCOLS.has(url.protocol.replace(':', '').toLowerCase());
}

/**
 * Validates if a URL is structurally valid and has a legitimate domain.
 *
 * This function provides comprehensive URL validation for accessibility purposes:
 * - Validates against the Public Suffix List (PSL) for real TLD verification
 * - Supports international domains, punycode, and complex TLDs (e.g., .co.uk)
 * - Allows development URLs (localhost, IP addresses)
 * - Rejects fake or invalid domains like "foo.notworking"
 * - Supports relative URLs, mailto:, and tel: protocols
 *
 * @param {string} value - The URL string to validate.
 * @return {boolean} True if the URL is valid and safe for use, false otherwise.
 */
export function isValidUrl(value) {
	// Reject non-string values immediately
	if (typeof value !== 'string') {
		return false;
	}

	// Trim whitespace and reject empty strings
	const trimmedUrl = value.trim();
	if (!trimmedUrl) {
		return false;
	}

	// Fast path: Accept relative paths, fragments, and query strings
	// These don't need protocol or domain validation (e.g., "/page", "#section", "?param=value")
	if (isRelativeUrl(trimmedUrl)) {
		return true;
	}

	// Attempt to parse the URL using the browser's native URL constructor
	// This validates basic URL syntax and structure
	let parsedUrl;
	try {
		parsedUrl = new URL(trimmedUrl);
	} catch {
		// URL constructor throws for invalid formats (e.g., "example.com" missing protocol)
		return false;
	}

	// Verify the protocol is in the allowed list (http, https, mailto, tel)
	// This prevents dangerous protocols like javascript:, data:, or file:
	if (!isAllowedProtocol(parsedUrl)) {
		return false;
	}

	// Non-host-based protocols don't require domain validation
	// mailto: and tel: links are valid with just properly formatted addresses/numbers
	const protocol = parsedUrl.protocol.slice(0, -1).toLowerCase();
	if (protocol === 'mailto' || protocol === 'tel') {
		return true;
	}

	// For http/https URLs, extract and validate the hostname
	const hostname = parsedUrl.hostname;

	// Parse hostname using tldts library for Public Suffix List (PSL) validation
	// This checks if the TLD is real (e.g., .com is valid, .notworking is not)
	const domainInfo = parse(hostname);

	// Validate that the hostname has a recognizable structure
	// Accept: valid domains, IP addresses, or localhost
	// Reject: invalid or non-existent TLDs
	if (!domainInfo.domain && !domainInfo.isIp && hostname.toLowerCase() !== 'localhost') {
		return false;
	}

	// Ensure the hostname has a registrable domain, not just a public suffix
	// This prevents bare TLD URLs like "https://co.uk/" from being considered valid
	const isSpecialHost =
		domainInfo.isIp ||
		hostname.toLowerCase() === 'localhost' ||
		hostname.endsWith('.localhost');

	// For non-special hosts, require both a public suffix and a domain name
	if (!isSpecialHost && (!domainInfo.publicSuffix || !domainInfo.domain)) {
		return false;
	}

	// All validation checks passed
	return true;
}
