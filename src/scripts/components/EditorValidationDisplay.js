/**
 * WordPress dependencies
 */
// PluginDocumentSettingPanel removed - validation now shown in UnifiedValidationSidebar
// Keeping component for backwards compatibility but it no longer renders anything

/**
 * Component to display editor validation errors.
 *
 * @deprecated This component no longer renders anything. Editor validation
 * is now displayed in the UnifiedValidationSidebar. This component is kept
 * for backwards compatibility.
 */
export function EditorValidationDisplay() {
	// No longer rendering PluginDocumentSettingPanel
	// All validation issues are now consolidated in UnifiedValidationSidebar
	return null;
}
