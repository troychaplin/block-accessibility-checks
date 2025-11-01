# External Plugin Integration: Block Accessibility Checks

This guide explains how to integrate external plugins and custom blocks with the Block Accessibility Checks Validation API, enabling dedicated accessibility validation and settings for your blocks.

## Overview

External plugins can register their own accessibility checks for custom blocks. The Block Accessibility Checks API automatically creates a dedicated settings page for your plugin, allowing site admins to configure validation levels and enable/disable checks.

## Quick Start

### 1. Basic Integration with Automatic Plugin Detection

```php
<?php
// In your plugin's main file or integration class
add_action( 'ba11yc_ready', function( $registry ) {
    // Use the simplified registration method with automatic plugin detection
    $registry->register_check_with_plugin_detection(
        'your-plugin/your-block',
        'check_name',
        array(
            'error_msg'   => __( 'Error message', 'your-text-domain' ),
            'warning_msg' => __( 'Warning message', 'your-text-domain' ),
            'description' => __( 'Check description', 'your-text-domain' ),
            'type'        => 'settings', // or 'error', 'warning', 'none'
            'category'    => 'accessibility', // or 'validation'
        )
    );
});
```

### 2. Advanced Integration with Manual Plugin Info

```php
<?php
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check(
        'your-plugin/your-block',
        'check_name',
        array(
            'error_msg'   => __( 'Error message', 'your-text-domain' ),
            'warning_msg' => __( 'Warning message', 'your-text-domain' ),
            'description' => __( 'Check description', 'your-text-domain' ),
            'type'        => 'settings',
            'category'    => 'accessibility',
        ),
        array(
            'name'    => 'Your Plugin Name',
            'version' => '1.0.0',
            'file'    => __FILE__,
            'slug'    => 'your-plugin-slug',
        )
    );
});
```

## Automatic Settings Integration

Checks registered with `'type' => 'settings'` will:
- Appear in a dedicated submenu under the Block Accessibility Checks menu, named after your plugin
- Allow site admins to set each check to Error, Warning, or Disabled
- Integrate with the block editor for real-time feedback

## Check Types

- `'settings'` - User can configure the check level (Error/Warning/None) in admin
- `'error'` - Always shows as an error
- `'warning'` - Always shows as a warning
- `'none'` - Disabled check

## Check Categories

- `'accessibility'` - WCAG compliance and accessibility standards
- `'validation'` - Content validation and quality checks

## Automatic Plugin Detection

The `register_check_with_plugin_detection()` method automatically:

1. Detects which plugin is registering the check
2. Extracts plugin name, version, and file path
3. Groups all blocks from the same plugin together in settings
4. Displays plugin information in the admin interface

## Settings Page Integration

When you use the automatic detection, your plugin will appear in the Block Checks admin menu with:

- Plugin name as the submenu title
- Plugin version (if available)
- All your blocks grouped together
- Individual check settings for each block

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
        'category'    => 'validation', // 'accessibility' or 'validation'
    ]);

    // This check is forced as an error (bypasses settings)
    $registry->register_check('my-plugin/card-block', 'link_required', [
        'error_msg'   => __('Card link is required.', 'my-plugin'),
        'description' => __('Link validation for card blocks.', 'my-plugin'),
        'type'        => 'error', // Always an error, no settings control
        'category'    => 'accessibility', // 'accessibility' or 'validation'
    ]);
}
```

## Example: Complete Integration

```php
<?php
/**
 * Plugin Name: My Custom Blocks
 * Version: 1.0.0
 * Text Domain: my-custom-blocks
 */

class MyCustomBlocksIntegration {
    public function __construct() {
        add_action( 'ba11yc_ready', array( $this, 'register_checks' ) );
    }

    public function register_checks( $registry ) {
        // Card block checks
        $registry->register_check_with_plugin_detection(
            'my-custom-blocks/card',
            'check_title',
            array(
                'error_msg'   => __( 'Card title is required.', 'my-custom-blocks' ),
                'warning_msg' => __( 'Consider adding a title for better accessibility.', 'my-custom-blocks' ),
                'description' => __( 'Card title validation', 'my-custom-blocks' ),
                'type'        => 'settings',
                'category'    => 'accessibility',
            )
        );

        $registry->register_check_with_plugin_detection(
            'my-custom-blocks/card',
            'check_image_alt',
            array(
                'error_msg'   => __( 'Card image requires alt text.', 'my-custom-blocks' ),
                'warning_msg' => __( 'Alt text is recommended for card images.', 'my-custom-blocks' ),
                'description' => __( 'Image alt text validation', 'my-custom-blocks' ),
                'type'        => 'settings',
                'category'    => 'accessibility',
            )
        );

        // Button block checks
        $registry->register_check_with_plugin_detection(
            'my-custom-blocks/button',
            'check_text',
            array(
                'error_msg'   => __( 'Button text is required.', 'my-custom-blocks' ),
                'warning_msg' => __( 'Button text is recommended.', 'my-custom-blocks' ),
                'description' => __( 'Button text validation', 'my-custom-blocks' ),
                'type'        => 'settings',
                'category'    => 'validation',
            )
        );
    }
}

new MyCustomBlocksIntegration();
```

## Example: JavaScript Validation for External Blocks

This example demonstrates how to implement validation logic for your custom block in JavaScript. The filter checks the block type and then runs the appropriate validation for each registered check.

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
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

## Block Naming Convention

Use a consistent namespace for all blocks from your plugin:

```php
// Good: Consistent namespace
'your-plugin/block-one'
'your-plugin/block-two'
'your-plugin/block-three'

// Avoid: Inconsistent namespaces
'plugin1/block-one'
'plugin2/block-two'
'plugin3/block-three'
```

## Benefits

1. **Automatic Plugin Detection** - No need to manually specify plugin information
2. **Consistent Grouping** - All blocks from the same plugin are grouped together
3. **Future-Ready** - Plugin information is stored for future features
4. **Simplified Integration** - One method call handles everything
5. **Backward Compatible** - Existing integrations continue to work

## Best Practices

- Use unique block type and check names to avoid conflicts
- Register checks in the `ba11yc_ready` action for compatibility
- Provide clear error and warning messages for each check
- Test your integration in the block editor to ensure real-time feedback
- Use consistent block namespaces for all blocks from your plugin
- Ensure your plugin file has a proper plugin header for automatic detection

## Troubleshooting

### Plugin Not Appearing in Settings

1. Ensure you're using `register_check_with_plugin_detection()`
2. Check that your plugin file has a proper plugin header
3. Verify that at least one check has `'type' => 'settings'`

### Incorrect Plugin Name

1. Make sure your plugin file has a `Plugin Name:` header
2. Use consistent block namespaces for all blocks from your plugin
3. Check that the plugin file is in the correct location

### Multiple Plugin Entries

1. Use the same namespace for all blocks from your plugin
2. Avoid using different namespaces for blocks from the same plugin
3. Use `register_check_with_plugin_detection()` for automatic grouping

## See Also

- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [JavaScript Integration](./js-integration.md)
- [PHP Integration](./php-integration.md)
