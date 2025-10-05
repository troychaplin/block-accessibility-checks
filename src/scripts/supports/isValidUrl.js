/**
 * URL Validation Helper
 *
 * Provides reusable URL validation functionality for accessibility checks.
 * Based on WordPress core URL validation patterns.
 */

// Pre-compiled regex patterns for better performance
const RELATIVE_PATH_PATTERN = /^(\/|#|\?)/; // Matches relative paths, fragments, and query strings
const PROTOCOL_PATTERN = /^(mailto:|tel:)/; // Matches email and phone protocols
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i; // WordPress core URL validation pattern
const IP_ADDRESS_PATTERN = /^\d+\.\d+\.\d+\.\d+/; // Matches IPv4 addresses

/**
 * Check if a URL is valid according to WordPress standards
 *
 * Allow URLs including:
 * - http://example.com/
 * - https://example.com/
 * - /directory/
 * - ?query-param
 * - #target
 * - mailto:foo@example.com
 * - tel:+1234567890
 *
 * Based on WordPress core validation pattern from nav-menu.js line 1138: https://github.com/WordPress/wordpress-develop/blob/70d00508e950f0e63de82386d453bca5ad899474/src/js/_enqueues/lib/nav-menu.js#L1126
 * /^https?:\/\/[^\s/$.?#].[^\s]*$/i
 *
 * @param {string} url - The URL to validate
 * @return {boolean} - True if valid, false if invalid
 */
export function isValidUrl(url) {
	// Input validation: reject null, undefined, or non-string values
	if (!url || typeof url !== 'string') {
		return false;
	}

	// Normalize input by trimming whitespace
	const trimmedUrl = url.trim();
	if (!trimmedUrl) {
		return false;
	}

	// Allow relative paths, fragments, and query strings without validation
	// Examples: "/page", "#section", "?param=value"
	if (RELATIVE_PATH_PATTERN.test(trimmedUrl)) {
		return true;
	}

	// Allow email and phone protocols without domain validation
	// Examples: "mailto:user@example.com", "tel:+1234567890"
	if (PROTOCOL_PATTERN.test(trimmedUrl)) {
		return true;
	}

	// Apply WordPress core URL validation pattern for http/https URLs
	// This ensures basic URL structure is valid
	if (!URL_PATTERN.test(trimmedUrl)) {
		return false;
	}

	// Extract domain for additional accessibility-specific validation
	// Remove protocol prefix to get just the domain part
	const domain = trimmedUrl.replace(/^https?:\/\//, '');

	// Reject domains that are too short to be valid
	// Minimum 4 characters accounts for shortest valid domains like "a.co"
	if (domain.length < 4) {
		return false;
	}

	// Validate domain structure based on whether it contains dots
	if (domain.includes('.')) {
		// Domains with dots should have proper structure (e.g., "example.com")
		const parts = domain.split('.');

		// Ensure no empty parts (prevents "example..com" or ".example.com")
		for (let i = 0; i < parts.length; i++) {
			if (parts[i].length === 0) {
				return false;
			}
		}

		// Top-level domain (TLD) must be at least 2 characters
		// Examples: ".com", ".org", ".uk" are valid; ".a" is not
		if (parts[parts.length - 1].length < 2) {
			return false;
		}
	} else if (!domain.startsWith('localhost') && !IP_ADDRESS_PATTERN.test(domain)) {
		// Domains without dots must be localhost or IP addresses
		// Reject invalid domains like "test" or "invalid"
		return false;
	}

	// All validation checks passed
	return true;
}
