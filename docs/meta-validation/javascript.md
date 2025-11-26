# Post Meta Validation - JavaScript Integration

This guide explains how to implement post meta validation logic in JavaScript and use the provided UI components.

## Overview

All validation logic is handled in JavaScript for real-time feedback in the block editor. The plugin also provides UI components that automatically display validation errors and warnings next to meta fields.

## Implementing Validation Logic

### Basic Validation

To add custom validation logic beyond simple "required" checks, use the `ba11yc_validate_meta` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_meta',
    'my-plugin/meta-validation',
    ( isValid, value, postType, metaKey, checkName, rule ) => {
        if ( postType !== 'band' ) {
            return isValid;
        }

        switch ( metaKey ) {
            case 'band_origin':
                if ( checkName === 'required' ) {
                    // Custom logic: require at least city and country
                    const parts = value ? value.split( ',' ) : [];
                    return parts.length >= 2;
                }
                break;

            case 'band_start_date':
                if ( checkName === 'required' ) {
                    // Check if date is in valid format
                    return /^\d{4}-\d{2}-\d{2}$/.test( value );
                }
                break;
        }

        return isValid;
    }
);
```

### Filter Parameters

- **`isValid`** (boolean) - Current validation status (from previous filters)
- **`value`** (mixed) - The meta field value being validated
- **`postType`** (string) - The post type (e.g., `'band'`, `'post'`)
- **`metaKey`** (string) - The meta key being validated (e.g., `'band_origin'`)
- **`checkName`** (string) - The check being run (e.g., `'required'`)
- **`rule`** (object) - The check configuration from PHP

### Return Value

Return `true` if the check passes, `false` if it fails. The validation system will use the `rule` object to determine the appropriate error/warning message and severity level.

### Default Validation

If you don't add a JavaScript filter, the default `required` validation checks that the value:
- Is not empty
- Is not an empty string after trimming

## Accessing Validation Rules

All registered meta validation rules are exposed to JavaScript:

```javascript
const metaRules = window.BlockAccessibilityChecks?.metaValidationRules || {};
const bandRules = metaRules.band || {};
const originRules = bandRules.band_origin || {};
const requiredRule = originRules.required;

console.log(requiredRule.error_msg);   // Error message
console.log(requiredRule.warning_msg); // Warning message
console.log(requiredRule.type);        // 'error', 'warning', or 'none'
```

## UI Components

The plugin provides wrapper components to automatically display validation errors and warnings next to your meta fields.

### Script Dependencies

When using the validation components, ensure your script has the Block Accessibility Checks script as a dependency:

```php
// Add 'block-accessibility-script' as a dependency
$dependencies = array_merge(
    $asset_file['dependencies'],
    array( 'block-accessibility-script' )
);

wp_enqueue_script(
    'my-script-handle',
    plugins_url( 'build/my-script.js', __FILE__ ),
    $dependencies,
    $asset_file['version'],
    false
);
```

Then access the components with a defensive check:

```javascript
const { ValidatedToolsPanelItem, MetaField } = window.BlockAccessibilityChecks || {};
```

### Using MetaField Component

For any context (PluginDocumentSettingPanel, custom blocks, etc.), use the `MetaField` wrapper:

```javascript
import { __ } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { TextControl, SelectControl } from '@wordpress/components';

// Import the wrapper component
const { MetaField } = window.BlockAccessibilityChecks || {};

const MyMetaPanel = () => {
    const { meta } = useSelect(select => ({
        meta: select('core/editor').getEditedPostAttribute('meta') || {},
    }));
    
    const { editPost } = useDispatch('core/editor');
    
    return (
        <PluginDocumentSettingPanel name="my-meta" title="My Meta">
            <MetaField metaKey="band_origin">
                <TextControl
                    label={__('City of Origin')}
                    value={meta.band_origin || ''}
                    onChange={value => editPost({ meta: { band_origin: value } })}
                />
            </MetaField>
            
            <MetaField metaKey="band_genre">
                <SelectControl
                    label={__('Genre')}
                    value={meta.band_genre || ''}
                    onChange={value => editPost({ meta: { band_genre: value } })}
                    options={genreOptions}
                />
            </MetaField>
        </PluginDocumentSettingPanel>
    );
};
```

**Key points:**
- Works with any WordPress component (`TextControl`, `SelectControl`, `TextareaControl`, etc.)
- Simply wrap your control with `<MetaField metaKey="...">`
- No changes needed to your existing component code
- Validation appears automatically below the field

### Using ValidatedToolsPanelItem Component

If you're using `ToolsPanel` and `ToolsPanelItem`, simply replace `ToolsPanelItem` with `ValidatedToolsPanelItem`:

```javascript
import { __ } from '@wordpress/i18n';
import { PluginSidebar } from '@wordpress/editor';
import {
    TextControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

// Import the validated component with fallback
const { ValidatedToolsPanelItem } = window.BlockAccessibilityChecks || {};

const MyMetaSidebar = () => {
    const { meta } = useSelect(select => ({
        meta: select('core/editor').getEditedPostAttribute('meta') || {},
    }));
    
    const { editPost } = useDispatch('core/editor');
    const updateMeta = (key, value) => editPost({ meta: { [key]: value } });
    
    // Use ValidatedToolsPanelItem if available, otherwise fall back to standard
    const ToolsPanelItemComponent = ValidatedToolsPanelItem || ToolsPanelItem;
    
    return (
        <PluginSidebar name="my-meta" title="My Meta Fields">
            <ToolsPanel label="Band Information">
                <ToolsPanelItemComponent
                    metaKey="band_origin"
                    hasValue={() => meta.band_origin !== ''}
                    label="City of Origin"
                    onDeselect={() => updateMeta('band_origin', '')}
                    isShownByDefault
                >
                    <TextControl
                        label={__('City of Origin')}
                        value={meta.band_origin || ''}
                        onChange={value => updateMeta('band_origin', value)}
                    />
                </ToolsPanelItemComponent>
            </ToolsPanel>
        </PluginSidebar>
    );
};
```

**Key points:**
- Add the `metaKey` prop to specify which meta field to validate
- All other `ToolsPanelItem` props work exactly the same
- Validation messages appear automatically when the field fails validation
- Error/warning styling is applied automatically

### Validation Display Features

Both components provide:
- ✅ **Automatic validation** - No additional code needed
- ✅ **Error highlighting** - Red left border for errors
- ✅ **Warning highlighting** - Yellow left border for warnings
- ✅ **Inline messages** - Validation messages appear below the field
- ✅ **Real-time updates** - Validation updates as user types
- ✅ **Consistent styling** - Matches block validation styling

### Hiding Validation Messages

If you want to handle the display differently, you can hide the automatic messages:

```javascript
// For ValidatedToolsPanelItem
<ValidatedToolsPanelItem
    metaKey="band_origin"
    showValidationMessages={false}
    // ... other props
>

// For MetaField
<MetaField metaKey="band_origin" showMessages={false}>
```

## How Validation Works

1. **Registration** - PHP registers checks with configuration
2. **Export** - Configuration is exported to JavaScript via `wp_localize_script`
3. **Validation** - When meta fields change, `validateMetaField()` is called
4. **Filter Application** - The `ba11yc_validate_meta` filter is applied for each registered check
5. **UI Update** - Components automatically display validation results
6. **Post Locking** - If any checks fail with `type: 'error'`, post saving is locked

## Best Practices

### Defensive Component Access

Always check for component availability:

```javascript
const { MetaField, ValidatedToolsPanelItem } = window.BlockAccessibilityChecks || {};
if (!MetaField) {
    // Fallback to standard component
}
```

### Early Returns

Use early returns to avoid unnecessary processing:

```javascript
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/validation',
    (isValid, value, postType, metaKey, checkName) => {
        // Early return for post types we don't handle
        if (postType !== 'band') {
            return isValid;
        }
        
        // Early return for meta keys we don't handle
        if (metaKey !== 'band_origin') {
            return isValid;
        }
        
        // Validation logic here
        const parts = value ? value.split(',') : [];
        return parts.length >= 2;
    }
);
```

### Defensive Programming

Always check for undefined/null values:

```javascript
const value = meta.band_origin || '';
const trimmed = value.trim();
```

## Quick Reference

### Filter Hook

- **`ba11yc_validate_meta`** - Main validation filter for post meta

### Global Object

- **`window.BlockAccessibilityChecks.metaValidationRules`** - All registered meta checks

### Components

- **`MetaField`** - Generic wrapper component for any meta field
- **`ValidatedToolsPanelItem`** - Drop-in replacement for `ToolsPanelItem`

### Filter Signature

```javascript
addFilter(
    'ba11yc_validate_meta',
    'namespace/unique-name',
    (isValid, value, postType, metaKey, checkName, rule) => {
        // Return true (valid) or false (invalid)
    }
);
```

## See Also

- [Quick Start Guide](./quick-start.md)
- [PHP Integration](./php.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)

