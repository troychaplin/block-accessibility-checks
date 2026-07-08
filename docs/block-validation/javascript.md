# Block Attributes Validation - JavaScript Integration

This guide explains how to implement block attribute validation logic in JavaScript using the Block Accessibility Checks Validation API.

## Overview

All validation logic is handled in JavaScript for real-time feedback in the block editor. PHP is used for configuration and registration, while JavaScript determines if a block passes or fails accessibility checks.

## Implementing Validation Logic

### Basic Validation

Use the `ba11yc.validateBlock` filter to add your validation logic:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName, rule) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        switch (checkName) {
            case 'content_length':
                const content = attributes.content || '';
                return content.length <= 500;
            default:
                return isValid;
        }
    }
);
```

### Filter Parameters

- **`isValid`** (boolean) - Current validation status (from previous filters)
- **`blockType`** (string) - The block type being validated (e.g., `'my-plugin/custom-block'`)
- **`attributes`** (object) - Block attributes from the editor
- **`checkName`** (string) - The check being run (e.g., `'content_length'`)
- **`rule`** (object) - The check configuration from PHP
- **`block`** (object) - The full block object (optional, last parameter)

### Return Value

Return `true` if the check passes, `false` if it fails. The validation system uses the `rule` object to determine the appropriate error/warning message and severity level.

## Accessing Validation Configuration

Check configurations are available via the editor settings object:

```javascript
import { select } from '@wordpress/data';

const { blockA11yChecks } = select( 'core/editor' ).getEditorSettings();
const myBlockChecks = blockA11yChecks?.block?.['my-plugin/custom-block'] || {};
const contentLengthRule = myBlockChecks['content_length'];

console.log(contentLengthRule.error_msg);   // Error message
console.log(contentLengthRule.warning_msg); // Warning message
console.log(contentLengthRule.level);       // 'error', 'warning', or 'none'
console.log(contentLengthRule.category);    // 'accessibility' or 'validation'
```

## Advanced Patterns

### Multiple Checks in One Filter

Handle multiple checks for the same block type in a single filter:

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }

        switch (checkName) {
            case 'required_field':
                return !!(attributes.requiredField && attributes.requiredField.trim());

            case 'content_length':
                const content = attributes.content || '';
                return content.length <= 500;

            case 'image_alt':
                return !!(attributes.imageAlt && attributes.imageAlt.trim());

            default:
                return isValid;
        }
    }
);
```

### Accessing Block Context

The full block object is available as the last parameter:

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/context-aware-validation',
    (isValid, blockType, attributes, checkName, rule, block) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }

        if (checkName === 'nested_content_check') {
            // Access inner blocks for complex validation
            const hasRequiredBlocks = block.innerBlocks?.some(
                innerBlock => innerBlock.name === 'core/heading'
            );
            return hasRequiredBlocks;
        }

        return isValid;
    }
);
```

### Custom Validation Results

For complex scenarios, you can return a result object instead of a boolean:

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/advanced-validation',
    (isValid, blockType, attributes, checkName, rule) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }

        if (checkName === 'complex_validation') {
            const issues = validateComplexRule(attributes, rule);

            if (issues.length > 0) {
                return {
                    isValid: false,
                    mode: 'error',
                    message: rule.error_msg,
                    data: { issues }
                };
            }
        }

        return isValid;
    }
);
```

**Note:** The standard pattern (returning `true`/`false`) is recommended for most use cases.

## Enqueuing Your Script

Your validation script must be loaded in the block editor. For better compatibility, conditionally add the dependency:

```php
function my_plugin_enqueue_accessibility_assets() {
    $asset_file = include plugin_dir_path( __FILE__ ) . 'build/a11y-checks.asset.php';

    // Start with base dependencies
    $dependencies = $asset_file['dependencies'];

    // Only add Block Accessibility Checks plugin as a dependency if it's active.
    // This allows your plugin to work even when the Block Accessibility Checks plugin is deactivated.
    if ( wp_script_is( 'block-accessibility-script', 'registered' ) ) {
        $dependencies[] = 'block-accessibility-script';
    }

    wp_enqueue_script(
        'my-plugin-accessibility-checks',
        plugins_url( 'build/a11y-checks.js', __FILE__ ),
        $dependencies,
        isset( $asset_file['version'] ) ? $asset_file['version'] : '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_accessibility_assets' );
```

**Important:** Include `'block-accessibility-script'` as a dependency (when available) to ensure the validation system is loaded first. If the plugin is not active, your script will still load but validation will not work.

## How Validation Works

1. **Registration** - PHP registers checks with configuration via `ba11yc_register_block_check()`
2. **Export** - Configuration is injected into the editor via `getEditorSettings().blockA11yChecks`
3. **Validation** - When blocks change, `validateBlock()` is called
4. **Filter Application** - The `ba11yc.validateBlock` filter is applied for each registered check
5. **Result Collection** - Validation results are collected and displayed in the editor via the Unified Sidebar and block indicators
6. **Post Locking** - If any checks resolve to level `'error'`, post saving is locked

## Best Practices

### Early Returns

Use early returns to avoid unnecessary processing:

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        // Early return for blocks we don't handle
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }

        // Early return for checks we don't handle
        if (checkName !== 'content_length') {
            return isValid;
        }

        // Validation logic here
        const content = attributes.content || '';
        return content.length <= 500;
    }
);
```

### Defensive Programming

Always check for undefined/null values:

```javascript
const content = attributes.content || '';
const altText = attributes.alt || '';
const url = attributes.url || '';
```

### Performance

- Keep validation logic simple and fast.
- Avoid expensive operations in validation filters.
- Cache results if needed for complex validations.

## Quick Reference

### Filter Hook

- **`ba11yc.validateBlock`** - Main validation filter for block attributes

### Filter Signature

```javascript
addFilter(
    'ba11yc.validateBlock',
    'namespace/unique-name',
    (isValid, blockType, attributes, checkName, rule, block) => {
        // Return true (valid) or false (invalid)
    }
);
```

## See Also

- [Quick Start Guide](./quick-start.md)
- [PHP Integration](./php.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)
