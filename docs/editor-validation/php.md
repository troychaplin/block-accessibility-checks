# Editor Validation - PHP Integration

This guide explains how to register editor validation checks using the `ba11yc_register_editor_check()` API.

## Overview

PHP is used to register editor checks, configure metadata, and expose settings to the block editor. All validation logic is implemented in JavaScript.

## Registering Checks

### Using the Global Registration Function

Use `ba11yc_register_editor_check()` inside the `ba11yc_editor_checks_ready` action:

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check(
        'post',
        array(
            'namespace'    => 'my-plugin',
            'name'         => 'first_block_heading',
            'error_msg'    => __( 'The first block must be a Heading.', 'text-domain' ),
            'warning_msg'  => __( 'Consider starting with a heading.', 'text-domain' ),
            'description'  => __( 'Ensures content starts with a heading.', 'text-domain' ),
            'level'        => 'error',
            'configurable' => true,
            'priority'     => 10,
        )
    );
} );
```

### Registering for Multiple Post Types

Use `register_editor_check_for_post_types()` on the registry directly to register the same check for multiple post types:

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    \BlockAccessibility\Editor\Registry::get_instance()->register_editor_check_for_post_types(
        array( 'post', 'page', 'custom_post_type' ),
        'first_block_heading',
        array(
            'namespace'    => 'my-plugin',
            'error_msg'    => __( 'The first block must be a Heading.', 'text-domain' ),
            'description'  => __( 'Ensures content starts with a heading.', 'text-domain' ),
            'level'        => 'error',
            'configurable' => false,
        )
    );
} );
```

## Configuration Options

### Required Keys

- **`namespace`** (string) — Plugin identifier for attribution in the settings table.
- **`name`** (string) — Unique check name within the post type.
- **`error_msg`** (string) — Message shown when validation fails.

### Optional Keys

- **`warning_msg`** (string) — Warning message (defaults to `error_msg`).
- **`description`** (string) — Description shown in the settings UI.
- **`level`** (string) — Default severity: `'error'`, `'warning'`, or `'none'`. Default: `'error'`.
- **`configurable`** (bool) — Whether the admin can change the level in settings. Default: `true`.
- **`priority`** (int) — Execution order (lower = earlier). Default: `10`.
- **`enabled`** (bool) — Whether the check is active. Default: `true`.

## Settings Integration

Checks with `'configurable' => true` appear in the unified DataViews settings table, allowing site admins to change the severity level per check.

## Advanced Patterns

### Conditional Registration

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    if ( post_type_exists( 'product' ) ) {
        ba11yc_register_editor_check( 'product', array(
            'namespace'    => 'my-plugin',
            'name'         => 'has_product_image',
            'error_msg'    => __( 'Product posts must include an image block.', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => false,
        ) );
    }
} );
```

## API Methods

### Quick Reference

- **`ba11yc_register_editor_check( $post_type, $args )`** — Global function for registration
- **`register_editor_check( $post_type, $check_name, $check_args )`** — Registry method
- **`register_editor_check_for_post_types( $post_types, $check_name, $check_args )`** — Register for multiple post types
- **`get_editor_checks( $post_type )`** — Get all checks for a post type
- **`get_all_editor_checks()`** — Get all registered editor checks
- **`get_editor_check_config( $post_type, $check_name )`** — Get check configuration
- **`get_effective_editor_check_level( $post_type, $check_name )`** — Get effective severity level

For complete API documentation, see the [API Reference](../reference/api.md).

## Action Hooks

### `ba11yc_editor_checks_ready`

Fired when the editor checks registry is ready for developer interaction.

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    // Register your editor checks here
} );
```

## Examples

### Enforce First Block is a Heading

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    \BlockAccessibility\Editor\Registry::get_instance()->register_editor_check_for_post_types(
        array( 'post', 'page' ),
        'first_block_heading',
        array(
            'namespace'    => 'my-plugin',
            'error_msg'    => __( 'The first block must be a Heading.', 'text-domain' ),
            'description'  => __( 'Ensures content starts with a heading.', 'text-domain' ),
            'level'        => 'error',
            'configurable' => false,
        )
    );
} );
```

### Limit Paragraph Count (Warning)

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace'    => 'my-plugin',
        'name'         => 'max_paragraphs',
        'warning_msg'  => __( 'Consider using fewer paragraphs for brevity.', 'text-domain' ),
        'description'  => __( 'Warns if there are more than 3 paragraphs.', 'text-domain' ),
        'level'        => 'warning',
        'configurable' => true,
    ) );
} );
```

### Ensure Specific Block Exists

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'page', array(
        'namespace'    => 'my-plugin',
        'name'         => 'has_copyright',
        'error_msg'    => __( 'A Copyright block is required.', 'text-domain' ),
        'level'        => 'error',
        'configurable' => false,
    ) );
} );
```

## See Also

- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./javascript.md)
- [API Reference](../reference/api.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)
