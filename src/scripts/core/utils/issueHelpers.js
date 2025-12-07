/**
 * Issue Helpers Utility Functions
 *
 * Shared utility functions for validation issue processing across block, editor,
 * and meta validation. These functions are config-source agnostic and work with
 * any validation config structure regardless of origin (PHP registry, block.json, etc.).
 */

/**
 * Filter issues by type (error, warning, etc.)
 *
 * @param {Array}  issues - Array of issue objects.
 * @param {string} type   - The issue type to filter by (e.g., 'error', 'warning').
 * @return {Array} Filtered array of issues matching the type.
 */
export const filterIssuesByType = (issues, type) => {
	return issues.filter(issue => issue.type === type);
};

/**
 * Check if any issues of a specific type exist
 *
 * @param {Array}  issues - Array of issue objects.
 * @param {string} type   - The issue type to check for (e.g., 'error', 'warning').
 * @return {boolean} True if any issues of the type exist, false otherwise.
 */
export const hasIssuesOfType = (issues, type) => {
	return issues.some(issue => issue.type === type);
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
	return hasIssuesOfType(issues, 'error');
};

/**
 * Check if any warnings exist
 *
 * @param {Array} issues - Array of issue objects.
 * @return {boolean} True if any warnings exist, false otherwise.
 */
export const hasWarnings = issues => {
	return hasIssuesOfType(issues, 'warning');
};

/**
 * Filter issues by category (accessibility, validation, etc.)
 *
 * @param {Array}  issues   - Array of issue objects.
 * @param {string} category - The category to filter by (e.g., 'accessibility', 'validation').
 * @return {Array} Filtered array of issues matching the category.
 */
export const filterIssuesByCategory = (issues, category) => {
	return issues.filter(issue => issue.category === category);
};

/**
 * Extract issue messages from config with proper fallbacks
 *
 * Handles message extraction with priority: type-specific message > generic message > default.
 * Works with config objects from any source (PHP, block.json, etc.).
 *
 * @param {Object} config         - Configuration object with message properties.
 * @param {string} defaultMessage - Default message to use if none provided.
 * @return {Object} Object containing message, error_msg, and warning_msg.
 */
export const extractIssueMessages = (config, defaultMessage = '') => {
	const message = config.message || defaultMessage;
	return {
		message,
		error_msg: config.error_msg || message,
		warning_msg: config.warning_msg || config.error_msg || message,
	};
};

/**
 * Get priority number based on issue type
 *
 * @param {string} type - The issue type ('error', 'warning', or other).
 * @return {number} Priority number (error=1, warning=2, other=3).
 */
export const getIssuePriority = type => {
	if (type === 'error') {
		return 1;
	}
	if (type === 'warning') {
		return 2;
	}
	return 3;
};

/**
 * Check if a validation rule is enabled
 *
 * Validates enabled status regardless of config source. Returns false if:
 * - Config is null/undefined
 * - enabled is explicitly false
 * Otherwise defaults to true (enabled).
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
	// Default to enabled if not explicitly disabled
	return true;
};

/**
 * Create a standardized issue object
 *
 * Factory function to create issue objects with consistent structure.
 * Works with config objects from any source (PHP, block.json, etc.).
 *
 * @param {Object} config           - Configuration object with validation rule properties.
 * @param {string} checkName        - The name of the check.
 * @param {Object} additionalFields - Additional fields to include in the issue object.
 * @return {Object} Standardized issue object.
 */
export const createIssue = (config, checkName, additionalFields = {}) => {
	const messages = extractIssueMessages(config);
	const type = config.type || 'error';
	const category = config.category || 'accessibility';
	const priority = getIssuePriority(type);

	return {
		check: checkName,
		checkName, // For compatibility with different naming conventions
		type,
		category,
		priority,
		...messages,
		...additionalFields,
	};
};

/**
 * Create a standardized validation result object
 *
 * Factory function to create validation result objects with consistent structure.
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
