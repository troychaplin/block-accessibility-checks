# Post Meta Validation - JavaScript Integration

This guide explains how to implement post meta validation logic in JavaScript.

## Overview

All validation logic is handled in JavaScript for real-time feedback in the block editor. The plugin provides a hook (`useMetaField`) that automatically handles data binding and validation display.

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

## UI Integration

The plugin provides a `useMetaField` hook to automatically handle state and validation display.

### Script Dependencies

When using the validation hook, you should conditionally add the Block Accessibility Checks script as a dependency to allow your plugin to work even when the Block Accessibility Checks plugin is deactivated:

```php
$asset_file = include plugin_dir_path( __FILE__ ) . 'build/my-script.asset.php';

// Start with base dependencies
$dependencies = $asset_file['dependencies'];

// Only add Block Accessibility Checks plugin as a dependency if it's active.
// This allows your sidebar/UI to work even when the plugin is deactivated.
if ( wp_script_is( 'block-accessibility-script', 'registered' ) ) {
    $dependencies[] = 'block-accessibility-script';
}

wp_enqueue_script(
    'my-script-handle',
    plugins_url( 'build/my-script.js', __FILE__ ),
    $dependencies,
    $asset_file['version'],
    false
);
```

**Note:** If the Block Accessibility Checks plugin is not active, validation will not work, but your UI components (like sidebars) will still function. The `useMetaField` hook includes a fallback that works without the plugin.

Then access the hook with a defensive check:

```javascript
const { useMetaField } = window.BlockAccessibilityChecks || {};
```

### Using `useMetaField` Hook

The `useMetaField` hook returns props that can be spread directly onto standard WordPress components like `TextControl`.

```javascript
import { __ } from '@wordpress/i18n';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { TextControl, SelectControl } from '@wordpress/components';

// Import the hook (or use the shim)
const { useMetaField } = window.BlockAccessibilityChecks || {};

const MyMetaPanel = () => {
    // 1. Get props for each field
    const originProps = useMetaField('band_origin', __('Enter the city of origin', 'text-domain'));
    const genreProps = useMetaField('band_genre', __('Select a genre', 'text-domain'));

    if (!originProps || !genreProps) return null; // Defensive check

    return (
        <PluginDocumentSettingPanel name="my-meta" title="My Meta">
             {/* 2. Spread props into components */}
            <TextControl
                label={__('City of Origin')}
                {...originProps}
            />
            
            <SelectControl
                label={__('Genre')}
                {...genreProps}
                options={genreOptions}
            />
        </PluginDocumentSettingPanel>
    );
};
```

**Key points:**
- Works with any WordPress component (`TextControl`, `SelectControl`, `TextareaControl`, etc.)
- Automatically handles `value` and `onChange`
- Automatically appends validation messages to the `help` text
- Applies validation classes (`ba11y-field`, `meta-field-error`, etc.)

### Customizing `onChange`

The hook provides a default `onChange` handler that saves the value to the post meta. You can extend or override this behavior.

#### Extending (Recommended)
Use this if you want to perform an additional action (like logging or updating another state) but **still want the value to be saved** to the database automatically.

```javascript
const originProps = useMetaField('band_origin');

<TextControl
    label="Origin City"
    {...originProps}
    // Define onChange AFTER spreading props
    onChange={(newValue) => {
        console.log('Value changed to:', newValue);

        // CRITICAL: Call the original handler to save the data!
        originProps.onChange(newValue);
    }}
/>
```

#### Overriding (Take Control)
Use this if you want to completely handle the saving logic yourself (e.g., validation before saving, or saving to a different store).

```javascript
const originProps = useMetaField('band_origin');

<TextControl
    label="Origin City"
    {...originProps}
    // This completely replaces the hook's saving logic
    onChange={(newValue) => {
        // The data will NOT be saved to post meta automatically anymore.
        // You must handle the save manually here.
        myCustomSaveFunction(newValue);
    }}
/>
```

## How Validation Works

1. **Registration** - PHP registers checks with configuration
2. **Export** - Configuration is exported to JavaScript via `wp_localize_script`
3. **Validation** - When meta fields change, `validateMetaField()` is called
4. **Filter Application** - The `ba11yc_validate_meta` filter is applied for each registered check
5. **UI Update** - The hook automatically updates props with validation results, and errors are also collected in the Unified Sidebar
6. **Post Locking** - If any checks fail with `type: 'error'`, post saving is locked

## Best Practices

### Defensive Access

Always check for hook availability:

```javascript
const { useMetaField } = window.BlockAccessibilityChecks || {};
if (!useMetaField) {
    // Fallback or use the shim helper provided in the integration guide
}
```

### Early Returns

Use early returns to avoid unnecessary processing in filters:

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

## Quick Reference

### Filter Hook

- **`ba11yc_validate_meta`** - Main validation filter for post meta

### Global Object

- **`window.BlockAccessibilityChecks.metaValidationRules`** - All registered meta checks
- **`window.BlockAccessibilityChecks.useMetaField`** - The main validation hook

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
