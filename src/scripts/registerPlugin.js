import { registerPlugin } from '@wordpress/plugins';
import { BlockInvalidation } from './helpers/blockInvalidation';
import './helpers/blockErrorComponent';

// Import block check functions
import { checkHeadingLevel } from './blockChecks/checkHeading';
import { checkTableHeaderRow } from './blockChecks/checkTable';

// Import all block check script and pass into blockChecksArray
export const blockChecksArray = [checkHeadingLevel, checkTableHeaderRow];

registerPlugin('block-validation', {
	render: BlockInvalidation,
});
