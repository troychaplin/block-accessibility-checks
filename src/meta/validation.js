/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
// Assuming metaValidationRules is available globally or imported from a config
const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};

/**
 * Validates a single meta field against a specific check
 *
 * @param {string} postType  Post type
 * @param {string} metaKey   Meta key
 * @param {*}      value     Meta value
 * @param {string} checkName Check name
 * @return {boolean} True if valid, false otherwise
 */
export function validateMetaField(postType, metaKey, value, checkName) {
	const rules = metaValidationRules[postType]?.[metaKey]?.[checkName];

	if (!rules || !rules.enabled) {
		return true;
	}

	let isValid = true;

	// Required check
	if (checkName === 'required') {
		isValid = value !== '' && value !== null && value !== undefined;
	}

	// Add other check types here as needed

	// Allow external plugins to modify validation result
	isValid = applyFilters('ba11yc_validate_meta', isValid, value, postType, metaKey, checkName);

	return isValid;
}

/**
 * Validates a meta field against all applicable checks
 *
 * @param {string} postType Post type
 * @param {string} metaKey  Meta key
 * @param {*}      value    Meta value
 * @return {Object} Validation result object
 */
export function validateAllMetaChecks(postType, metaKey, value) {
	const postTypeRules = metaValidationRules[postType] || {};
	const metaRules = postTypeRules[metaKey] || {};
	const issues = [];

	for (const [checkName, rule] of Object.entries(metaRules)) {
		if (!rule.enabled) {
			continue;
		}

		const isValid = validateMetaField(postType, metaKey, value, checkName);

		if (!isValid) {
			// Use the correct message field from the PHP config
			const message =
				rule.type === 'error'
					? rule.error_msg || rule.message
					: rule.warning_msg || rule.message;

			issues.push({
				metaKey,
				checkName,
				type: rule.type,
				message, // Ensure 'message' is populated for useMetaField
				error_msg: rule.error_msg || rule.message,
				warning_msg: rule.warning_msg || rule.message,
				priority: rule.type === 'error' ? 1 : 2,
			});
		}
	}

	return {
		isValid: issues.length === 0,
		issues,
		hasErrors: issues.some(issue => issue.type === 'error'),
		hasWarnings: issues.some(issue => issue.type === 'warning'),
	};
}
