# PHP Integration: Block Accessibility Checks

This guide explains how to register accessibility checks and interact with the registry API in PHP for the Block Accessibility Checks plugin.

## Overview

PHP is used to register checks, configure metadata, and expose settings to the block editor. All validation logic is implemented in JavaScript.

## Registering Checks

Use the `ba11yc_ready` or `ba11yc_register_checks` action to register your checks:

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
    $registry->register_check(
        'my-plugin/custom-block',
        'content_length',
        array(
            'error_msg'   => __( 'Content is too long for optimal readability', 'my-plugin' ),
            'warning_msg' => __( 'Content is long but still allowed (warning)', 'my-plugin' ),
            'description' => __( 'Long content can be difficult to read', 'my-plugin' ),
            'type'        => 'settings',
            'priority'    => 10,
        )
    );
}
```

## Accessing the Registry

You can access the registry instance directly if needed:

```php
$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
```

## Settings Integration

Checks registered with `'type' => 'settings'` automatically appear in the admin settings UI, allowing site admins to configure severity levels and enable/disable checks.


## Example: Conditional Registration

This example demonstrates how to register accessibility checks only for specific post types. The check for product image requirements will only be registered when editing a post of type `product`. This allows you to target checks to particular content scenarios and avoid unnecessary validation for other post types.

```php
add_action( 'ba11yc_register_checks', function( $registry ) {
    if ( get_post_type() === 'product' ) {
        $registry->register_check( 'core/image', 'product_image_requirements', [
            'error_msg' => __( 'Product images must have descriptive alt text.', 'my-plugin' ),
            'type'      => 'error',
        ] );
    }
} );
```

## See Also
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [JavaScript Integration](./js-integration.md)
