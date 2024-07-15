import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { blockInvalidation } from './helpers/blockInvalidation';
import './helpers/blockErrorComponent';
import { checkHeadingLevel } from './blockChecks/checkHeading';

// Import all block check script and pass into blockChecksArray
export const blockChecksArray = [ checkHeadingLevel ];

registerPlugin( 'block-validation', {
	render: blockInvalidation,
} );
