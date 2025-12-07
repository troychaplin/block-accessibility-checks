# Architecture

This document explains how the Block Accessibility Checks plugin works, how the three validation systems integrate, and the overall data flow.

## Overview

The Block Accessibility Checks plugin provides three validation systems that work together to provide comprehensive accessibility and content validation in the WordPress block editor:

1. **Block Attributes Validation** - Validates individual block attributes
2. **Post Meta Validation** - Validates WordPress post meta fields
3. **Editor Validation** - Validates the entire editor state

All three systems follow the same architectural pattern: **PHP for configuration, JavaScript for validation**.

## Core Architecture Pattern

### PHP Responsibilities

- **Registration** - Register validation checks with their configuration
- **Configuration** - Define error messages, severity levels, descriptions
- **Settings Integration** - Expose checks to admin settings UI
- **Data Export** - Pass configuration to JavaScript via `wp_localize_script`

### JavaScript Responsibilities

- **Validation Logic** - All validation logic runs in JavaScript
- **Real-Time Feedback** - Provide instant validation feedback in the editor
- **UI Display** - Show validation errors and warnings to users
- **Post Locking** - Prevent saving when required fields fail validation

## System Integration

### Plugin Initialization

The plugin initializes in this order:

1. **Heading Levels Service** - Initialized early (before `init` hook) to register block type filters
2. **Translations** - Load text domain
3. **Scripts & Styles** - Register assets
4. **Settings Page** - Initialize admin UI
5. **Block Checks Registry** - Initialize block attribute validation
6. **Editor Checks Registry** - Initialize editor validation
7. **Action Hooks** - Fire `ba11yc_ready` and `ba11yc_editor_checks_ready` for developer registration

### Registry Pattern

Each validation system uses a singleton registry pattern:

- `BlockChecksRegistry` - Manages block attribute checks
- `MetaChecksRegistry` - Manages post meta checks
- `EditorChecksRegistry` - Manages editor-wide checks

All registries:
- Store check configurations
- Provide registration/unregistration methods
- Calculate effective check levels (considering settings)
- Export data to JavaScript

### Data Flow to JavaScript

Configuration flows from PHP to JavaScript via `wp_localize_script`:

```php
wp_localize_script(
    'block-accessibility-script',
    'BlockAccessibilityChecks',
    array(
        'validationRules'       => $validation_rules,        // Block checks
        'metaValidationRules'    => $meta_validation_rules,  // Meta checks
        'editorValidationRules'  => $editor_validation_rules, // Editor checks
        'blockChecksOptions'    => $block_checks_options,    // Settings
    )
);
```

This creates a global `window.BlockAccessibilityChecks` object accessible to all JavaScript validation code.

## Validation Lifecycle

### 1. Registration Phase (PHP)

Developers register checks using action hooks:

```php
// Block checks
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-block/type', 'check_name', $args );
});

// Editor checks
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check( 'post', 'check_name', $args );
});

// Meta checks (via MetaValidation helper)
register_post_meta( 'post_type', 'meta_key', [
    'validate_callback' => MetaValidation::required( 'post_type', 'meta_key', $args ),
]);
```

### 2. Configuration Export (PHP)

During `enqueue_block_editor_assets`, registries export their configurations:

- Check names and configurations
- Effective severity levels (error/warning/none)
- Enabled/disabled status
- Error and warning messages

### 3. Validation Phase (JavaScript)

When blocks or meta fields change, JavaScript validation runs:

**Block Validation:**
```javascript
// Runs for each block
validateBlock(block) {
    // Iterate registered checks
    // Apply ba11yc_validate_block filter
    // Return validation result
}
```

**Meta Validation:**
```javascript
// Runs when meta field changes
validateMetaField(postType, metaKey, value, checkName) {
    // Apply ba11yc_validate_meta filter
    // Return validation result
}
```

**Editor Validation:**
```javascript
// Runs for entire editor state
validateEditor(blocks, postType) {
    // Iterate registered checks for post type
    // Apply ba11yc_validate_editor filter
    // Return validation result
}
```

### 4. UI Update Phase (JavaScript)

Validation results trigger UI updates:

- **Unified Sidebar** - Consolidates all block, meta, and editor issues in one place
- **Header Button** - Shows a badge count of total issues and toggles the sidebar
- **Block Indicators** - Small icon badges on blocks that show tooltips with issue details
- **Meta Validation** - Shows error/warning styling on meta fields (via `MetaField` component)

### 5. Post Locking Phase (JavaScript)

The `ValidationAPI` component monitors all validation results:

```javascript
// If any validation has errors, lock post saving
if (hasBlockErrors || hasMetaErrors || hasEditorErrors) {
    lockPostSaving();
    lockPostAutosaving();
    disablePublishSidebar();
}
```

## Settings Integration

### Settings Storage

Settings are stored in WordPress options:

- `block_checks_options` - Contains severity levels for all checks
- Structure: `[block_type][check_name]` or `[post_type][meta_key][check_name]` or `[post_type][check_name]`

### Effective Check Level

Each registry calculates the "effective" check level:

1. If check `type` is `'error'` or `'warning'` → Use that level
2. If check `type` is `'settings'` → Look up in `block_checks_options`
3. If not found in settings → Use default from check configuration

This allows:
- Hard-coded checks (always error/warning)
- Configurable checks (admin can change severity)
- Disabled checks (set to `'none'` in settings)

## Post Locking Mechanism

The plugin prevents saving when validation fails:

### What Gets Locked

- **Save Draft** button - Disabled
- **Publish** button - Disabled
- **Auto-save** - Disabled
- **Publish Sidebar** - Disabled

### When Locking Occurs

Post is locked when **any** of these have errors:

- Block attribute validation errors
- Post meta validation errors
- Editor validation errors

Warnings do not lock the post, but are displayed for user feedback.

## Component Architecture

### PHP Components

- **PluginInitializer** - Orchestrates plugin startup
- **BlockChecksRegistry** - Manages block checks
- **MetaChecksRegistry** - Manages meta checks
- **EditorChecksRegistry** - Manages editor checks
- **MetaValidation** - Helper class for meta validation
- **SettingsPage** - Admin settings UI
- **ScriptsStyles** - Asset management and data export

### JavaScript Components

- **validateBlocks.js** - Block validation logic
- **validateMeta.js** - Meta validation logic
- **validateEditor.js** - Editor validation logic
- **validationApi.js** - Coordinates all validation and post locking
- **ValidationSidebar.js** - Consolidates all validation issues
- **ValidationHeaderButton.js** - Header toolbar button with issue count
- **BlockIndicator.js** - Inline indicator for block validation issues
- **MetaField.js** - UI component for meta field validation display
- **ValidatedToolsPanelItem.js** - UI component for ToolsPanel validation
- **ValidationDisplay.js** - Generic validation display component

## Filter System

### PHP Filters

PHP filters modify check configuration during registration:

- `ba11yc_register_default_checks` - Control default check registration
- `ba11yc_should_register_check` - Prevent check registration
- `ba11yc_check_args` - Modify check arguments
- `ba11yc_validate_meta` - Server-side meta validation

### JavaScript Filters

JavaScript filters implement validation logic:

- `ba11yc_validate_block` - Block attribute validation
- `ba11yc_validate_meta` - Post meta validation
- `ba11yc_validate_editor` - Editor-wide validation

All validation logic is implemented via these filters, allowing external plugins to add their own validation.

## Best Practices

### Separation of Concerns

- **PHP** - Configuration only, no validation logic
- **JavaScript** - All validation logic, no configuration storage

### Performance

- Validation runs in real-time as user edits
- Only enabled checks are evaluated
- Validation results are cached per block/meta field

### Extensibility

- All systems use WordPress hooks for extensibility
- External plugins can register checks without modifying core
- Settings integration is automatic for `'settings'` type checks

## See Also

- [Block Attributes Validation](./block-validation/quick-start.md)
- [Post Meta Validation](./meta-validation/quick-start.md)
- [Editor Validation](./editor-validation/quick-start.md)
- [API Reference](./reference/api.md)
- [Hooks Reference](./reference/hooks.md)

