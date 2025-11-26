# Add General Editor Validation System

This plan implements a new validation system for general editor state (e.g. block order, post type checks) that integrates with the existing post locking mechanism and settings page.

## 1. PHP Backend Implementation

-   **Create `Functions/EditorChecksRegistry.php`**
    -   Class `EditorChecksRegistry` (Singleton)
    -   Methods: `register_editor_check($post_type, $check_name, $args)`, `get_editor_checks($post_type)`, `get_effective_check_level(...)`
    -   Follows pattern of `MetaChecksRegistry` but keys by `post_type` -> `check_name`.

-   **Update `Functions/PluginInitializer.php`**
    -   Initialize `EditorChecksRegistry` service.
    -   Add `get_editor_checks_registry()` getter.
    -   Pass `editorValidationRules` to JS via `wp_localize_script` (in `ScriptsStyles` integration).

-   **Update `Functions/ScriptsStyles.php`**
    -   Inject `editorValidationRules` into `BlockAccessibilityChecks` global object.
    -   Add helper `prepare_editor_validation_rules_for_js`.

-   **Update `Functions/SettingsPage.php`**
    -   Add `register_editor_check_settings()` method.
    -   Add rendering logic for editor checks in the settings page (new section or integrated with plugins).

## 2. JavaScript Frontend Implementation

-   **Create `src/scripts/validation/validateEditor.js`**
    -   Export `validateEditor(blocks, postType)` function.
    -   Iterate over `window.BlockAccessibilityChecks.editorValidationRules[postType]`.
    -   Apply filter `ba11yc_validate_editor` for each check.
    -   Return validation result object.

-   **Create `src/scripts/validation/getInvalidEditorChecks.js`**
    -   Export hook `GetInvalidEditorChecks`.
    -   Select `blocks` and `postType`.
    -   Call `validateEditor` and return invalid checks.

-   **Update `src/scripts/validation/validationApi.js`**
    -   Import `GetInvalidEditorChecks`.
    -   Lock post if `invalidEditorChecks` has errors.

-   **Create `src/scripts/validation/EditorValidationDisplay.js`**
    -   Component using `PluginSidebar` (or `PluginDocumentSettingPanel`) to display validation errors.
    -   Only shows if there are errors/warnings.

-   **Update `src/scripts/registerPlugin.js`**
    -   Register `EditorValidationDisplay` component.

## 3. Integration Verification

-   Register a test check in a mock integration to verify locking and display works.

---

# AI Prompt

@Functions @src In this plugin I am adding an approach to adding validation to block attributes and post meta that leverage the same post locking functionality. The validations for block attributes are handled differently than post meta, but in the end they still use the same code for post locking and are very similar in their approach to integration.

Review the code and the @docs as well as an external block plugin demo @block-check-integration-example , which includes integrated validations on multiple custom blocks as well as post meta.

What I need is to add another approach to validation that allows external developers to build integrations that include checking the block order so the can validate what the first block is, or what the last block is, or anywhere in between. There may be other use cases for having a general way to add validations in unique ways in the block editor.

For example, what if I wanted to do something like "if post type is event get blocks and check if first block is named event-banner. Or multiple, so if post type is page then check first block which can be equal to hero-image, hero-text, or anything else I want to include in an array.

Let's review things and walk through other use cases. Let's make sure this is a catch all that fits into the same post locking setup that the block attribute and post meta validations use. Review all the code, docs, demo plugin, and my requirements and let me know if you have any questions that can be clarified before we make our plan.