// Register the plugin
import './editor/register';

// Validate blocks
import './editor/validation/blocks/validateBlock';
import './editor/hoc/withErrorHandling';

// Block Validators
import './editor/validation/blocks/validators/button';
import './editor/validation/blocks/validators/headingListener';
import './editor/validation/blocks/validators/heading';
import './editor/validation/blocks/validators/image';
import './editor/validation/blocks/validators/table';

// Editor Validation
import './editor/validation/editor/validateEditor';

// Editor Validators
import './editor/validation/editor/validators/postTitle';

// Block Modifications
import './editor/modifications/imageAttributes';

// Styles
import './styles.scss';

// Export meta validation components for external plugins
import { useMetaField } from './editor/validation/meta/hooks';

// Make available globally
if (typeof window.BlockAccessibilityChecks === 'undefined') {
	window.BlockAccessibilityChecks = {};
}

window.BlockAccessibilityChecks.useMetaField = useMetaField;
