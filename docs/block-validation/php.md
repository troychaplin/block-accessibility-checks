# Block Attributes Validation - PHP Integration

This guide explains how to register block attribute checks and interact with the `BlockChecksRegistry` API in PHP.

## Overview

PHP is used to register checks, configure metadata, and expose settings to the block editor. All validation logic is implemented in JavaScript.

## Registering Checks

### Using Action Hooks

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
            'category'    => 'validation',
            'priority'    => 10,
        )
    );
}
```

### Accessing the Registry Directly

You can access the registry instance directly if needed:

```php
$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
$registry->register_check( 'my-block/type', 'check_name', $args );
```

## Configuration Options

### Required Parameters

- **`error_msg`** (string) - Error message shown when validation fails

### Optional Parameters

- **`warning_msg`** (string) - Warning message (defaults to `error_msg` if not provided)
- **`description`** (string) - Description shown in settings UI
- **`type`** (string) - Severity level:
  - `'settings'` - Configurable in admin settings (error/warning/disabled)
  - `'error'` - Always treated as an error
  - `'warning'` - Always treated as a warning
  - `'none'` - Check is disabled
- **`category`** (string) - Issue category:
  - `'accessibility'` - WCAG compliance and accessibility standards
  - `'validation'` - Content validation and quality checks
- **`priority`** (int) - Order of execution (lower = earlier, default: 10)

## Settings Integration

Checks registered with `'type' => 'settings'` automatically appear in the admin settings UI, allowing site admins to configure severity levels and enable/disable checks.

The settings are stored in the `block_checks_options` option and can be accessed via:

```php
$options = get_option( 'block_checks_options', array() );
$check_level = $options['my-block/type']['check_name'] ?? 'settings';
```

## Advanced Patterns

### Conditional Registration

Register checks only for specific scenarios:

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

### Modifying Check Configuration

Use filters to modify check configuration:

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    if ( $check_name === 'content_length' && $block_type === 'my-plugin/custom-block' ) {
        $check_args['priority'] = 5; // Run earlier
    }
    return $check_args;
}, 10, 3 );
```

### Preventing Check Registration

Conditionally prevent checks from being registered:

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    if ( $check_name === 'optional_check' && ! current_user_can( 'manage_options' ) ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

## API Methods

### Quick Reference

- **`register_check( $block_type, $check_name, $check_args )`** - Register a new check
- **`unregister_check( $block_type, $check_name )`** - Remove a check
- **`set_check_enabled( $block_type, $check_name, $enabled )`** - Enable/disable a check
- **`is_check_registered( $block_type, $check_name )`** - Check if a check is registered
- **`get_check_config( $block_type, $check_name )`** - Get check configuration
- **`get_checks( $block_type )`** - Get all checks for a block type
- **`get_all_checks()`** - Get all registered checks
- **`get_effective_check_level( $block_type, $check_name )`** - Get effective severity level

For complete API documentation, see the [API Reference](../reference/api.md).

## Action Hooks

### `ba11yc_ready`

Fired when the plugin is ready for developer interaction. Provides access to the `BlockChecksRegistry` instance.

```php
add_action( 'ba11yc_ready', function( $registry, $plugin_initializer ) {
    // Register your checks here
} );
```

### `ba11yc_register_checks`

Fired during check registration phase. Use this to register custom checks.

```php
add_action( 'ba11yc_register_checks', function( $registry ) {
    // Register your checks here
} );
```

## Filter Hooks

### `ba11yc_check_args`

Modify check arguments before registration.

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    // Modify $check_args
    return $check_args;
}, 10, 3 );
```

### `ba11yc_should_register_check`

Control whether a specific check should be registered.

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    // Return false to prevent registration
    return $should_register;
}, 10, 4 );
```

For complete hooks documentation, see the [Hooks Reference](../reference/hooks.md).

## See Also

- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./javascript.md)
- [API Reference](../reference/api.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)

