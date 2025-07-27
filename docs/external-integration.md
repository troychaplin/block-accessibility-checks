# External Plugin Integration: Block Accessibility Checks

This guide explains how to integrate external plugins and custom blocks with the Block Accessibility Checks developer API, enabling dedicated accessibility validation and settings for your blocks.

## Overview

External plugins can register their own accessibility checks for custom blocks. The Block Accessibility Checks API automatically creates a dedicated settings page for your plugin, allowing site admins to configure validation levels and enable/disable checks.

## Automatic Settings Integration

Checks registered with `'type' => 'settings'` will:
- Appear in a dedicated submenu under the Block Accessibility Checks menu, named after your plugin or block namespace
- Allow site admins to set each check to Error, Warning, or Disabled
- Integrate with the block editor for real-time feedback


## Example: Registering Checks for a Custom Block

This example shows how to register accessibility checks for a custom block in your external plugin. The first check (`content_required`) will appear in your plugin's settings page and can be configured by site admins. The second check (`link_required`) is always treated as an error and does not appear in the settings page.

```php
add_action('ba11yc_ready', 'my_plugin_register_checks');

function my_plugin_register_checks($registry) {
    // This check will appear in your plugin's settings page
    $registry->register_check('my-plugin/card-block', 'content_required', [
        'error_msg'   => __('Card content is required.', 'my-plugin'),
        'warning_msg' => __('Card content is recommended.', 'my-plugin'),
        'description' => __('Content validation for card blocks.', 'my-plugin'),
        'type'        => 'settings', // Appears in admin settings
    ]);

    // This check is forced as an error (bypasses settings)
    $registry->register_check('my-plugin/card-block', 'link_required', [
        'error_msg'   => __('Card link is required.', 'my-plugin'),
        'description' => __('Link validation for card blocks.', 'my-plugin'),
        'type'        => 'error', // Always an error, no settings control
    ]);
}
```


## Example: JavaScript Validation for External Blocks

This example demonstrates how to implement validation logic for your custom block in JavaScript. The filter checks the block type and then runs the appropriate validation for each registered check.

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/card-block') {
            return isValid;
        }
        switch (checkName) {
            case 'content_required':
                return !!(attributes.content && attributes.content.trim());
            case 'link_required':
                return !!(attributes.link && attributes.link.trim());
            default:
                return isValid;
        }
    }
);
```


## Asset Enqueuing

This example shows how to enqueue your JavaScript validation script in the block editor. The script should be loaded with the correct dependencies to ensure it runs after the Block Accessibility Checks core script.

```php
function my_plugin_enqueue_accessibility_assets() {
    wp_enqueue_script(
        'my-plugin-accessibility-checks',
        plugins_url('build/accessibility-checks.js', __FILE__),
        array('wp-hooks', 'wp-i18n', 'block-accessibility-script'),
        '1.0.0',
        true
    );
}
add_action('enqueue_block_editor_assets', 'my_plugin_enqueue_accessibility_assets');
```

## Best Practices
- Use unique block type and check names to avoid conflicts
- Register checks in the `ba11yc_ready` action for compatibility
- Provide clear error and warning messages for each check
- Test your integration in the block editor to ensure real-time feedback

## See Also
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [JavaScript Integration](./js-integration.md)
- [PHP Integration](./php-integration.md)
