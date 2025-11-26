# Troubleshooting

This guide covers common issues, debugging tips, and solutions for developers integrating with the Block Accessibility Checks plugin across all three validation systems.

## Common Issues & Solutions

### Block Attributes Validation

#### Visual Indicators Not Showing
**Problem:** Validation works, but error/warning borders or messages do not appear in the block editor.

**Solution:**
- Ensure your JavaScript validation returns the correct result
- Verify your script is loaded after the core plugin script (`block-accessibility-script` dependency)
- Check browser console for JavaScript errors
- Verify the check is enabled and not set to `'none'`

#### JavaScript Checks Not Running
**Problem:** Your validation logic is not being called.

**Solution:**
- Confirm your script is enqueued with the correct dependencies (`block-accessibility-script`)
- Use the `enqueue_block_editor_assets` action
- Check for typos in block type and check name
- Verify the check is registered in PHP
- Check browser console for JavaScript errors

#### PHP Checks Not Registering
**Problem:** Your checks are not appearing in the settings UI or registry.

**Solution:**
- Register checks in the `ba11yc_ready` or `ba11yc_register_checks` action
- Confirm the plugin is active and registry is available
- Check PHP error logs for registration errors
- Verify check arguments are valid (especially `error_msg` is required)

#### Validation Not Blocking Publishing
**Problem:** Errors do not prevent publishing as expected.

**Solution:**
- Ensure your check is registered with `'type' => 'error'` (or set to error in settings)
- Confirm your JS validation returns `false` for failed checks
- Check that the check is enabled
- Verify the effective check level is `'error'` (not `'warning'` or `'none'`)

### Post Meta Validation

#### Check Not Appearing in Settings
**Problem:** Meta validation check doesn't appear in admin settings.

**Solution:**
- Ensure `type` is set to `'settings'` in the check configuration
- Verify the check is being registered (check PHP errors)
- Clear WordPress cache and reload admin page
- Check that `MetaValidation::required()` was called correctly

#### Validation Not Working
**Problem:** Meta field validation doesn't work in the editor.

**Solution:**
- Check that `show_in_rest` is `true` in `register_post_meta()`
- Verify JavaScript filter is loaded in block editor
- Check browser console for JavaScript errors
- Ensure post type supports the meta field
- Verify the meta field is being edited/saved through REST API

#### Post Not Locking
**Problem:** Post can still be saved when meta validation fails.

**Solution:**
- Verify the check is set to `'error'` in settings (or `type='error'`)
- Check that JavaScript validation is returning `false`
- Ensure the meta field is being edited/saved through REST API
- Check that the effective check level is `'error'`

#### UI Components Not Showing Validation
**Problem:** `MetaField` or `ValidatedToolsPanelItem` don't show validation.

**Solution:**
- Ensure `'block-accessibility-script'` is included as a dependency
- Check that components are accessed correctly: `window.BlockAccessibilityChecks?.MetaField`
- Verify the `metaKey` prop matches the registered meta key
- Check browser console for JavaScript errors

### Editor Validation

#### Check Not Running
**Problem:** Editor validation logic is not being called.

**Solution:**
- Verify the check is registered in PHP using `ba11yc_editor_checks_ready`
- Confirm your script is enqueued with correct dependencies
- Check for typos in post type and check name
- Verify the check is enabled

#### Validation Not Blocking Publishing
**Problem:** Editor validation errors don't prevent publishing.

**Solution:**
- Ensure your check is registered with `'type' => 'error'`
- Confirm your JS validation returns `false` for failed checks
- Check that the effective check level is `'error'`
- Verify the check is enabled

## Debugging Tools & Tips

### Enable Debug Logging

Add to `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Debugging PHP Registration

Add logging to your registration function:

**Block Checks:**
```php
add_action( 'ba11yc_ready', function( $registry ) {
    error_log('Registering block checks...');
    $registry->register_check( 'my-block/type', 'check_name', [
        'error_msg' => 'Test message',
        'type'      => 'error',
    ] );
} );
```

**Meta Checks:**
```php
use BlockAccessibility\MetaValidation;

register_post_meta( 'post', 'meta_key', [
    'validate_callback' => MetaValidation::required( 'post', 'meta_key', [
        'error_msg' => 'Test message',
        'type'      => 'error',
    ]),
] );
error_log('Meta check registered');
```

**Editor Checks:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    error_log('Registering editor checks...');
    $registry->register_editor_check( 'post', 'check_name', [
        'error_msg' => 'Test message',
        'type'      => 'error',
    ] );
} );
```

### Debugging JavaScript Validation

Add console output to your validation function:

**Block Validation:**
```javascript
addFilter(
    'ba11yc_validate_block',
    'my-plugin/debug',
    (isValid, blockType, attributes, checkName) => {
        console.log('Validating block:', blockType, checkName, attributes);
        // ...validation logic...
        console.log('Result:', isValid);
        return isValid;
    }
);
```

**Meta Validation:**
```javascript
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/debug',
    (isValid, value, postType, metaKey, checkName) => {
        console.log('Validating meta:', postType, metaKey, checkName, value);
        // ...validation logic...
        console.log('Result:', isValid);
        return isValid;
    }
);
```

**Editor Validation:**
```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/debug',
    (isValid, blocks, postType, checkName) => {
        console.log('Validating editor:', postType, checkName, blocks.length, 'blocks');
        // ...validation logic...
        console.log('Result:', isValid);
        return isValid;
    }
);
```

### Inspecting the Registry

Print registered checks for debugging:

**Block Checks:**
```php
$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
error_log(print_r($registry->get_all_checks(), true));
```

**Meta Checks:**
```php
$meta_registry = \BlockAccessibility\MetaChecksRegistry::get_instance();
error_log(print_r($meta_registry->get_all_meta_checks(), true));
```

**Editor Checks:**
```php
$editor_registry = \BlockAccessibility\EditorChecksRegistry::get_instance();
error_log(print_r($editor_registry->get_all_editor_checks(), true));
```

### Inspecting JavaScript Configuration

Check what's available in JavaScript:

```javascript
console.log('Block rules:', window.BlockAccessibilityChecks?.validationRules);
console.log('Meta rules:', window.BlockAccessibilityChecks?.metaValidationRules);
console.log('Editor rules:', window.BlockAccessibilityChecks?.editorValidationRules);
console.log('Options:', window.BlockAccessibilityChecks?.blockChecksOptions);
```

## General Tips

- **Double-check spelling** - Block type, check name, post type, and meta key must match exactly
- **Test with different user roles** - Some checks may be role-specific
- **Use browser dev tools** - Check console for errors and network tab for script loading
- **Check for plugin conflicts** - Disable other plugins to test
- **Verify dependencies** - Ensure all required scripts are loaded
- **Check effective check levels** - Use registry methods to verify settings are applied correctly

## Getting Help

If you're still experiencing issues:

1. Check the [Architecture](./architecture.md) page to understand how the systems work
2. Review the [API Reference](./reference/api.md) for correct method usage
3. Check the [Hooks Reference](./reference/hooks.md) for available filters
4. Review code examples in [Examples](./examples.md)
5. Open an issue on the plugin repository

## See Also

- [Block Attributes Validation](./block-validation/quick-start.md)
- [Post Meta Validation](./meta-validation/quick-start.md)
- [Editor Validation](./editor-validation/quick-start.md)
- [API Reference](./reference/api.md)
- [Hooks Reference](./reference/hooks.md)
- [Architecture](./architecture.md)
