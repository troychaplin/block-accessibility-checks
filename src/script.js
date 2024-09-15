import './styles.scss';

// Block Modifications
import './scripts/blockMods/imageAttr';

// Block Checks
import './scripts/registerPlugin';

// Access the localized block checks options
document.addEventListener('DOMContentLoaded', function () {
	if (typeof BlockAccessibilityChecks !== 'undefined') {
		console.log(
			'Block Checks Options:',
			BlockAccessibilityChecks.blockChecksOptions
		);
	} else {
		console.error('BlockAccessibilityChecks is not defined.');
	}
});
