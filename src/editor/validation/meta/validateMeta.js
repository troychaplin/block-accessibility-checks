/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	isCheckEnabled,
	createIssue,
	createValidationResult,
} from '../../../shared/utils/validation';

/**
 * Meta validation rules configuration from PHP
 *
 * Contains validation rules registered server-side for meta field validation.
 * Rules are organized by post type, then by meta key, then by check name.
 * These rules are exposed via the window object by PHP and define what
 * validation checks should run for each meta field.
 */
const metaValidationRules = window.BlockAccessibilityChecks?.metaValidationRules || {};

/**
 * Validates a single meta field against a specific validation check.
 *
 * Runs a single validation rule (e.g., 'required', 'min_length') for a meta field.
 * Supports built-in checks and allows external plugins to extend validation via
 * the 'ba11yc_validate_meta' filter hook. Returns true if validation passes.
 *
 * @param {string} postType  - The post type (e.g., 'post', 'page').
 * @param {string} metaKey   - The meta key to validate (e.g., '_wp_page_template').
 * @param {*}      value     - The current meta field value to validate.
 * @param {string} checkName - The name of the specific check to run (e.g., 'required').
 * @return {boolean} True if validation passes, false if it fails.
 */
export function validateMetaField(postType, metaKey, value, checkName) {
	// Look up the specific validation rule for this post type, meta key, and check
	const rules = metaValidationRules[postType]?.[metaKey]?.[checkName];

	// Return valid if rule doesn't exist or is disabled
	if (!isCheckEnabled(rules)) {
		return true;
	}

	let isValid = true;

	// Built-in validation: Check if required field has a value
	if (checkName === 'required') {
		isValid = value !== '' && value !== null && value !== undefined;
	}

	// Additional built-in check types can be added here as needed

	/**
	 * Filter: ba11yc_validate_meta
	 *
	 * Allows external plugins to modify or extend validation logic for meta fields.
	 * Plugins should return false if validation fails, true if it passes.
	 */
	isValid = applyFilters('ba11yc_validate_meta', isValid, value, postType, metaKey, checkName);

	return isValid;
}

/**
 * Validates a meta field against all registered validation checks.
 *
 * Runs all enabled validation rules for a specific meta field and collects
 * any issues found. This is the primary validation function used by meta field
 * hooks to determine validation state. Returns a comprehensive result object
 * with validation status, issues array, and error/warning flags.
 *
 * @param {string} postType - The post type (e.g., 'post', 'page').
 * @param {string} metaKey  - The meta key to validate (e.g., '_wp_page_template').
 * @param {*}      value    - The current meta field value to validate.
 * @return {Object} Validation result object containing:
 *   - isValid: Boolean indicating if all checks passed
 *   - issues: Array of validation issue objects
 *   - hasErrors: Boolean indicating if any errors exist
 *   - hasWarnings: Boolean indicating if any warnings exist
 */
export function validateAllMetaChecks(postType, metaKey, value) {
	// Get validation rules for this post type and meta key
	const postTypeRules = metaValidationRules[postType] || {};
	const metaRules = postTypeRules[metaKey] || {};
	const issues = [];

	// Run each registered validation check for this meta field
	for (const [checkName, rule] of Object.entries(metaRules)) {
		// Skip checks that have been explicitly disabled
		if (!isCheckEnabled(rule)) {
			continue;
		}

		// Validate against this specific check
		const isValid = validateMetaField(postType, metaKey, value, checkName);

		// Build issue object if validation failed
		if (!isValid) {
			// Create issue object with all relevant information
			const issue = createIssue(rule, checkName, { metaKey });
			// Ensure checkName is included (createIssue uses 'check' as primary key)
			issue.checkName = checkName;
			issues.push(issue);
		}
	}

	// Return comprehensive validation result
	return createValidationResult(issues);
}
