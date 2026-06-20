# Advanced Usage

This guide covers advanced patterns and techniques for customizing validation across all three validation systems (Block Attributes, Post Meta, and Editor Validation).

## Conditional Registration

Register checks only for specific scenarios, such as post types or user roles.

### Block Checks

```php
add_action( 'ba11yc_register_checks', function() {
    if ( post_type_exists( 'product' ) ) {
        ba11yc_register_block_check( 'core/image', [
            'namespace'    => 'my-plugin',
            'name'         => 'product_image_requirements',
            'error_msg'    => __( 'Product images must have descriptive alt text.', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => false,
        ] );
    }
} );
```

### Editor Checks

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    if ( post_type_exists( 'product' ) ) {
        ba11yc_register_editor_check( 'product', [
            'namespace'    => 'my-plugin',
            'name'         => 'has_product_image',
            'error_msg'    => __( 'Product posts must include an image block.', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => false,
        ] );
    }
} );
```

## Dynamic Check Configuration

Modify check configuration dynamically using filter hooks before registration.

### Block Checks

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    // Downgrade certain checks to warnings for non-admin users
    if ( ! current_user_can( 'manage_options' )
        && $check_args['level'] === 'error'
        && in_array( $check_name, [ 'optional_accessibility_check' ] )
    ) {
        $check_args['level'] = 'warning';
    }
    return $check_args;
}, 10, 3 );
```

### Meta Checks

```php
add_filter( 'ba11yc_meta_check_args', function( $check_args, $post_type, $meta_key, $check_name ) {
    if ( $meta_key === 'band_origin' && ! current_user_can( 'manage_options' ) ) {
        $check_args['level'] = 'warning';
    }
    return $check_args;
}, 10, 4 );
```

### Editor Checks

```php
add_filter( 'ba11yc_editor_check_args', function( $check_args, $post_type, $check_name ) {
    if ( $check_name === 'max_paragraphs' && ! current_user_can( 'manage_options' ) ) {
        $check_args['level'] = 'warning';
    }
    return $check_args;
}, 10, 3 );
```

## Preventing Check Registration

Conditionally prevent specific checks from being registered.

### Block Checks

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    if ( ! current_user_can( 'manage_options' ) && $check_name === 'advanced_heading_check' ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

### Meta Checks

```php
add_filter( 'ba11yc_should_register_meta_check', function( $should_register, $post_type, $meta_key, $check_name, $check_args ) {
    if ( $check_name === 'required' && $post_type === 'draft' ) {
        return false;
    }
    return $should_register;
}, 10, 5 );
```

### Editor Checks

```php
add_filter( 'ba11yc_should_register_editor_check', function( $should_register, $post_type, $check_name, $check_args ) {
    if ( $check_name === 'first_block_heading' && $post_type === 'draft' ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

## Modifying Check Priority

Adjust the order in which checks are executed.

```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    if ( $check_name === 'image_alt_text' && $block_type === 'core/image' ) {
        $check_args['priority'] = 5; // Lower = runs earlier
    }
    return $check_args;
}, 10, 3 );
```

## Advanced JavaScript Validation

**All validation logic runs in JavaScript.** PHP only handles registration and configuration.

### Multiple Validation Checks (Block)

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
            const hasRequiredBlocks = block.innerBlocks?.some(
                innerBlock => innerBlock.name === 'core/heading'
            );
            return hasRequiredBlocks;
        }

        return isValid;
    }
);
```

### Advanced Meta Validation

```javascript
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/meta-validation',
    (isValid, value, postType, metaKey, checkName) => {
        if (postType !== 'band' || metaKey !== 'band_origin') {
            return isValid;
        }

        if (checkName === 'required') {
            // Custom logic: require city and country
            const parts = value ? value.split(',') : [];
            return parts.length >= 2;
        }

        return isValid;
    }
);
```

### Advanced Editor Validation

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/editor-validation',
    (isValid, blocks, postType, checkName) => {
        if (checkName !== 'complex_structure' || postType !== 'post') {
            return isValid;
        }

        let hasHeading = false;
        let hasImage = false;
        let hasParagraph = false;

        for (const block of blocks) {
            if (block.name === 'core/heading') hasHeading = true;
            if (block.name === 'core/image') hasImage = true;
            if (block.name === 'core/paragraph') hasParagraph = true;
        }

        return hasHeading && hasImage && hasParagraph;
    }
);
```

## Cross-System Integration

```php
// Register block check
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/card', [
        'namespace'    => 'my-plugin',
        'name'         => 'has_title',
        'error_msg'    => 'Card title is required.',
        'level'        => 'error',
        'configurable' => false,
    ] );
} );

// Register meta check
add_action( 'init', function() {
    if ( class_exists( '\BlockAccessibility\Meta\Validator' ) ) {
        register_post_meta( 'post', 'card_category', [
            'validate_callback' => \BlockAccessibility\Meta\Validator::required( 'post', 'card_category', [
                'namespace'    => 'my-plugin',
                'error_msg'    => 'Category is required.',
                'level'        => 'error',
                'configurable' => false,
            ] ),
        ] );
    }
} );

// Register editor check
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', [
        'namespace'    => 'my-plugin',
        'name'         => 'has_first_card',
        'error_msg'    => 'First block must be a card.',
        'level'        => 'error',
        'configurable' => false,
    ] );
} );
```

All three systems work together — if any validation resolves to `'error'` level, post saving is locked.

## Performance Tips

- Use early returns and caching in PHP for expensive checks.
- Minimize JavaScript bundle size by importing only needed modules.
- Test validation logic for edge cases and large content.
- Cache validation results when possible.
- Avoid expensive operations in validation filters.

## See Also

- [Block Attributes Validation](./block-validation/php.md)
- [Post Meta Validation](./meta-validation/php.md)
- [Editor Validation](./editor-validation/php.md)
- [API Reference](./reference/api.md)
- [Hooks Reference](./reference/hooks.md)
