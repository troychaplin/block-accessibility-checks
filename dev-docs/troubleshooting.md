# Troubleshooting Guide

Common issues, debugging tools, performance considerations, and solutions to typical integration problems with Block Accessibility Checks.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Debugging Tools](#debugging-tools)
3. [Performance Optimization](#performance-optimization)
4. [Getting Help](#getting-help)

## Common Issues

### Visual Indicators Not Showing

**Problem:** Your custom block checks are working for publish blocking, but visual error indicators aren't appearing in the block editor.

**Symptoms:**
- Validation logic runs and blocks publishing
- No red/yellow borders around invalid blocks
- No error messages in the inspector panel

**Solutions:**

1. **Check JavaScript Integration**
   ```javascript
   // ✅ Correct: Return proper result object
   function checkMyBlock(block) {
       if (block.name !== 'my/block') {
           return { isValid: true };
       }

       const isValid = performValidation(block.attributes);

       if (!isValid) {
           return {
               isValid: false,
               mode: 'error', // Important: must be 'error', 'warning', or 'info'
               clientId: block.clientId,
               name: block.name,
               message: 'Specific error message',
           };
       }

       return { isValid: true };
   }

   // ❌ Wrong: Returning just true/false
   function checkMyBlock(block) {
       return block.attributes.requiredField ? false : true; // This won't show visual indicators
   }
   ```

2. **Verify Check Registration**
   ```php
   // Ensure your check is properly registered
   function my_plugin_register_checks($registry) {
       $success = $registry->register_check('my/block', 'my_check', [
           'error_msg' => 'This field is required.',
           'type' => 'settings', // or 'error', 'warning'
           'enabled' => true,
       ]);

       if (!$success) {
           error_log('Failed to register accessibility check');
       }
   }
   ```

3. **Check Script Dependencies**
   ```php
   // Ensure proper load order
   wp_enqueue_script(
       'my-block-validation',
       plugins_url('build/validation.js', __FILE__),
       array('block-accessibility-checks-script'), // Key dependency
       '1.0.0',
       true
   );
   ```

### JavaScript Checks Not Running

**Problem:** Your JavaScript validation doesn't seem to be running at all.

**Symptoms:**
- No console logs from your validation function
- No validation errors or warnings
- Checks appear in admin settings but don't work in editor

**Solutions:**

1. **Check Load Order and Dependencies**
   ```javascript
   // ✅ Ensure proper load order
   wp_enqueue_script(
       'my-block-validation',
       plugins_url('build/validation.js', __FILE__),
       array('wp-hooks', 'block-accessibility-checks-script'), // Important dependencies
       '1.0.0',
       true
   );

   // ✅ Check if filter is being added correctly
   if (window.wp && window.wp.hooks) {
       wp.hooks.addFilter(
           'ba11yc.validateBlock',
           'my-plugin/validation',
           function (isValid, blockType, attributes, checkName, rule) {
               console.log('Validation called for:', blockType, checkName);

               if (blockType === 'my-plugin/custom-block' && checkName === 'my_check') {
                   return attributes.content && attributes.content.trim().length > 0;
               }

               return isValid;
           }
       );
   }
   ```

2. **Verify Block Type Matching**
   ```javascript
   // Ensure your block type matches exactly
   addFilter(
       'ba11yc.validateBlock',
       'my-plugin/validation',
       (isValid, blockType, attributes, checkName, rule) => {
           console.log('Block type:', blockType); // Debug the actual block type
           
           // Use exact match
           if (blockType !== 'my-plugin/custom-block') {
               return isValid;
           }
           
           // Your validation logic here
       }
   );
   ```

3. **Check Plugin Availability**
   ```php
   // Ensure Block Accessibility Checks is available
   function my_plugin_init() {
       if (!function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
           error_log('Block Accessibility Checks plugin not available');
           return;
       }

       add_action('ba11yc_register_checks', 'my_register_checks');
   }
   add_action('plugins_loaded', 'my_plugin_init');
   ```

### PHP Checks Not Registering

**Problem:** Your PHP checks aren't being registered.

**Symptoms:**
- Checks don't appear in admin settings
- No error messages in logs
- Plugin seems to ignore your registration

**Solutions:**

1. **Verify Hook Timing**
   ```php
   // ✅ Check if plugin is available
   function my_plugin_init() {
       if (!function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
           error_log('Block Accessibility Checks plugin not available');
           return;
       }

       add_action('ba11yc_register_checks', 'my_register_checks');
   }
   add_action('plugins_loaded', 'my_plugin_init');

   function my_register_checks($registry) {
       error_log('Registering checks...'); // Debug output

       $success = $registry->register_check('my/block', 'my_check', [
           'error_msg' => 'Error message',
           'type' => 'error'
       ]);

       if (!$success) {
           error_log('Failed to register check');
       }
   }
   ```

2. **Check Hook Priority**
   ```php
   // Use appropriate hook priority
   add_action('ba11yc_register_checks', 'my_register_checks', 10); // Default priority
   
   // Or use a later priority if needed
   add_action('ba11yc_register_checks', 'my_register_checks', 20);
   ```

3. **Verify Function Names**
   ```php
   // Ensure function names are unique
   function my_unique_plugin_register_checks($registry) {
       // Your registration logic
   }
   add_action('ba11yc_register_checks', 'my_unique_plugin_register_checks');
   ```

### JavaScript Validation Not Working

**Problem:** Your `ba11yc.validateBlock` filter is not being called.

**Symptoms:**
- No console logs from your validation function
- Validation rules exist but don't trigger
- No visual feedback in editor

**Solutions:**

1. **Check Script Context**
   ```php
   // Ensure your script runs in the block editor
   function enqueue_validation_script() {
       // Only in block editor
       if (!is_admin() || !function_exists('get_current_screen')) {
           return;
       }

       $screen = get_current_screen();
       if (!$screen || !$screen->is_block_editor()) {
           return;
       }

       wp_enqueue_script('my-validation-script', /* ... */);
   }
   add_action('admin_enqueue_scripts', 'enqueue_validation_script');
   ```

2. **Verify Filter Registration**
   ```javascript
   // Check if filter is registered
   console.log('Available filters:', wp.hooks.filters);
   
   // Manually test filter
   wp.hooks.addFilter(
       'ba11yc.validateBlock',
       'my-plugin/test',
       function (isValid, blockType, attributes, checkName, rule) {
           console.log('Test filter called:', { blockType, checkName });
           return isValid;
       }
   );
   ```

3. **Check for JavaScript Errors**
   ```javascript
   // Add error handling
   try {
       addFilter(
           'ba11yc.validateBlock',
           'my-plugin/validation',
           (isValid, blockType, attributes, checkName, rule) => {
               // Your validation logic
           }
       );
   } catch (error) {
       console.error('Failed to register validation filter:', error);
   }
   ```

## Debugging Tools

### Enable Debug Logging

```php
// Add to wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Add debug info to your checks
function my_debug_check($attributes, $content, $config) {
    error_log(sprintf(
        'Checking block: %s, attributes: %s',
        $config['block_type'] ?? 'unknown',
        json_encode($attributes)
    ));

    $result = perform_actual_check($attributes, $content, $config);

    error_log(sprintf('Check result: %s', $result ? 'FAIL' : 'PASS'));

    return $result;
}
```

### JavaScript Console Debugging

```javascript
// Add debugging to your validation function
function checkMyBlock(block) {
    console.group(`Validating block: ${block.name}`);
    console.log('Attributes:', block.attributes);
    console.log('Validation rules:', window.BlockAccessibilityChecks?.validationRules);

    const result = performValidation(block);

    console.log('Validation result:', result);
    console.groupEnd();

    return result;
}

// Debug validation rules
function debugValidationRules() {
    const rules = window.BlockAccessibilityChecks?.validationRules || {};
    console.log('Available validation rules:', rules);
    
    // Check specific block type
    const myBlockRules = rules['my-plugin/custom-block'] || {};
    console.log('My block rules:', myBlockRules);
}
```

### Registry Inspection

```php
// Add this to a plugin or theme functions.php for debugging
function inspect_accessibility_registry() {
    if (!function_exists('BlockAccessibility\\BlockChecksRegistry::get_instance')) {
        return;
    }

    $registry = \BlockAccessibility\BlockChecksRegistry::get_instance();

    echo '<h3>Registered Block Types:</h3>';
    echo '<pre>' . print_r($registry->get_registered_block_types(), true) . '</pre>';

    echo '<h3>All Checks:</h3>';
    echo '<pre>' . print_r($registry->get_all_checks(), true) . '</pre>';
}

// Add to admin page or use in wp-admin/admin.php?page=debug
```

### Browser Developer Tools

1. **Console Tab**: Check for JavaScript errors and debug logs
2. **Network Tab**: Verify scripts are loading in correct order
3. **Sources Tab**: Set breakpoints in your validation functions
4. **Elements Tab**: Inspect block elements for validation classes

```javascript
// Add this to browser console to inspect current state
function inspectCurrentState() {
    console.log('Block Accessibility Checks:', window.BlockAccessibilityChecks);
    console.log('Validation Rules:', window.BlockAccessibilityChecks?.validationRules);
    console.log('Current Blocks:', wp.data.select('core/block-editor').getBlocks());
}
```

## Performance Optimization

### Optimize Check Functions

```php
// ✅ Efficient check function
function optimized_check($attributes, $content, $config) {
    // Early returns for better performance
    if (empty($attributes)) {
        return false;
    }

    // Cache expensive operations
    static $cache = array();
    $cache_key = md5(serialize($attributes));

    if (isset($cache[$cache_key])) {
        return $cache[$cache_key];
    }

    // Perform expensive validation...
    $result = expensive_validation($attributes);

    $cache[$cache_key] = $result;
    return $result;
}
```

### Minimize JavaScript Bundle Size

```javascript
// ✅ Import only what you need
import { addFilter } from '@wordpress/hooks';

// ❌ Avoid importing entire libraries
// import * as wp from '@wordpress/element';

// ✅ Use tree shaking
import { useEffect, useState } from '@wordpress/element';
```

### Efficient Validation Patterns

```javascript
// ✅ Efficient validation with early returns
function validateEfficiently(attributes) {
    // Early return for missing data
    if (!attributes || !attributes.content) {
        return false;
    }
    
    // Early return for empty content
    if (!attributes.content.trim()) {
        return false;
    }
    
    // Only perform expensive operations if needed
    if (attributes.content.length > 1000) {
        return performExpensiveValidation(attributes.content);
    }
    
    return true;
}

// ❌ Inefficient validation
function validateInefficiently(attributes) {
    // Always performs expensive operations
    const expensiveResult = performExpensiveValidation(attributes.content);
    
    // Then checks simple conditions
    if (!attributes.content) {
        return false;
    }
    
    return expensiveResult;
}
```

### Caching Strategies

```javascript
// Cache validation results
const validationCache = new Map();

function cachedValidation(blockType, attributes, checkName) {
    const cacheKey = `${blockType}-${checkName}-${JSON.stringify(attributes)}`;
    
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
    // Perform validation
    const result = performValidation(attributes);
    validationCache.set(cacheKey, result);
    
    return result;
}

// Clear cache periodically
setInterval(() => {
    validationCache.clear();
}, 5 * 60 * 1000); // Clear every 5 minutes
```

## Getting Help

### Before Asking for Help

1. **Check the Documentation**: Review the [Quick Start Guide](quick-start.md) and [API Reference](api-reference.md)
2. **Enable Debug Logging**: Use the debugging tools above to gather information
3. **Test with Minimal Example**: Create a simple test case to isolate the issue
4. **Check Browser Console**: Look for JavaScript errors or warnings
5. **Verify Plugin Compatibility**: Ensure you're using compatible versions

### Information to Include

When asking for help, include:

1. **WordPress Version**: Your WordPress version
2. **Plugin Version**: Block Accessibility Checks plugin version
3. **Error Messages**: Any error messages from logs or console
4. **Code Example**: Minimal code that reproduces the issue
5. **Expected vs Actual**: What you expected vs what actually happened
6. **Steps to Reproduce**: Clear steps to reproduce the issue

### Example Help Request

```
WordPress Version: 6.4
Block Accessibility Checks Version: 1.2.0
Issue: Visual indicators not showing for custom block

Expected: Red border around invalid blocks
Actual: No visual feedback, but validation logic works

Steps to Reproduce:
1. Register check for 'my-plugin/custom-block'
2. Implement JavaScript validation
3. Create invalid block in editor
4. No visual indicators appear

Code:
[Include your PHP registration and JavaScript validation code]

Console Output:
[Include any relevant console logs or errors]
```

### Resources

- **Working Example**: [Block Check Integration Example](https://github.com/troychaplin/block-check-integration-example)
- **Documentation**: [Quick Start Guide](quick-start.md), [API Reference](api-reference.md)
- **Integration Examples**: [Integration Examples](integration-examples.md)
- **JavaScript Guide**: [JavaScript Validation Guide](javascript-validation.md)

### Common Solutions

#### Issue: "Plugin not available" error

**Solution:** Ensure Block Accessibility Checks plugin is installed and activated before your plugin loads.

#### Issue: Scripts not loading in correct order

**Solution:** Use proper dependencies in `wp_enqueue_script()` and ensure your script loads after `block-accessibility-checks-script`.

#### Issue: Validation rules not appearing in admin

**Solution:** Check that your check registration uses the correct hook (`ba11yc_register_checks`) and that the plugin is available when the hook fires.

#### Issue: Visual feedback not working

**Solution:** Ensure your JavaScript validation function returns `false` for invalid blocks and that your check is properly registered with the correct block type.

---

For more detailed information, see the [JavaScript Validation Guide](javascript-validation.md) for debugging techniques and the [Integration Examples](integration-examples.md) for working code examples. 