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
	hasErrors,
	hasWarnings,
	createValidationResult,
} from './issue-helpers';
import { getValidationRules } from './get-validation-config';
import { blockTypeMayRenderHeading } from './heading-outline';

/**
 * Validates a block against all PHP-registered checks.
 *
 * Checks are registered server-side via PHP and exposed through editor settings.
 * External plugins provide validation logic via the `ba11yc.validateBlock` JS filter.
 *
 * @param {Object} block - The block object containing name, attributes, clientId, etc.
 * @return {Object} Validation result with isValid, issues, mode, clientId, and name.
 */
export const validateBlock = block => {
	const blockType = block.name;
	const attributes = block.attributes;
	const issues = [];

	const rules = getValidationRules();
	const checks = { ...(rules[blockType] || {}) };

	// Heading order applies to anything that renders a heading, which is not
	// known from the block type alone. Rather than registering the check
	// against every such block type, borrow core/heading's rule: severity,
	// messages, and the single settings row then stay in one place, and the
	// check inherits core/heading's site editor gating for free.
	if (!checks.check_heading_rank && blockTypeMayRenderHeading(blockType)) {
		const headingRule = rules['core/heading']?.check_heading_rank;

		if (headingRule) {
			checks.check_heading_rank = headingRule;
		}
	}

	if (Object.keys(checks).length === 0) {
		return {
			isValid: true,
			issues: [],
			mode: 'none',
			clientId: block.clientId,
			name: blockType,
		};
	}

	Object.entries(checks).forEach(([checkName, checkConfig]) => {
		if (!isCheckEnabled(checkConfig)) {
			return;
		}

		let isValid = true;

		if (typeof checkConfig.validator === 'function') {
			isValid = checkConfig.validator(attributes, block);
		}

		/**
		 * Filter: ba11yc.validateBlock
		 *
		 * Primary extension point for block validation logic. External plugins
		 * hook here to implement their check logic and return true (valid) or
		 * false (invalid).
		 */
		isValid = applyFilters(
			'ba11yc.validateBlock',
			isValid,
			blockType,
			attributes,
			checkName,
			block
		);

		if (!isValid) {
			issues.push(createIssue(checkConfig, checkName));
		}
	});

	let mode = 'none';
	if (hasErrors(issues)) {
		mode = 'error';
	} else if (hasWarnings(issues)) {
		mode = 'warning';
	}

	return createValidationResult(issues, {
		mode,
		clientId: block.clientId,
		name: blockType,
	});
};
