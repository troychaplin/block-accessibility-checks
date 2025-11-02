// Register the plugin
import './scripts/registerPlugin';

// Validate blocks
import './scripts/validation/validateBlocks';

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
import { MetaField } from './scripts/validation/MetaField';
import { ValidatedToolsPanelItem } from './scripts/validation/ValidatedToolsPanelItem';

// Make available globally
if (typeof window.BlockAccessibilityChecks === 'undefined') {
	window.BlockAccessibilityChecks = {};
}

window.BlockAccessibilityChecks.MetaField = MetaField;
window.BlockAccessibilityChecks.ValidatedToolsPanelItem = ValidatedToolsPanelItem;
