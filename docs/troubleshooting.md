# Troubleshooting: Block Accessibility Checks Developer API

This guide covers common issues, debugging tips, and solutions for developers integrating with the Block Accessibility Checks plugin.

## Common Issues & Solutions

### Visual Indicators Not Showing
**Problem:** Validation works, but error/warning borders or messages do not appear in the block editor.
**Solution:** Ensure your JavaScript validation returns the correct result and is loaded after the core plugin script.

### JavaScript Checks Not Running
**Problem:** Your validation logic is not being called.
**Solution:**
- Confirm your script is enqueued with the correct dependencies (`block-accessibility-script`)
- Use the `enqueue_block_editor_assets` action
- Check for typos in block type and check name

### PHP Checks Not Registering
**Problem:** Your checks are not appearing in the settings UI or registry.
**Solution:**
- Register checks in the `ba11yc_ready` or `ba11yc_register_checks` action
- Confirm the plugin is active and registry is available

### Validation Not Blocking Publishing
**Problem:** Errors do not prevent publishing as expected.
**Solution:**
- Ensure your check is registered with `'type' => 'error'`
- Confirm your JS validation returns `false` for failed checks

## Debugging Tools & Tips

### Enable Debug Logging
Add to `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Debugging PHP Registration
Add logging to your registration function:
```php
function my_plugin_register_checks($registry) {
    error_log('Registering checks...');
    $registry->register_check(...);
}
```

### Debugging JavaScript Validation
Add console output to your validation function:
```javascript
function validateBlock(block) {
    console.log('Validating block:', block);
    // ...validation logic...
}
```

### Inspecting the Registry
Print registered checks for debugging:
```php
$registry = \BlockAccessibility\BlockChecksRegistry::get_instance();
error_log(print_r($registry->get_all_checks(), true));
```

## Tips
- Double-check block type and check name spelling
- Test with different user roles and post types
- Use browser dev tools for JS debugging
- Check for plugin conflicts or missing dependencies

## See Also
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [Advanced Usage](./advanced.md)
