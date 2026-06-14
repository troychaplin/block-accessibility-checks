/**
 * Issue Helpers Utility Functions
 *
 * Shared utility functions for validation issue processing across block, editor,
 * and meta validation. Config-source agnostic.
 */

/**
 * Filter issues by type (error, warning, etc.)
 *
 * @param {Array}  issues - Array of issue objects.
 * @param {string} type   - The issue type to filter by.
 * @return {Array} Filtered array of issues matching the type.
 */
export const filterIssuesByType = (issues, type) => {
	return issues.filter(issue => issue.type === type);
};

/**
 * Get all error issues
 *
 * @param {Array} issues - Array of issue objects.
 * @return {Array} Array of error issues.
 */
export const getErrors = issues => {
	return filterIssuesByType(issues, 'error');
};

/**
 * Get all warning issues
 *
 * @param {Array} issues - Array of issue objects.
 * @return {Array} Array of warning issues.
 */
export const getWarnings = issues => {
	return filterIssuesByType(issues, 'warning');
};

/**
 * Check if any errors exist
 *
 * @param {Array} issues - Array of issue objects.
 * @return {boolean} True if any errors exist, false otherwise.
 */
export const hasErrors = issues => {
	return issues.some(issue => issue.type === 'error');
};

/**
 * Check if any warnings exist
 *
 * @param {Array} issues - Array of issue objects.
 * @return {boolean} True if any warnings exist, false otherwise.
 */
export const hasWarnings = issues => {
	return issues.some(issue => issue.type === 'warning');
};

/**
 * Check if a validation rule is enabled.
 *
 * @param {Object} config - Configuration object with enabled property.
 * @return {boolean} True if check is enabled, false otherwise.
 */
export const isCheckEnabled = config => {
	if (config === null || config === undefined) {
		return false;
	}
	if (config.enabled === false) {
		return false;
	}
	return true;
};

/**
 * Create a standardized issue object.
 *
 * @param {Object} config           - Configuration object with validation rule properties.
 * @param {string} checkName        - The name of the check.
 * @param {Object} additionalFields - Additional fields to include in the issue object.
 * @return {Object} Standardized issue object.
 */
export const createIssue = (config, checkName, additionalFields = {}) => {
	const message = config.message || '';
	const errorMsg = config.error_msg || message;
	const warningMsg = config.warning_msg || config.error_msg || message;

	const type = config.level || 'error';

	let priority;
	if (type === 'error') {
		priority = 1;
	} else if (type === 'warning') {
		priority = 2;
	} else {
		priority = 3;
	}

	return {
		check: checkName,
		checkName,
		type,
		priority,
		message,
		errorMsg,
		warningMsg,
		...additionalFields,
	};
};

/**
 * Create a standardized validation result object.
 *
 * @param {Array}  issues           - Array of validation issue objects.
 * @param {Object} additionalFields - Additional fields to include in the result object.
 * @return {Object} Standardized validation result object.
 */
export const createValidationResult = (issues, additionalFields = {}) => {
	return {
		isValid: issues.length === 0,
		issues,
		hasErrors: hasErrors(issues),
		hasWarnings: hasWarnings(issues),
		...additionalFields,
	};
};
