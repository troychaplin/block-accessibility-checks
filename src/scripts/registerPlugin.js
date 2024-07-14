import { registerPlugin } from '@wordpress/plugins'
import { blockInvalidation } from './helpers/blockInvalidation'

// Import all block check script and pass into blockChecksArray
import { checkHeadingLevel } from './blockChecks/checkHeading'

export const blockChecksArray = [checkHeadingLevel]

registerPlugin('block-validation', {
  render: blockInvalidation,
})
