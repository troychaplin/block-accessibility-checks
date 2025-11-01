# Advanced Usage: Block Accessibility Checks Developer API

This guide covers advanced patterns and techniques for customizing accessibility validation and integration using the Block Accessibility Checks developer API.

## Conditional Registration

Register checks only for specific scenarios, such as post types or user roles.

```php
add_action( 'ba11yc_register_checks', function( $registry ) {
    if ( get_post_type() === 'product' ) {
        $registry->register_check( 'core/image', 'product_image_requirements', [
            'error_msg' => __( 'Product images must have descriptive alt text.', 'my-plugin' ),
            'type'      => 'error',
        ] );
    }
} );
```

## Dynamic Check Configuration

Modify check configuration dynamically using filter hooks before registration.

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    // Make certain checks warnings instead of errors for specific roles
    if ( ! current_user_can( 'manage_options' ) && $check_args['type'] === 'error' ) {
        if ( in_array( $check_name, [ 'optional_accessibility_check' ] ) ) {
            $check_args['type'] = 'warning';
        }
    }
    return $check_args;
}, 10, 3 );
```

## Preventing Check Registration

Conditionally prevent specific checks from being registered.

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    // Don't register advanced checks for non-admin users
    if ( ! current_user_can( 'manage_options' ) && $check_name === 'advanced_heading_check' ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

## Modifying Check Priority

Adjust the order in which checks are executed.

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    // Run critical checks first
    if ( $check_name === 'image_alt_text' && $block_type === 'core/image' ) {
        $check_args['priority'] = 5; // Lower = runs earlier
    }
    return $check_args;
}, 10, 3 );
```

## Advanced JavaScript Validation

**All validation logic runs in JavaScript.** The `ba11yc.validateBlock` filter is the central point for implementing validation checks. PHP only handles registration and configuration.

### Multiple Validation Checks

Handle multiple checks for the same block in a single filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName, rule, block) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        
        switch (checkName) {
            case 'title_required':
                return !!(attributes.title && attributes.title.trim());
                
            case 'content_length':
                const content = attributes.content || '';
                return content.length <= 500;
                
            case 'image_alt':
                return !!(attributes.imageAlt && attributes.imageAlt.trim());
                
            default:
                return isValid;
        }
    }
);
```

### Custom Validation Results

For complex scenarios, return a result object instead of a boolean:

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/advanced-validation',
    (isValid, blockType, attributes, checkName, rule) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        
        if (checkName === 'complex_validation') {
            const issues = validateComplexRule(attributes, rule);
            
            if (issues.length > 0) {
                return {
                    isValid: false,
                    mode: 'error',
                    message: rule.error_msg,
                    data: { issues }
                };
            }
        }
        
        return isValid;
    }
);
```

### Accessing Block Context

The full block object is available as the last parameter:

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/context-aware-validation',
    (isValid, blockType, attributes, checkName, rule, block) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        
        if (checkName === 'nested_content_check') {
            // Access inner blocks for complex validation
            const hasRequiredBlocks = block.innerBlocks.some(
                innerBlock => innerBlock.name === 'core/heading'
            );
            return hasRequiredBlocks;
        }
        
        return isValid;
    }
);
```

## Performance Tips
- Use early returns and caching in PHP for expensive checks
- Minimize JavaScript bundle size by importing only needed modules
- Test validation logic for edge cases and large content

## See Also
- [Quick Start Guide](./quick-start.md)
- [API Reference](./api-reference.md)
- [Hooks Reference](./hooks.md)
