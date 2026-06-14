/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { isCheckEnabled, createIssue, createValidationResult } from './issue-helpers';
import { getMetaValidationRules } from './get-validation-config';

/**
 * Validates a single meta field against a specific validation check.
 *
 * @param {string} postType  - The post type.
 * @param {string} metaKey   - The meta key to validate.
 * @param {*}      value     - The current meta field value to validate.
 * @param {string} checkName - The name of the specific check to run.
 * @return {boolean} True if validation passes, false if it fails.
 */
export function validateMetaField(postType, metaKey, value, checkName) {
	const rules = getMetaValidationRules()[postType]?.[metaKey]?.[checkName];

	if (!isCheckEnabled(rules)) {
		return true;
	}

	let isValid = true;

	if (checkName === 'required') {
		isValid = value !== '' && value !== null && value !== undefined;
	}

	/**
	 * Filter: ba11yc.validateMeta
	 *
	 * Allows external plugins to extend validation logic for meta fields.
	 */
	isValid = applyFilters('ba11yc.validateMeta', isValid, value, postType, metaKey, checkName);

	return isValid;
}

/**
 * Validates a meta field against all registered validation checks.
 *
 * @param {string} postType - The post type.
 * @param {string} metaKey  - The meta key to validate.
 * @param {*}      value    - The current meta field value to validate.
 * @return {Object} Validation result object.
 */
export function validateAllMetaChecks(postType, metaKey, value) {
	const allRules = getMetaValidationRules();
	const postTypeRules = allRules[postType] || {};
	const metaRules = postTypeRules[metaKey] || {};
	const issues = [];

	for (const [checkName, rule] of Object.entries(metaRules)) {
		if (!isCheckEnabled(rule)) {
			continue;
		}

		const isValid = validateMetaField(postType, metaKey, value, checkName);

		if (!isValid) {
			const issue = createIssue(rule, checkName, { metaKey });
			issues.push(issue);
		}
	}

	return createValidationResult(issues);
}
