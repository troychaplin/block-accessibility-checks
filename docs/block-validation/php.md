# Block Attributes Validation - PHP Integration

This guide explains how to register block attribute checks using the `ba11yc_register_block_check()` API.

## Overview

PHP is used to register checks, configure metadata, and expose settings to the block editor. All validation logic is implemented in JavaScript.

## Registering Checks

### Using the Global Registration Function

Use `ba11yc_register_block_check()` inside the `ba11yc_ready` action. The `namespace`, `name`, and `error_msg` keys are required:

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks() {
    ba11yc_register_block_check(
        'my-plugin/custom-block',
        array(
            'namespace'    => 'my-plugin',
            'name'         => 'content_length',
            'error_msg'    => __( 'Content is too long for optimal readability', 'my-plugin' ),
            'warning_msg'  => __( 'Content is long but still allowed (warning)', 'my-plugin' ),
            'description'  => __( 'Long content can be difficult to read', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => true,
            'category'     => 'validation',
            'priority'     => 10,
        )
    );
}
```

## Configuration Options

### Required Keys

- **`namespace`** (string) — Your plugin's identifier for attribution in the settings table.
- **`name`** (string) — Unique check name within the block type.
- **`error_msg`** (string) — Error message shown when validation fails.

### Optional Keys

- **`warning_msg`** (string) — Warning message (defaults to `error_msg` if not provided).
- **`description`** (string) — Description shown in the settings UI.
- **`level`** (string) — Default severity: `'error'`, `'warning'`, or `'none'`. Default: `'error'`.
- **`configurable`** (bool) — Whether the admin can change the level in settings. Default: `true`. Checks with `configurable: false` are excluded from the settings table.
- **`category`** (string) — `'accessibility'` or `'validation'`. Used as a filter in the settings table.
- **`priority`** (int) — Execution order (lower = earlier). Default: `10`.
- **`enabled`** (bool) — Whether the check is active. Default: `true`.

## Settings Integration

Checks with `'configurable' => true` appear in the unified DataViews settings table, allowing site admins to change the severity level (error / warning / disabled) per check.

Settings are stored in the `ba11yc_settings` option under the `block` key:

```php
$settings = get_option( 'ba11yc_settings', array() );
$level    = $settings['block']['my-plugin/custom-block']['content_length'] ?? 'error';
```

## Advanced Patterns

### Conditional Registration

Register checks only under specific conditions:

```php
add_action( 'ba11yc_register_checks', function() {
    if ( post_type_exists( 'product' ) ) {
        ba11yc_register_block_check( 'core/image', array(
            'namespace'    => 'my-plugin',
            'name'         => 'product_image_requirements',
            'error_msg'    => __( 'Product images must have descriptive alt text.', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => false,
        ) );
    }
} );
```

### Modifying Check Configuration

Use the `ba11yc_check_args` filter to modify check configuration before it is stored:

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    if ( $check_name === 'content_length' && $block_type === 'my-plugin/custom-block' ) {
        $check_args['priority'] = 5; // Run earlier
    }
    return $check_args;
}, 10, 3 );
```

### Preventing Check Registration

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    if ( $check_name === 'optional_check' && ! current_user_can( 'manage_options' ) ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

## Action Hooks

### `ba11yc_ready`

Fired when the plugin is ready for developer interaction.

```php
add_action( 'ba11yc_ready', function() {
    // Register your checks here
} );
```

### `ba11yc_register_checks`

Alternative hook fired during the check registration phase.

```php
add_action( 'ba11yc_register_checks', function() {
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
