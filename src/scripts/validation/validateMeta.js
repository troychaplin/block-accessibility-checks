/**
 * Meta Validation Hook System
 *
 * Provides validation functions for post meta fields that integrate
 * with the WordPress block editor.
 */

/**
 * Get meta check configuration from PHP
 */
const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};

/**
 * Validate post meta value
 *
 * @param {string} postType  - Current post type
 * @param {string} metaKey   - Meta key being validated
 * @param {*}      value     - Meta value
 * @param {string} checkName - Check name
 * @return {boolean} True if valid
 */
export function validateMetaField(postType, metaKey, value, checkName) {
	const postTypeRules = metaValidationRules[postType];
	if (!postTypeRules) {
		return true;
	}

	const metaRules = postTypeRules[metaKey];
	if (!metaRules) {
		return true;
	}

	const rule = metaRules[checkName];
	if (!rule || !rule.enabled) {
		return true;
	}

	// Allow plugins to implement validation logic
	const isValid = wp.hooks.applyFilters(
		'ba11yc_validate_meta',
		true,
		value,
		postType,
		metaKey,
		checkName,
		rule
	);

	return isValid;
}

/**
 * Validate all checks for a meta field
 *
 * @param {string} postType - Current post type
 * @param {string} metaKey  - Meta key
 * @param {*}      value    - Meta value
 * @return {Object} Validation result with issues
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
