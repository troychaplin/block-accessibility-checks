/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

/**
 * Retrieves the validation configuration from editor settings.
 *
 * Configuration is injected by PHP via the `block_editor_settings_all` filter
 * and is available through the `core/editor` store's editor settings.
 *
 * @return {Object} The blockA11yChecks settings object, or empty object if unavailable.
 */
function getConfig() {
	try {
		const settings = select('core/editor').getEditorSettings();
		return settings?.blockA11yChecks || {};
	} catch {
		return {};
	}
}

/**
 * Get block validation rules, organized by block type.
 *
 * @return {Object} Validation rules keyed by block type name.
 */
export function getValidationRules() {
	return getConfig().validationRules || {};
}

/**
 * Get meta field validation rules, organized by post type then meta key.
 *
 * @return {Object} Meta validation rules keyed by post type, then meta key.
 */
export function getMetaValidationRules() {
	return getConfig().metaValidationRules || {};
}

/**
 * Get editor-level validation rules, organized by post type.
 *
 * @return {Object} Editor validation rules keyed by post type.
 */
export function getEditorValidationRules() {
	return getConfig().editorValidationRules || {};
}

/**
 * Get the current editor context.
 *
 * @return {string} One of: 'post-editor', 'post-editor-template', 'site-editor', 'none'.
 */
export function getEditorContext() {
	return getConfig().editorContext || 'none';
}

/**
 * Get the list of block types that have registered validation checks.
 *
 * @return {Array} Array of block type names with registered checks.
 */
export function getRegisteredBlockTypes() {
	return getConfig().registeredBlockTypes || [];
}

/**
 * Get the heading sources map, keyed by block type.
 *
 * Describes how to resolve the heading level each block type renders. See
 * heading-outline.js for how a spec is applied to a block's attributes.
 *
 * @return {Object} Heading specs keyed by block type name.
 */
export function getHeadingSources() {
	return getConfig().headingSources || {};
}
