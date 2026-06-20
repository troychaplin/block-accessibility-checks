# Post Meta Validation - PHP Integration

This guide explains how to register post meta validation checks using the `Validator::required()` helper and the `Meta\Registry` API.

## Overview

PHP is used to register meta checks, configure metadata, and integrate with WordPress's `register_post_meta()` system. All validation logic is implemented in JavaScript, but PHP also provides server-side validation for REST API requests.

## Using the Validator Helper

The easiest way to add meta validation is `Validator::required()`:

```php
add_action( 'init', function() {
    // Check if Validator class is available (plugin may be deactivated)
    $validator_class = '\BlockAccessibility\Meta\Validator';
    $validator_available = class_exists( $validator_class );

    register_post_meta( 'band', 'band_origin', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'validate_callback' => $validator_available
            ? call_user_func(
                array( $validator_class, 'required' ),
                'band',
                'band_origin',
                [
                    'namespace'    => 'my-plugin',
                    'error_msg'    => __( 'City of Origin is required.', 'my-plugin' ),
                    'warning_msg'  => __( 'City of Origin is recommended.', 'my-plugin' ),
                    'description'  => __( 'The city where the band originated', 'my-plugin' ),
                    'level'        => 'error',
                    'configurable' => true,
                ]
            )
            : null,
    ]);
});
```

**Note:** The conditional check ensures your plugin continues to work even if the Block Accessibility Checks plugin is deactivated. The meta field will still be registered, but validation will be disabled.

### How `Validator::required()` Works

1. **Immediate Registration** — Registers the check with `Meta\Registry` immediately.
2. **Returns Validation Callback** — Returns a closure for WordPress's `validate_callback`.
3. **Settings Integration** — Checks with `configurable: true` appear in the DataViews settings table.
4. **Dual Validation** — Provides both server-side (REST API) and client-side validation.

## Configuration Options

### Required keys

- **`namespace`** (string) — Plugin identifier for attribution.
- **`error_msg`** (string) — Error message (default: `'This field is required.'`).

### Optional keys

- **`warning_msg`** (string) — Warning message (default: `'This field is recommended.'`).
- **`description`** (string) — Description shown in the settings UI.
- **`level`** (string) — Default severity: `'error'`, `'warning'`, or `'none'`. Default: `'error'`.
- **`configurable`** (bool) — Whether the admin can change the level. Default: `true`.
- **`check_name`** (string) — Unique identifier for the check. Default: `'required'`.

## Direct Registry Access

You can also register checks directly with `Meta\Registry`:

```php
$meta_registry = \BlockAccessibility\Meta\Registry::get_instance();
$meta_registry->register_meta_check(
    'band',
    'band_origin',
    'required',
    array(
        'namespace'    => 'my-plugin',
        'error_msg'    => __( 'City of Origin is required.', 'my-plugin' ),
        'warning_msg'  => __( 'City of Origin is recommended.', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => true,
        'description'  => __( 'The city where the band originated', 'my-plugin' ),
    )
);
```

**Note:** When using direct registry access, you still need to provide a `validate_callback` to `register_post_meta()` for server-side validation.

## Server-Side Validation

The validation callback returned by `Validator::required()`:

- Returns `WP_Error` for errors (prevents saving).
- Returns `true` for warnings (allows saving; JavaScript shows warning in editor).
- Respects settings — if `configurable: true`, checks `ba11yc_settings` for the active level.
- Uses PHP filter `ba11yc_validate_meta` for extensibility.

### Custom Server-Side Validation

```php
add_filter( 'ba11yc_validate_meta', function( $is_valid, $value, $post_type, $meta_key, $check_name, $config ) {
    if ( $post_type === 'band' && $meta_key === 'band_origin' && $check_name === 'required' ) {
        // Custom logic: require city and country
        $parts = explode( ',', $value );
        return count( $parts ) >= 2;
    }
    return $is_valid;
}, 10, 6 );
```

## Settings Integration

Meta validation checks with `'configurable' => true` appear in the unified DataViews settings table. Admins can filter by `namespace` to see only your plugin's checks. Each configurable check has a dropdown: Error / Warning / Disabled.

## Complete Examples

### Required Field (User-Configurable)

```php
$validator_class = '\BlockAccessibility\Meta\Validator';
$validator_available = class_exists( $validator_class );

register_post_meta( 'band', 'band_origin', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
    'validate_callback' => $validator_available
        ? call_user_func(
            array( $validator_class, 'required' ),
            'band',
            'band_origin',
            [
                'namespace'    => 'my-plugin',
                'error_msg'    => __( 'City of Origin is required.', 'my-plugin' ),
                'warning_msg'  => __( 'City of Origin is recommended.', 'my-plugin' ),
                'description'  => __( 'The city where the band originated', 'my-plugin' ),
                'level'        => 'error',
                'configurable' => true,
            ]
        )
        : null,
]);
```

### Always an Error (Not Configurable)

```php
register_post_meta( 'band', 'band_name', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
    'validate_callback' => class_exists( '\BlockAccessibility\Meta\Validator' )
        ? \BlockAccessibility\Meta\Validator::required( 'band', 'band_name', [
            'namespace'    => 'my-plugin',
            'error_msg'    => __( 'Band name is required.', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => false,
        ] )
        : null,
]);
```

### Always a Warning (Not Configurable)

```php
register_post_meta( 'band', 'band_website', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'esc_url_raw',
    'validate_callback' => class_exists( '\BlockAccessibility\Meta\Validator' )
        ? \BlockAccessibility\Meta\Validator::required( 'band', 'band_website', [
            'namespace'    => 'my-plugin',
            'error_msg'    => __( 'Band website is recommended.', 'my-plugin' ),
            'level'        => 'warning',
            'configurable' => false,
        ] )
        : null,
]);
```

## API Methods

### Quick Reference

- **`ba11yc_register_meta_check( $post_type, $args )`** — Global function for registration
- **`register_meta_check( $post_type, $meta_key, $check_name, $check_args )`** — Registry method
- **`get_meta_checks( $post_type )`** — Get all meta checks for a post type
- **`get_all_meta_checks()`** — Get all registered meta checks
- **`get_meta_check_config( $post_type, $meta_key, $check_name )`** — Get check configuration
- **`get_effective_meta_check_level( $post_type, $meta_key, $check_name )`** — Get effective severity level

For complete API documentation, see the [API Reference](../reference/api.md).

## Filter Hooks

### `ba11yc_validate_meta`

Server-side meta validation filter.

```php
add_filter( 'ba11yc_validate_meta', function( $is_valid, $value, $post_type, $meta_key, $check_name, $config ) {
    return $is_valid;
}, 10, 6 );
```

### `ba11yc_meta_check_args`

Modify check arguments before registration.

```php
add_filter( 'ba11yc_meta_check_args', function( $check_args, $post_type, $meta_key, $check_name ) {
    return $check_args;
}, 10, 4 );
```

### `ba11yc_should_register_meta_check`

Prevent a specific check from being registered.

```php
add_filter( 'ba11yc_should_register_meta_check', function( $should_register, $post_type, $meta_key, $check_name, $check_args ) {
    return $should_register;
}, 10, 5 );
```

For complete hooks documentation, see the [Hooks Reference](../reference/hooks.md).

## Post Locking Behavior

When meta validation resolves to `'error'` level:
- **Save Draft** button is disabled
- **Publish** button is disabled
- User sees validation feedback in the editor (via JavaScript)

When resolved to `'warning'`:
- Post can still be saved/published
- Warning message is shown for UX feedback

## See Also

- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./javascript.md)
- [API Reference](../reference/api.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)
