/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getHeadingViolations } from '../utils/heading-outline';

/**
 * Heading order validation.
 *
 * Unlike the other bundled checks, this one is not tied to a single block type:
 * anything that renders a heading takes part in the document outline, and any
 * of them can be the block that skips a level. The check is therefore keyed on
 * the check name rather than the block name.
 *
 * The outline is built at most once per editor change and cached, so this is a
 * set lookup for every block after the first.
 */
addFilter(
	'ba11yc.validateBlock',
	'block-accessibility-checks/headingRank',
	(isValid, blockType, attributes, checkName, block) => {
		if (checkName !== 'check_heading_rank') {
			return isValid;
		}

		if (!block?.clientId) {
			return isValid;
		}

		return !getHeadingViolations(select).has(block.clientId);
	}
);
