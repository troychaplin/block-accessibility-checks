/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { ValidationAPI } from './validation/validationApi';
import './validation/blockErrorComponent';

// Base checks array - now empty since validation is handled via ba11yc_validate_block filter
const coreChecks = [];

// Cache for the filtered checks array to prevent repeated filter applications
let cachedChecksArray = null;
let cacheInvalidated = true;

// Function to invalidate the cache when new filters are added
function invalidateCache() {
	cacheInvalidated = true;
}

// Listen for when new filters are added
if (typeof wp !== 'undefined' && wp.hooks) {
	wp.hooks.addAction('hookAdded', 'blockAccessibilityChecks/invalidate-cache', hookName => {
		if (hookName === 'blockAccessibilityChecks.block-checksArray') {
			invalidateCache();
		}
	});
}

// Function to get current checks array (allows dynamic updates from external plugins)
export function getblockChecksArray() {
	if (cacheInvalidated || !cachedChecksArray) {
		cachedChecksArray = applyFilters('blockAccessibilityChecks.blockChecksArray', coreChecks);
		cacheInvalidated = false;
	}
	return cachedChecksArray;
}

// For backwards compatibility, expose the array but make it dynamic
export const blockChecksArray = new Proxy([], {
	get(target, prop) {
		const currentArray = getblockChecksArray();
		if (prop === 'length') {
			return currentArray.length;
		}
		if (typeof prop === 'string' && !isNaN(prop)) {
			return currentArray[parseInt(prop)];
		}
		if (typeof currentArray[prop] === 'function') {
			return currentArray[prop].bind(currentArray);
		}
		return currentArray[prop];
	},
});

registerPlugin('validation-api', {
	render: ValidationAPI,
});
