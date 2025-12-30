# API Reference

This document provides comprehensive API documentation for all registry methods available in the Block Accessibility Checks plugin.

## BlockChecksRegistry

Use `BlockChecksRegistry::get_instance()` to access the block checks registry.

### `register_check( $block_type, $check_name, $check_args )`

Register a new accessibility check for a block type.

**Parameters:**
- `$block_type` (string): Block type (e.g., 'core/image', 'my-plugin/custom-block')
- `$check_name` (string): Unique check name within the block type
- `$check_args` (array): Check configuration

**Returns:**
- `bool`: True on success, false on failure

**Check Configuration:**
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

### `unregister_check( $block_type, $check_name )`

Remove a previously registered check.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `bool`: True on success, false if check wasn't registered

### `set_check_enabled( $block_type, $check_name, $enabled )`

Enable or disable a specific check.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)
- `$enabled` (bool)

**Returns:**
- `bool`: True on success, false if check doesn't exist

### `is_check_registered( $block_type, $check_name )`

Check if a specific check is registered.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `bool`: True if registered, false otherwise

### `get_check_config( $block_type, $check_name )`

Get configuration for a specific check.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `array|null`: Check configuration array or null if not found

### `get_checks( $block_type )`

Get all checks for a block type.

**Parameters:**
- `$block_type` (string)

**Returns:**
- `array`: Array of checks for the block type

### `get_all_checks()`

Get all registered checks.

**Returns:**
- `array`: Complete checks registry organized by block type

### `get_registered_block_types()`

Get all block types that have checks registered.

**Returns:**
- `array`: Array of block type names

### `get_effective_check_level( $block_type, $check_name )`

Get the effective check level for a specific check, considering settings.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)

**Returns:**
- `string`: The effective check level ('error', 'warning', 'none')

## MetaChecksRegistry

Use `MetaChecksRegistry::get_instance()` to access the meta checks registry.

### `register_meta_check( $post_type, $meta_key, $check_name, $check_args )`

Register a validation check for a post meta field.

**Parameters:**
- `$post_type` (string): Post type (e.g., 'post', 'band')
- `$meta_key` (string): Meta key being validated
- `$check_name` (string): Unique check name
- `$check_args` (array): Check configuration (same structure as block checks)

**Returns:**
- `bool`: True on success, false on failure

**Note:** Most users don't need to call this directly - use `MetaValidation::required()` instead, which handles registration automatically.

### `get_meta_checks( $post_type )`

Get all meta checks for a specific post type.

**Parameters:**
- `$post_type` (string): Post type

**Returns:**
- `array`: Array of meta checks organized by meta key

### `get_all_meta_checks()`

Get all registered meta checks.

**Returns:**
- `array`: Complete meta checks registry organized by post type

### `get_meta_check_config( $post_type, $meta_key, $check_name )`

Get configuration for a specific meta check.

**Parameters:**
- `$post_type` (string): Post type
- `$meta_key` (string): Meta key
- `$check_name` (string): Check name

**Returns:**
- `array|null`: Check configuration array or null if not found

### `get_effective_meta_check_level( $post_type, $meta_key, $check_name )`

Get the effective check level for a specific meta check, considering settings.

**Parameters:**
- `$post_type` (string): Post type
- `$meta_key` (string): Meta key
- `$check_name` (string): Check name

**Returns:**
- `string`: The effective check level ('error', 'warning', 'none')

## EditorChecksRegistry

Use `EditorChecksRegistry::get_instance()` to access the editor checks registry.

### `register_editor_check( $post_type, $check_name, $check_args )`

Register an editor validation check for a post type.

**Parameters:**
- `$post_type` (string): Post type (e.g., 'post', 'page')
- `$check_name` (string): Unique check name
- `$check_args` (array): Check configuration

**Returns:**
- `bool`: True on success, false on failure

**Check Configuration:**
```php
$check_args = array(
    'error_msg'   => 'Error message shown when validation fails', // Required
    'warning_msg' => 'Warning message (optional)',                 // Optional
    'description' => 'Description shown in settings UI',          // Optional
    'type'        => 'settings', // 'settings', 'error', 'warning', 'none' // Optional
    'priority'    => 10,         // Lower = earlier, default: 10            // Optional
    'enabled'     => true,       // Whether check is enabled (default: true) // Optional
);
```

### `register_editor_check_for_post_types( $post_types, $check_name, $check_args )`

Register the same check for multiple post types at once.

**Parameters:**
- `$post_types` (array): Array of post types (e.g., ['post', 'page', 'custom_type'])
- `$check_name` (string): Unique check name
- `$check_args` (array): Check configuration (same as `register_editor_check`)

**Returns:**
- `array`: Array of results, keyed by post type. Each value is `true` on success, `false` on failure

### `get_editor_checks( $post_type )`

Get all editor checks for a specific post type.

**Parameters:**
- `$post_type` (string): Post type

**Returns:**
- `array`: Array of editor checks for the post type

### `get_all_editor_checks()`

Get all registered editor checks.

**Returns:**
- `array`: Complete editor checks registry organized by post type

### `get_editor_check_config( $post_type, $check_name )`

Get configuration for a specific editor check.

**Parameters:**
- `$post_type` (string): Post type
- `$check_name` (string): Check name

**Returns:**
- `array|null`: Check configuration array or null if not found

### `get_effective_editor_check_level( $post_type, $check_name )`

Get the effective check level for a specific editor check, considering settings.

**Parameters:**
- `$post_type` (string): Post type
- `$check_name` (string): Check name

**Returns:**
- `string`: The effective check level ('error', 'warning', 'none')

## MetaValidation Helper Class

### `MetaValidation::required( $post_type, $meta_key, $args )`

Create a required field validator for post meta. This method registers the check and returns a validation callback.

**Parameters:**
- `$post_type` (string): Post type (e.g., 'band', 'post')
- `$meta_key` (string): Meta key being validated
- `$args` (array): Configuration arguments

**Returns:**
- `callable`: Validation callback for use with `register_post_meta()`

**Example:**
```php
use BlockAccessibility\MetaValidation;

register_post_meta( 'band', 'band_origin', [
    'validate_callback' => MetaValidation::required( 'band', 'band_origin', [
        'error_msg' => 'City of Origin is required.',
        'type'      => 'settings',
    ]),
] );
```

## Usage Examples

### Block Checks

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

### Meta Checks

```php
use BlockAccessibility\MetaValidation;

register_post_meta( 'band', 'band_origin', [
    'validate_callback' => MetaValidation::required( 'band', 'band_origin', [
        'error_msg' => 'City of Origin is required.',
        'type'      => 'settings',
    ]),
] );
```

### Editor Checks

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check_for_post_types(
        array( 'post', 'page' ),
        'first_block_heading',
        array(
            'error_msg'   => __( 'The first block must be a Heading.', 'text-domain' ),
            'type'        => 'error',
        )
    );
} );
```

## See Also

- [Block Attributes Validation](../block-validation/php.md)
- [Post Meta Validation](../meta-validation/php.md)
- [Editor Validation](../editor-validation/php.md)
- [Hooks Reference](./hooks.md)

