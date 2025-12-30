// Register the plugin
import './scripts/core/register';

// Validate blocks
import './scripts/block/validation';
import './scripts/block/components/ErrorComponent';

// Block Checks
import './scripts/block/checks/buttonValidation';
import './scripts/block/checks/headingRankListener';
import './scripts/block/checks/headingRankValidation';
import './scripts/block/checks/imageValidation';
import './scripts/block/checks/tableValidation';

// Validate editor
import './scripts/editor/validation';

// Editor Checks
import './scripts/editor/checks/postTitleValidation';

// Block Modifications
import './scripts/block/modifications/imageAttributes';

// Styles
import './styles.scss';

// Export meta validation components for external plugins
import { useMetaField } from './scripts/meta/hooks/useMetaField';

// Make available globally
if (typeof window.BlockAccessibilityChecks === 'undefined') {
	window.BlockAccessibilityChecks = {};
}

window.BlockAccessibilityChecks.useMetaField = useMetaField;
