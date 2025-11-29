// Register the plugin
import './scripts/registerPlugin';

// Validate blocks
import './scripts/validation/validateBlocks';
import './scripts/validation/blockErrorComponent';

// Block Checks
import './scripts/block-checks/buttonValidation';
import './scripts/block-checks/headingRankListener';
import './scripts/block-checks/headingRankValidation';
import './scripts/block-checks/imageValidation';
import './scripts/block-checks/tableValidation';

// Block Modifications
import './scripts/block-modifications/imageAttributes';

// Styles
import './styles.scss';

// Export meta validation components for external plugins
import { useMetaField } from './scripts/validation/useMetaField';

// Make available globally
if (typeof window.BlockAccessibilityChecks === 'undefined') {
	window.BlockAccessibilityChecks = {};
}

window.BlockAccessibilityChecks.useMetaField = useMetaField;
// Alias for backwards compatibility during refactor
window.BlockAccessibilityChecks.useMetaValidationProps = useMetaField;
