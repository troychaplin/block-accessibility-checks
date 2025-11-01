# Hooks Reference: Block Accessibility Checks

This document lists all action and filter hooks available in the Block Accessibility Checks plugin, with parameters, usage, and examples for developers.

## Action Hooks

### `ba11yc_plugin_initialized`
Fired when the plugin is fully initialized.
- **Parameters:**
  - `$plugin_initializer` (PluginInitializer)

### `ba11yc_ready`
Fired when the plugin is ready for developer interaction.
- **Parameters:**
  - `$registry` (BlockChecksRegistry)
  - `$plugin_initializer` (PluginInitializer)

### `ba11yc_register_checks`
Fired during check registration phase. Use this to register custom checks.
- **Parameters:**
  - `$registry` (BlockChecksRegistry)

### `ba11yc_check_registered`
Fired when a check is successfully registered.
- **Parameters:**
  - `$block_type` (string)
  - `$check_name` (string)
  - `$check_args` (array)

### `ba11yc_check_unregistered`
Fired when a check is unregistered.
- **Parameters:**
  - `$block_type` (string)
  - `$check_name` (string)

### `ba11yc_check_toggled`
Fired when a check is enabled or disabled.
- **Parameters:**
  - `$block_type` (string)
  - `$check_name` (string)
  - `$enabled` (bool)

## Filter Hooks

### Important: Configuration vs. Validation

**PHP filter hooks** are for modifying check **configuration and registration** only.

**JavaScript hooks** are for implementing **validation logic**. All validation happens in JavaScript for real-time feedback. See [JavaScript Integration](./js-integration.md) for the `ba11yc.validateBlock` filter.

### `ba11yc_register_default_checks`
Controls whether default checks should be registered.
- **Parameters:**
  - `$register` (bool)
- **Returns:** (bool)

### `ba11yc_should_register_check`
Controls whether a specific check should be registered.
- **Parameters:**
  - `$should_register` (bool)
  - `$block_type` (string)
  - `$check_name` (string)
  - `$check_args` (array)
- **Returns:** (bool)

### `ba11yc_check_args`
Filters check arguments before registration.
- **Parameters:**
  - `$check_args` (array)
  - `$block_type` (string)
  - `$check_name` (string)
- **Returns:** (array)

## Usage Examples

### Registering Checks

```php
add_action( 'ba11yc_register_checks', function( $registry ) {
    // Register a custom check
    $registry->register_check( 'my-plugin/card-block', 'card_title_required', [
        'error_msg' => __( 'Card title is required.', 'my-plugin' ),
        'type'      => 'error',
    ] );
} );
```

### Modifying Check Registration

```php
add_filter( 'ba11yc_check_args', function( $args, $block_type, $check_name ) {
    // Modify check arguments before registration
    if ( $check_name === 'card_title_required' ) {
        $args['priority'] = 5;
    }
    return $args;
}, 10, 3 );
```

### Preventing Check Registration

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    // Don't register certain checks for specific scenarios
    if ( $check_name === 'optional_check' && get_post_type() === 'draft' ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

## See Also
- [API Reference](./api-reference.md)
- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./js-integration.md)
