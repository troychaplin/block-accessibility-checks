# Troubleshooting

This guide covers common issues, debugging tips, and solutions for developers integrating with the Block Accessibility Checks plugin across all three validation systems.

## Common Issues & Solutions

### Block Attributes Validation

#### Visual Indicators Not Showing
**Problem:** Validation works, but error/warning icons/badges or messages do not appear in the block editor.

**Solution:**
- Ensure your JavaScript validation returns the correct result.
- Verify your script is loaded after the core plugin script (`block-accessibility-script` dependency).
- Check browser console for JavaScript errors.
- Verify the check is enabled and not set to `'none'`.
- Check if the block is selected (some indicators may only show on selection).

#### JavaScript Checks Not Running
**Problem:** Your validation logic is not being called.

**Solution:**
- Confirm your script is enqueued with the correct dependencies.
- Conditionally add `'block-accessibility-script'` only if it's registered:
  ```php
  if ( wp_script_is( 'block-accessibility-script', 'registered' ) ) {
      $dependencies[] = 'block-accessibility-script';
  }
  ```
- Use the `enqueue_block_editor_assets` action.
- Check for typos in block type and check name.
- Verify the check is registered in PHP.
- Check browser console for JavaScript errors.

#### PHP Checks Not Registering
**Problem:** Your checks are not appearing in the settings UI or registry.

**Solution:**
- Register checks in `ba11yc_ready` or `ba11yc_register_checks`. Ensure `namespace`, `name`, and `error_msg` are all present in `$args`.
- Confirm the plugin is active and the global function `ba11yc_register_block_check()` is available.
- Check PHP error logs for registration errors.

#### Validation Not Blocking Publishing
**Problem:** Errors do not prevent publishing as expected.

**Solution:**
- Ensure your check resolves to `'error'` level (either `'level' => 'error'` in registration or the admin hasn't overridden it to `'warning'`/`'none'`).
- Confirm your JS validation returns `false` for failed checks.
- Verify the effective check level with `get_effective_check_level()`.

### Post Meta Validation

#### Check Not Appearing in Settings
**Problem:** Meta validation check doesn't appear in admin settings.

**Solution:**
- Ensure `'configurable' => true` is set. Checks with `configurable: false` are intentionally excluded from the settings table.
- Verify the check is being registered (check PHP errors).
- If the Block Accessibility Checks plugin is deactivated, use a conditional check:
  ```php
  $validator_class = '\BlockAccessibility\Meta\Validator';
  $validator_available = class_exists( $validator_class );
  ```
- Clear WordPress cache and reload admin page.

#### Validation Not Working
**Problem:** Meta field validation doesn't work in the editor.

**Solution:**
- Check that `show_in_rest` is `true` in `register_post_meta()`.
- Verify JavaScript filter is loaded in block editor.
- Check browser console for JavaScript errors.
- Ensure post type supports the meta field.

#### Post Not Locking
**Problem:** Post can still be saved when meta validation fails.

**Solution:**
- Verify the check resolves to `'error'` level in settings.
- Check that JavaScript validation is returning `false`.
- Check that the effective check level is `'error'` via `get_effective_meta_check_level()`.

### Editor Validation

#### Check Not Running
**Problem:** Editor validation logic is not being called.

**Solution:**
- Verify the check is registered in PHP using `ba11yc_editor_checks_ready`.
- Confirm your script is enqueued with correct dependencies.
- Check for typos in post type and check name.
- Verify the check is enabled.

#### Validation Not Blocking Publishing
**Problem:** Editor validation errors don't prevent publishing.

**Solution:**
- Ensure your check resolves to `'error'` level.
- Confirm your JS validation returns `false` for failed checks.
- Verify the effective check level is `'error'`.

## Debugging Tools & Tips

### Enable Debug Logging

Add to `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Debugging PHP Registration

**Block Checks:**
```php
add_action( 'ba11yc_ready', function() {
    error_log('Registering block checks...');
    ba11yc_register_block_check( 'my-plugin/block', [
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Test message',
        'level'     => 'error',
    ] );
} );
```

**Meta Checks:**
```php
use BlockAccessibility\Meta\Validator;

add_action( 'init', function() {
    if ( class_exists( '\BlockAccessibility\Meta\Validator' ) ) {
        register_post_meta( 'post', 'meta_key', [
            'validate_callback' => \BlockAccessibility\Meta\Validator::required( 'post', 'meta_key', [
                'namespace' => 'my-plugin',
                'error_msg' => 'Test message',
                'level'     => 'error',
            ] ),
        ] );
        error_log('Meta check registered');
    }
} );
```

**Editor Checks:**
```php
add_action( 'ba11yc_editor_checks_ready', function() {
    error_log('Registering editor checks...');
    ba11yc_register_editor_check( 'post', [
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Test message',
        'level'     => 'error',
    ] );
} );
```

### Debugging JavaScript Validation

**Block Validation:**
```javascript
addFilter(
    'ba11yc.validateBlock',
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
        console.log('Result:', isValid);
        return isValid;
    }
);
```

### Inspecting the Registry

**Block Checks:**
```php
$registry = \BlockAccessibility\Block\Registry::get_instance();
error_log( print_r( $registry->get_all_checks(), true ) );
```

**Meta Checks:**
```php
$meta_registry = \BlockAccessibility\Meta\Registry::get_instance();
error_log( print_r( $meta_registry->get_all_meta_checks(), true ) );
```

**Editor Checks:**
```php
$editor_registry = \BlockAccessibility\Editor\Registry::get_instance();
error_log( print_r( $editor_registry->get_all_editor_checks(), true ) );
```

### Inspecting JavaScript Configuration

Check what configuration was injected into the editor:

```javascript
import { select } from '@wordpress/data';
const { blockA11yChecks } = select( 'core/editor' ).getEditorSettings();
console.log('Block checks:', blockA11yChecks?.block);
console.log('Meta checks:', blockA11yChecks?.meta);
console.log('Editor checks:', blockA11yChecks?.editor);
```

## General Tips

- **Double-check spelling** — Block type, check name, post type, and meta key must match exactly.
- **Test with different user roles** — Some checks may be role-specific.
- **Use browser dev tools** — Check console for errors and network tab for script loading.
- **Check for plugin conflicts** — Disable other plugins to test.
- **Verify dependencies** — Ensure all required scripts are loaded.
- **Check effective check levels** — Use registry methods to verify settings are applied correctly.

## Getting Help

If you're still experiencing issues:

1. Check the [Architecture](./architecture.md) page to understand how the systems work.
2. Review the [API Reference](./reference/api.md) for correct method usage.
3. Check the [Hooks Reference](./reference/hooks.md) for available filters.
4. Review code examples in [Examples](./examples.md).
5. Open an issue on the plugin repository.

## See Also

- [Block Attributes Validation](./block-validation/quick-start.md)
- [Post Meta Validation](./meta-validation/quick-start.md)
- [Editor Validation](./editor-validation/quick-start.md)
- [API Reference](./reference/api.md)
- [Hooks Reference](./reference/hooks.md)
- [Architecture](./architecture.md)
