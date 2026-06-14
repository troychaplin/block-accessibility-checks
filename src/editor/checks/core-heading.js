import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

addFilter(
	'ba11yc.validateBlock',
	'block-accessibility-checks/headingValidation',
	(isValid, blockType, attributes, checkName, block) => {
		if (blockType !== 'core/heading') {
			return isValid;
		}

		if (checkName === 'check_heading_rank') {
			if (!block || !block.clientId) {
				return isValid;
			}
			return validateHeadingRank({ clientId: block.clientId, attributes });
		}

		return isValid;
	}
);

function validateHeadingRank(currentHeading) {
	const allBlocks = select('core/block-editor').getBlocks();
	const headingBlocks = getAllHeadingBlocks(allBlocks);

	if (headingBlocks.length === 0) {
		return true;
	}

	const headingLevels = headingBlocks.map(block => ({
		level: block.attributes.level || 2,
		clientId: block.clientId,
	}));

	const firstHeading = headingLevels[0];
	const isFirstHeading = firstHeading.clientId === currentHeading.clientId;

	if (isFirstHeading) {
		const level = firstHeading.level;
		if (level !== 1 && level !== 2) {
			return false;
		}
	}

	if (headingBlocks.length === 1) {
		return true;
	}

	const violations = findHeadingViolations(headingLevels);

	if (violations.length === 0) {
		return true;
	}

	return !violations.some(violation => violation.problematicClientId === currentHeading.clientId);
}

function findHeadingViolations(headingLevels) {
	const violations = [];
	for (let i = 1; i < headingLevels.length; i++) {
		const current = headingLevels[i].level;
		const previous = headingLevels[i - 1].level;
		if (current > previous + 1) {
			violations.push({ problematicClientId: headingLevels[i].clientId });
		}
	}
	return violations;
}

function getAllHeadingBlocks(blocks) {
	const headings = [];
	function search(list) {
		for (const block of list) {
			if (block.name === 'core/heading') {
				headings.push(block);
			}
			if (block.innerBlocks?.length) {
				search(block.innerBlocks);
			}
		}
	}
	search(blocks);
	return headings;
}
