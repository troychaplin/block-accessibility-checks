# Post Meta Validation

This guide explains how to use the Block Accessibility Checks plugin to validate WordPress post meta fields with the same error/warning system used for block validation.

## Overview

The post meta validation system allows you to:
- Validate post meta fields with customizable error and warning messages
- Integrate with WordPress's built-in `validate_callback` system
- Provide real-time validation feedback in the block editor
- Lock post saving when required fields are missing
- Configure validation severity (error/warning/disabled) through admin settings

## Quick Start

Here's the simplest way to add validation to a post meta field:

```php
add_action( 'init', function() {
    register_post_meta( 'band', 'band_origin', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'validate_callback' => ba11yc_required( 'band', 'band_origin', [
            'error_msg' => __( 'City of Origin is required.', 'my-plugin' ),
            'type'      => 'settings',
        ]),
    ]);
});
```

That's it! The `ba11yc_required()` function handles:
- ✅ Registering the validation check with `MetaChecksRegistry`
- ✅ Integrating with settings UI
- ✅ Server-side validation
- ✅ Client-side validation sync
- ✅ Returning a validation callback for WordPress

## How It Works

### 1. Immediate Registration
When you call `ba11yc_required('band', 'band_origin', [...])`, it immediately registers the check with `MetaChecksRegistry`.

### 2. Returns Validation Callback
The function returns a closure that WordPress calls when validating the meta field.

### 3. Settings Integration
If `type` is set to `'settings'`, the check appears in the admin settings UI where site admins can configure it as error, warning, or disabled.

### 4. Dual Validation
- **Server-side**: Returns `WP_Error` for errors, preventing invalid data from being saved
- **Client-side**: Locks post saving and shows visual feedback in the editor

## Configuration Options

The `ba11yc_required()` function accepts the following options:

```php
ba11yc_required( $post_type, $meta_key, [
    'error_msg'   => 'Error message shown when validation fails',
    'warning_msg' => 'Warning message (optional, defaults to error_msg)',
    'description' => 'Description shown in settings UI',
    'type'        => 'settings',  // 'settings', 'error', 'warning', or 'none'
    'category'    => 'validation', // 'validation' or 'accessibility'
    'check_name'  => 'required',  // Unique identifier for the check
])
```

### Type Options

- **`'settings'`** (Recommended) - Configurable in admin settings (error/warning/disabled)
- **`'error'`** - Always treated as an error
- **`'warning'`** - Always treated as a warning
- **`'none'`** - Check is disabled

## Complete Example

```php
add_action( 'init', function() {
    // Required field with settings control
    register_post_meta( 'band', 'band_origin', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'validate_callback' => ba11yc_required( 'band', 'band_origin', [
            'error_msg'   => __( 'City of Origin is required.', 'my-plugin' ),
            'warning_msg' => __( 'City of Origin is recommended.', 'my-plugin' ),
            'description' => __( 'The city where the band originated', 'my-plugin' ),
            'type'        => 'settings',
            'category'    => 'validation',
        ]),
    ]);

    // Always an error (not configurable)
    register_post_meta( 'band', 'band_name', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'validate_callback' => ba11yc_required( 'band', 'band_name', [
            'error_msg' => __( 'Band name is required.', 'my-plugin' ),
            'type'      => 'error',
        ]),
    ]);

    // Always a warning (not configurable)
    register_post_meta( 'band', 'band_website', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'esc_url_raw',
        'validate_callback' => ba11yc_required( 'band', 'band_website', [
            'error_msg' => __( 'Band website is recommended.', 'my-plugin' ),
            'type'      => 'warning',
        ]),
    ]);
});
```

## JavaScript Validation

To add custom validation logic beyond simple "required" checks, use the `ba11yc.validateMeta` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateMeta',
    'my-plugin/meta-validation',
    ( isValid, value, postType, metaKey, checkName, rule ) => {
        if ( postType !== 'band' ) {
            return isValid;
        }

        switch ( metaKey ) {
            case 'band_origin':
                if ( checkName === 'required' ) {
                    // Custom logic: require at least city and country
                    const parts = value ? value.split( ',' ) : [];
                    return parts.length >= 2;
                }
                break;

            case 'band_start_date':
                if ( checkName === 'required' ) {
                    // Check if date is in valid format
                    return /^\d{4}-\d{2}-\d{2}$/.test( value );
                }
                break;
        }

        return isValid;
    }
);
```

### Default Validation

If you don't add a JavaScript filter, the default `required` validation checks that the value:
- Is not empty
- Is not an empty string after trimming

## Admin Settings

Meta validation checks appear in the admin settings UI alongside block checks:

1. Navigate to **Block Checks** > **[Your Plugin Name]**
2. Scroll to the **Post Meta Validation** section
3. Each field with `type='settings'` appears with a dropdown:
   - **Error** - Prevents post from being saved
   - **Warning** - Shows warning but allows saving
   - **None** - Disables the check

## Post Locking Behavior

When meta validation is configured as an error:

- **Save Draft** button is disabled
- **Publish** button is disabled  
- **Auto-save** is disabled
- User sees validation feedback in the editor (via JavaScript)

When configured as a warning:
- Post can still be saved/published
- Warning message is shown for UX feedback

## Advanced Usage

### Custom PHP Validation

You can add custom server-side validation logic using the `ba11yc.validateMeta` PHP filter:

```php
add_filter( 'ba11yc.validateMeta', function( $is_valid, $value, $post_type, $meta_key, $check_name, $config ) {
    if ( $post_type === 'band' && $meta_key === 'band_origin' && $check_name === 'required' ) {
        // Custom logic: require city and country
        $parts = explode( ',', $value );
        return count( $parts ) >= 2;
    }
    return $is_valid;
}, 10, 6 );
```

### Accessing Validation Rules in JavaScript

All registered meta validation rules are exposed to JavaScript:

```javascript
const metaRules = window.BlockAccessibilityChecks?.metaValidationRules || {};
const bandRules = metaRules.band || {};
console.log( bandRules );
```

## Troubleshooting

### Check Not Appearing in Settings

1. Ensure `type` is set to `'settings'`
2. Verify the check is being registered (check PHP errors)
3. Clear WordPress cache and reload admin page

### Validation Not Working

1. Check that `show_in_rest` is `true` in `register_post_meta()`
2. Verify JavaScript filter is loaded in block editor
3. Check browser console for JavaScript errors
4. Ensure post type supports the meta field

### Post Not Locking

1. Verify the check is set to `'error'` in settings (or `type='error'`)
2. Check that JavaScript validation is returning `false`
3. Ensure the meta field is being edited/saved through REST API

## Filter Reference

### PHP Filters

**`ba11yc.validateMeta`**
Validate post meta server-side.

```php
apply_filters( 'ba11yc.validateMeta', bool $is_valid, mixed $value, string $post_type, string $meta_key, string $check_name, array $config )
```

**`ba11yc_meta_check_args`**
Modify check arguments before registration.

```php
apply_filters( 'ba11yc_meta_check_args', array $check_args, string $post_type, string $meta_key, string $check_name )
```

**`ba11yc_should_register_meta_check`**
Prevent a specific check from being registered.

```php
apply_filters( 'ba11yc_should_register_meta_check', bool $should_register, string $post_type, string $meta_key, string $check_name, array $check_args )
```

### JavaScript Filters

**`ba11yc.validateMeta`**
Validate post meta client-side.

```javascript
wp.hooks.applyFilters( 'ba11yc.validateMeta', true, value, postType, metaKey, checkName, rule )
```

## Actions

**`ba11yc_meta_check_registered`**
Fired when a meta check is successfully registered.

```php
do_action( 'ba11yc_meta_check_registered', string $post_type, string $meta_key, string $check_name, array $check_args )
```

## Best Practices

1. **Use `'settings'` type** for flexibility - let site admins decide severity
2. **Provide clear messages** - error and warning messages should be user-friendly
3. **Add descriptions** - help admins understand what each check validates
4. **Test both sides** - verify server and client validation work correctly
5. **Use meaningful check names** - avoid generic names like "check1", "check2"

## See Also

- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [JavaScript Integration](./js-integration.md)
- [External Plugin Integration](./external-integration.md)

