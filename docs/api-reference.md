# API Reference: Block Accessibility Checks Registry

This document provides a detailed reference for the Registry API methods available to developers integrating with the Block Accessibility Checks plugin.

## Registry Methods

The Registry API allows you to register, unregister, enable/disable, and query accessibility checks for any block type. All configuration is handled in PHP, while validation logic is implemented in JavaScript.

---

### `register_check( $block_type, $check_name, $check_args )`
Register a new accessibility check for a block type.

**Parameters:**
- `$block_type` (string): Block type (e.g., 'core/image', 'my-plugin/custom-block')
- `$check_name` (string): Unique check name within the block type
- `$check_args` (array): Check configuration (see below)

**Returns:**
- `bool`: True on success, false on failure

**Check Configuration Example:**
```php
$check_args = array(
    'error_msg'   => 'Error message shown in the block editor when check fails', // Required
    'warning_msg' => 'Warning message shown in the block editor (optional)',     // Optional
    'description' => 'Explanation shown in the settings/admin UI',               // Optional
    'type'        => 'settings', // 'settings', 'error', 'warning', 'none'      // Optional
    'category'    => 'accessibility', // 'accessibility' or 'validation'        // Optional
    'priority'    => 10,         // Lower = earlier, default: 10                // Optional
    'enabled'     => true,       // Whether check is enabled (default: true)     // Optional
);
```

---

### `unregister_check( $block_type, $check_name )`
Remove a previously registered check.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `bool`: True on success, false if check wasn't registered

---

### `set_check_enabled( $block_type, $check_name, $enabled )`
Enable or disable a specific check.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)
- `$enabled` (bool)

**Returns:**
- `bool`: True on success, false if check doesn't exist

---

### `is_check_registered( $block_type, $check_name )`
Check if a specific check is registered.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `bool`: True if registered, false otherwise

---

### `get_check_config( $block_type, $check_name )`
Get configuration for a specific check.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `array|null`: Check configuration array or null if not found

---

### `get_checks( $block_type )`
Get all checks for a block type.

**Parameters:**
- `$block_type` (string)

**Returns:**
- `array`: Array of checks for the block type

---

### `get_all_checks()`
Get all registered checks.

**Returns:**
- `array`: Complete checks registry organized by block type

---

### `get_registered_block_types()`
Get all block types that have checks registered.

**Returns:**
- `array`: Array of block type names

---

### Deprecated: `run_checks( $block_type, $attributes, $content )`
**Note:** This method is deprecated. All validation is now handled in JavaScript.

**Parameters:**
- `$block_type` (string)
- `$attributes` (array)
- `$content` (string)

**Returns:**
- `array`: Empty array

---

## Usage Example

```php
add_action( 'ba11yc_ready', function( $registry ) {
    // Register a check
    $registry->register_check( 'my-plugin/card-block', 'card_title_required', [
        'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
        'type'        => 'error',
    ] );

    // Disable a check
    $registry->set_check_enabled( 'my-plugin/card-block', 'card_title_required', false );

    // Query all checks for a block type
    $checks = $registry->get_checks( 'my-plugin/card-block' );
} );
```

---

## See Also
- [Hooks Reference](./hooks.md)
- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./js-integration.md)
