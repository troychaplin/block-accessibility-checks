import { addFilter } from '@wordpress/hooks';

addFilter(
	'ba11yc.validateBlock',
	'block-accessibility-checks/tableValidation',
	(isValid, blockType, attributes, checkName) => {
		if (blockType !== 'core/table') {
			return isValid;
		}

		switch (checkName) {
			case 'check_table_headers':
				return validateTableHeaders(attributes);
			default:
				return isValid;
		}
	}
);

function validateTableHeaders(attributes) {
	if (!attributes.body || !Array.isArray(attributes.body) || attributes.body.length === 0) {
		return true;
	}

	const firstRow = attributes.body[0];
	if (!firstRow || !Array.isArray(firstRow.cells)) {
		return true;
	}

	const hasHeaderSection = !!(
		attributes.head &&
		Array.isArray(attributes.head) &&
		attributes.head.length > 0
	);
	const hasHeaderCells = firstRow.cells.some(cell => cell.tag === 'th');

	return hasHeaderSection || hasHeaderCells;
}
