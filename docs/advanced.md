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

## Dynamic Configuration

Modify check configuration dynamically using filter hooks.

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

## Custom Result Processing

Add contextual information or modify results before they are displayed.

```php
add_filter( 'ba11yc_block_check_results', function( $results, $block_type, $attributes, $content ) {
    foreach ( $results as &$result ) {
        if ( $result['check_name'] === 'heading_hierarchy' ) {
            $result['context'] = [
                'post_type' => get_post_type(),
                'current_user_role' => wp_get_current_user()->roles[0] ?? 'subscriber'
            ];
        }
    }
    return $results;
}, 10, 4 );
```

## Block Attribute Preprocessing

Normalize or modify block attributes before validation runs.

```php
add_filter( 'ba11yc_block_attributes', function( $attributes, $block_type, $content ) {
    if ( $block_type === 'core/image' ) {
        if ( ! isset( $attributes['alt'] ) ) {
            $attributes['alt'] = '';
        }
        $attributes['alt'] = trim( $attributes['alt'] );
    }
    return $attributes;
}, 10, 3 );
```

## Advanced JavaScript Integration

Handle multiple rules, custom result objects, and advanced feedback in JS.

```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/advanced-validation',
    (isValid, blockType, attributes, checkName, rule) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        // Example: Return custom result object for advanced feedback
        if (checkName === 'complex_validation') {
            const valid = validateComplexRule(attributes, rule);
            if (!valid) {
                return {
                    isValid: false,
                    mode: 'error',
                    message: rule.message,
                    data: { details: 'Additional context here' }
                };
            }
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
