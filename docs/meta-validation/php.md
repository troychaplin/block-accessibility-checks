# Post Meta Validation - PHP Integration

This guide explains how to register post meta validation checks and interact with the `MetaChecksRegistry` API in PHP.

## Overview

PHP is used to register meta checks, configure metadata, and integrate with WordPress's `register_post_meta()` system. All validation logic is implemented in JavaScript, but PHP also provides server-side validation for REST API requests.

## Using MetaValidation Helper

The easiest way to add meta validation is using the `MetaValidation::required()` helper method:

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
                    'error_msg'   => __( 'City of Origin is required.', 'my-plugin' ),
                    'warning_msg' => __( 'City of Origin is recommended.', 'my-plugin' ),
                    'description' => __( 'The city where the band originated', 'my-plugin' ),
                    'type'        => 'settings',
                ]
            )
            : null,
    ]);
});
```

**Note:** The conditional check ensures your plugin continues to work even if the Block Accessibility Checks plugin is deactivated. The meta field will still be registered, but validation will be disabled.

### How MetaValidation::required() Works

1. **Immediate Registration** - Registers the check with `MetaChecksRegistry` immediately
2. **Returns Validation Callback** - Returns a closure for WordPress's `validate_callback`
3. **Settings Integration** - If `type` is `'settings'`, appears in admin settings UI
4. **Dual Validation** - Provides both server-side (REST API) and client-side validation

## Configuration Options

### Required Parameters

- **`$post_type`** (string) - Post type (e.g., `'band'`, `'post'`)
- **`$meta_key`** (string) - Meta key being validated

### Optional Parameters

- **`error_msg`** (string) - Error message (default: `'This field is required.'`)
- **`warning_msg`** (string) - Warning message (default: `'This field is recommended.'`)
- **`description`** (string) - Description shown in settings UI
- **`type`** (string) - Severity level:
  - `'settings'` - Configurable in admin settings (error/warning/disabled)
  - `'error'` - Always treated as an error
  - `'warning'` - Always treated as a warning
  - `'none'` - Check is disabled
- **`check_name`** (string) - Unique identifier for the check (default: `'required'`)

## Direct Registry Access

You can also register checks directly with `MetaChecksRegistry`:

```php
$meta_registry = \BlockAccessibility\MetaChecksRegistry::get_instance();
$meta_registry->register_meta_check(
    'band',
    'band_origin',
    'required',
    array(
        'error_msg'   => __( 'City of Origin is required.', 'my-plugin' ),
        'warning_msg' => __( 'City of Origin is recommended.', 'my-plugin' ),
        'type'        => 'settings',
        'description' => __( 'The city where the band originated', 'my-plugin' ),
    )
);
```

**Note:** When using direct registry access, you still need to provide a `validate_callback` to `register_post_meta()` for server-side validation.

## Server-Side Validation

The validation callback returned by `MetaValidation::required()`:

- Returns `WP_Error` for errors (prevents saving)
- Returns `true` for warnings (allows saving, shows warning in editor)
- Respects settings (if `type` is `'settings'`, checks admin settings)
- Uses PHP filter `ba11yc_validate_meta` for extensibility

### Custom Server-Side Validation

You can add custom server-side validation logic using the PHP filter:

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

Meta validation checks appear in the admin settings UI alongside block checks:

1. Navigate to **Block Checks** > **[Your Plugin Name]**
2. Scroll to the **Post Meta Validation** section
3. Each field with `type='settings'` appears with a dropdown:
   - **Error** - Prevents post from being saved
   - **Warning** - Shows warning but allows saving
   - **None** - Disables the check

## Complete Examples

### Required Field with Settings Control

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
                'error_msg'   => __( 'City of Origin is required.', 'my-plugin' ),
                'warning_msg' => __( 'City of Origin is recommended.', 'my-plugin' ),
                'description' => __( 'The city where the band originated', 'my-plugin' ),
                'type'        => 'settings',
            ]
        )
        : null,
]);
```

### Always an Error (Not Configurable)

```php
$validator_class = '\BlockAccessibility\Meta\Validator';
$validator_available = class_exists( $validator_class );

register_post_meta( 'band', 'band_name', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'sanitize_text_field',
    'validate_callback' => $validator_available
        ? call_user_func(
            array( $validator_class, 'required' ),
            'band',
            'band_name',
            [
                'error_msg' => __( 'Band name is required.', 'my-plugin' ),
                'type'      => 'error',
            ]
        )
        : null,
]);
```

### Always a Warning (Not Configurable)

```php
$validator_class = '\BlockAccessibility\Meta\Validator';
$validator_available = class_exists( $validator_class );

register_post_meta( 'band', 'band_website', [
    'single'            => true,
    'type'              => 'string',
    'show_in_rest'      => true,
    'sanitize_callback' => 'esc_url_raw',
    'validate_callback' => $validator_available
        ? call_user_func(
            array( $validator_class, 'required' ),
            'band',
            'band_website',
            [
                'error_msg' => __( 'Band website is recommended.', 'my-plugin' ),
                'type'      => 'warning',
            ]
        )
        : null,
]);
```

## API Methods

### Quick Reference

- **`register_meta_check( $post_type, $meta_key, $check_name, $check_args )`** - Register a meta check
- **`get_meta_checks( $post_type )`** - Get all meta checks for a post type
- **`get_all_meta_checks()`** - Get all registered meta checks
- **`get_meta_check_config( $post_type, $meta_key, $check_name )`** - Get check configuration
- **`get_effective_meta_check_level( $post_type, $meta_key, $check_name )`** - Get effective severity level

For complete API documentation, see the [API Reference](../reference/api.md).

## Filter Hooks

### `ba11yc_validate_meta`

Validate post meta server-side.

```php
add_filter( 'ba11yc_validate_meta', function( $is_valid, $value, $post_type, $meta_key, $check_name, $config ) {
    // Custom validation logic
    return $is_valid;
}, 10, 6 );
```

### `ba11yc_meta_check_args`

Modify check arguments before registration.

```php
add_filter( 'ba11yc_meta_check_args', function( $check_args, $post_type, $meta_key, $check_name ) {
    // Modify $check_args
    return $check_args;
}, 10, 4 );
```

### `ba11yc_should_register_meta_check`

Prevent a specific check from being registered.

```php
add_filter( 'ba11yc_should_register_meta_check', function( $should_register, $post_type, $meta_key, $check_name, $check_args ) {
    // Return false to prevent registration
    return $should_register;
}, 10, 5 );
```

For complete hooks documentation, see the [Hooks Reference](../reference/hooks.md).

## Post Locking Behavior

When meta validation is configured as an error:

- **Save Draft** button is disabled
- **Publish** button is disabled
- **Auto-save** is disabled
- User sees validation feedback in the editor (via JavaScript)

When configured as a warning:
- Post can still be saved/published
- Warning message is shown for UX feedback

## Best Practices

1. **Use `'settings'` type** - Allows site admins to configure severity
2. **Provide clear messages** - Error and warning messages should be user-friendly
3. **Add descriptions** - Help admins understand what each check validates
4. **Test both sides** - Verify server and client validation work correctly
5. **Use meaningful check names** - Avoid generic names like "check1", "check2"

## See Also

- [Quick Start Guide](./quick-start.md)
- [JavaScript Integration](./javascript.md)
- [API Reference](../reference/api.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)

