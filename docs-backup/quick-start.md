
# Quick Start: Block Accessibility Checks Validation API

This guide provides a fast path for developers to register custom accessibility checks, implement validation logic, and properly enqueue assets using the Block Accessibility Checks Validation API. For a complete working example, see the [block-check-integration-example](https://github.com/troychaplin/block-check-integration-example).

## Overview

To add custom accessibility checks for your blocks, you must:
1. Register the check and its configuration in PHP.
2. Implement the validation logic in JavaScript.
3. Enqueue your JavaScript validation script in the block editor.

## 1. Register a Check in PHP

Use the `ba11yc_ready` action to register your check with the registry (recommended for plugin compatibility):

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
    $registry->register_check(
        'my-plugin/custom-block', // Block type
        'content_length',         // Check name
        array(
            'error_msg'   => __( 'Content is too long for optimal readability', 'my-plugin' ),
            'warning_msg' => __( 'Content is long but still allowed (warning)', 'my-plugin' ),
            'description' => __( 'Long content can be difficult to read', 'my-plugin' ),
            'type'        => 'settings', // 'error', 'warning', or 'settings'
            'category'    => 'validation', // 'accessibility' or 'validation'
            'priority'    => 10,
        )
    );
}
```

## 2. Implement Validation in JavaScript

All validation logic runs in JavaScript for real-time feedback. Use the `ba11yc_validate_block` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
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

## 3. Enqueue Your JavaScript Validation Script

Your validation logic must be loaded in the block editor. Enqueue your script with the correct dependencies:

```php
function my_plugin_enqueue_accessibility_assets() {
    wp_enqueue_script(
        'my-plugin-accessibility-checks',
        plugins_url( 'path_to_file/a11y-checks.js', __FILE__ ),
        array( 'wp-hooks', 'wp-i18n', 'block-accessibility-script' ),
        '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_accessibility_assets' );
```

## Next Steps
- See [API Reference](./api-reference.md) for registry methods and configuration options.
- See [JavaScript Integration](./js-integration.md) for advanced validation patterns.
- See [External Integration](./external-integration.md) for integrating with other plugins or custom blocks.
