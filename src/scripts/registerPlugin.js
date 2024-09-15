import { registerPlugin } from '@wordpress/plugins';
import { BlockInvalidation } from './helpers/blockInvalidation';
import './helpers/blockErrorComponent';

// Import block check functions
// import { checkButtonAttributes } from './blockChecks/checkButton';
import { checkHeadingLevel } from './blockChecks/checkHeading';
// import { checkImageAlt } from './blockChecks/checkImage';
import { checkTableHeaderRow } from './blockChecks/checkTable';

export const blockChecksArray = [
	// checkButtonAttributes,
	checkHeadingLevel,
	// checkImageAlt,
	checkTableHeaderRow,
];

registerPlugin('block-validation', {
	render: BlockInvalidation,
});
