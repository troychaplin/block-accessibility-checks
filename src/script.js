// Register the plugin
import './core/register';

// Validate blocks
import './block/validation';
import './block/components/ErrorComponent';

// Block Checks
import './block/checks/buttonValidation';
import './block/checks/headingRankListener';
import './block/checks/headingRankValidation';
import './block/checks/imageValidation';
import './block/checks/tableValidation';

// Block Modifications
import './block/modifications/imageAttributes';

// Styles
import './styles.scss';

// Export meta validation components for external plugins
import { useMetaField } from './meta/hooks/useMetaField';

// Make available globally
if (typeof window.BlockAccessibilityChecks === 'undefined') {
	window.BlockAccessibilityChecks = {};
}

window.BlockAccessibilityChecks.useMetaField = useMetaField;
// Alias for backwards compatibility during refactor
window.BlockAccessibilityChecks.useMetaValidationProps = useMetaField;
