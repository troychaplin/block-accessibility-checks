# Editor Validation - PHP Integration

This guide explains how to register editor validation checks and interact with the `EditorChecksRegistry` API in PHP.

## Overview

PHP is used to register editor checks, configure metadata, and expose settings to the block editor. All validation logic is implemented in JavaScript.

## Registering Checks

### Using Action Hooks

Use the `ba11yc_editor_checks_ready` action to register your checks:

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',              // Post type
        'first_block_heading', // Check name
        array(
            'error_msg'   => __( 'The first block must be a Heading.', 'text-domain' ),
            'warning_msg' => __( 'Consider starting with a heading.', 'text-domain' ),
            'description' => __( 'Ensures content starts with a heading.', 'text-domain' ),
            'type'        => 'settings',
            'priority'    => 10,
        )
    );
} );
```

### Registering for Multiple Post Types

Use the convenience method to register the same check for multiple post types:

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check_for_post_types(
        array( 'post', 'page', 'custom_post_type' ),
        'first_block_heading',
        array(
            'error_msg'   => __( 'The first block must be a Heading.', 'text-domain' ),
            'type'        => 'error',
            'description' => __( 'Ensures content starts with a heading.', 'text-domain' ),
        )
    );
} );
```

### Accessing the Registry Directly

You can access the registry instance directly if needed:

```php
$registry = \BlockAccessibility\EditorChecksRegistry::get_instance();
$registry->register_editor_check( 'post', 'check_name', $args );
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
- **`priority`** (int) - Order of execution (lower = earlier, default: 10)
- **`enabled`** (bool) - Whether check is enabled (default: true)

## Settings Integration

Checks registered with `'type' => 'settings'` automatically appear in the admin settings UI, allowing site admins to configure severity levels and enable/disable checks.

## Advanced Patterns

### Conditional Registration

Register checks only for specific scenarios:

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    if ( get_post_type() === 'product' ) {
        $registry->register_editor_check( 'product', 'has_product_image', [
            'error_msg' => __( 'Product posts must include an image block.', 'my-plugin' ),
            'type'      => 'error',
        ] );
    }
} );
```

### Modifying Check Configuration

Use filters to modify check configuration (if available):

```php
// Note: Editor checks may not have all the same filters as block checks
// Check the hooks reference for available filters
```

## API Methods

### Quick Reference

- **`register_editor_check( $post_type, $check_name, $check_args )`** - Register a check for a post type
- **`register_editor_check_for_post_types( $post_types, $check_name, $check_args )`** - Register for multiple post types
- **`get_editor_checks( $post_type )`** - Get all checks for a post type
- **`get_all_editor_checks()`** - Get all registered editor checks
- **`get_editor_check_config( $post_type, $check_name )`** - Get check configuration
- **`get_effective_editor_check_level( $post_type, $check_name )`** - Get effective severity level

For complete API documentation, see the [API Reference](../reference/api.md).

## Action Hooks

### `ba11yc_editor_checks_ready`

Fired when the editor checks registry is ready for developer interaction. Provides access to the `EditorChecksRegistry` instance.

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry, $plugin_initializer ) {
    // Register your editor checks here
} );
```

## Examples

### Enforce First Block is a Heading

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check_for_post_types(
        array( 'post', 'page' ),
        'first_block_heading',
        array(
            'error_msg'   => __( 'The first block must be a Heading.', 'text-domain' ),
            'type'        => 'error',
            'description' => __( 'Ensures content starts with a heading.', 'text-domain' ),
        )
    );
} );
```

### Limit Paragraph Count

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',
        'max_paragraphs',
        array(
            'warning_msg' => __( 'Consider using fewer paragraphs for brevity.', 'text-domain' ),
            'type'        => 'warning',
            'description' => __( 'Warns if there are more than 3 paragraphs.', 'text-domain' ),
        )
    );
} );
```

### Ensure Specific Block Exists

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'page',
        'has_copyright',
        array(
            'error_msg'   => __( 'A Copyright block is required.', 'text-domain' ),
            'type'        => 'error',
        )
    );
} );
```

## See Also

- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./javascript.md)
- [API Reference](../reference/api.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)

