# Examples

This guide provides real-world code examples for all three validation systems.

## Block Attributes Validation Examples

### Example: Required Field Check

**PHP:**
```php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/card-block', [
        'namespace'    => 'my-plugin',
        'name'         => 'card_title_required',
        'error_msg'    => __( 'Card title is required.', 'my-plugin' ),
        'warning_msg'  => __( 'Card title is recommended.', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => true,
        'category'     => 'validation',
    ] );
} );
```

**JavaScript:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/card-block-validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/card-block') {
            return isValid;
        }
        if (checkName === 'card_title_required') {
            return !!(attributes.title && attributes.title.trim());
        }
        return isValid;
    }
);
```

### Example: Content Length Check

**PHP:**
```php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/card-block', [
        'namespace'    => 'my-plugin',
        'name'         => 'content_length',
        'error_msg'    => __( 'Content is too long (max 500 characters).', 'my-plugin' ),
        'warning_msg'  => __( 'Content is long (consider shortening).', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => true,
        'category'     => 'validation',
    ] );
} );
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/content-length',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/card-block' || checkName !== 'content_length') {
            return isValid;
        }
        const content = attributes.content || '';
        return content.length <= 500;
    }
);
```

### Example: Multiple Checks

**PHP:**
```php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/card-block', [
        'namespace'    => 'my-plugin',
        'name'         => 'title_required',
        'error_msg'    => __( 'Title is required.', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => false,
    ] );

    ba11yc_register_block_check( 'my-plugin/card-block', [
        'namespace'    => 'my-plugin',
        'name'         => 'image_alt_required',
        'error_msg'    => __( 'Image alt text is required.', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => false,
    ] );
} );
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/multiple-checks',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/card-block') {
            return isValid;
        }

        switch (checkName) {
            case 'title_required':
                return !!(attributes.title && attributes.title.trim());
            case 'image_alt_required':
                return !!(attributes.imageAlt && attributes.imageAlt.trim());
            default:
                return isValid;
        }
    }
);
```

## Post Meta Validation Examples

### Example: Required Meta Field

**PHP:**
```php
add_action( 'init', function() {
    $validator_class     = '\BlockAccessibility\Meta\Validator';
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
                    'level'        => 'error',
                    'configurable' => true,
                ]
            )
            : null,
    ]);
});
```

**JavaScript (Optional - custom validation):**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_meta',
    'my-plugin/meta-validation',
    (isValid, value, postType, metaKey, checkName) => {
        if (postType !== 'band' || metaKey !== 'band_origin' || checkName !== 'required') {
            return isValid;
        }
        // Custom: require city and country
        const parts = value ? value.split(',') : [];
        return parts.length >= 2;
    }
);
```

### Example: Date Format Validation

**PHP:**
```php
add_action( 'init', function() {
    $validator_class     = '\BlockAccessibility\Meta\Validator';
    $validator_available = class_exists( $validator_class );

    register_post_meta( 'band', 'band_start_date', [
        'single'            => true,
        'type'              => 'string',
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_text_field',
        'validate_callback' => $validator_available
            ? call_user_func(
                array( $validator_class, 'required' ),
                'band',
                'band_start_date',
                [
                    'namespace'    => 'my-plugin',
                    'error_msg'    => __( 'Start date is required and must be in YYYY-MM-DD format.', 'my-plugin' ),
                    'level'        => 'error',
                    'configurable' => false,
                ]
            )
            : null,
    ]);
});
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/date-validation',
    (isValid, value, postType, metaKey, checkName) => {
        if (postType !== 'band' || metaKey !== 'band_start_date' || checkName !== 'required') {
            return isValid;
        }
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }
);
```

## Editor Validation Examples

### Example: Post/Page Title Required (Built-in Core Check)

This example shows how the built-in post title validation works. It's included with the plugin and demonstrates real-time title validation.

**PHP Registration:**
```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace'    => 'block-accessibility-checks',
        'name'         => 'post_title_required',
        'error_msg'    => __( 'A post title is required for accessibility and SEO.', 'block-accessibility-checks' ),
        'warning_msg'  => __( 'Consider adding a post title for better accessibility and SEO.', 'block-accessibility-checks' ),
        'description'  => __( 'Ensures posts have a descriptive title.', 'block-accessibility-checks' ),
        'level'        => 'error',
        'configurable' => true,
        'priority'     => 5,
    ) );

    ba11yc_register_editor_check( 'page', array(
        'namespace'    => 'block-accessibility-checks',
        'name'         => 'post_title_required',
        'error_msg'    => __( 'A page title is required for accessibility and SEO.', 'block-accessibility-checks' ),
        'warning_msg'  => __( 'Consider adding a page title for better accessibility and SEO.', 'block-accessibility-checks' ),
        'description'  => __( 'Ensures pages have a descriptive title.', 'block-accessibility-checks' ),
        'level'        => 'error',
        'configurable' => true,
        'priority'     => 5,
    ) );
} );
```

**JavaScript Validation:**
```javascript
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

addFilter(
    'ba11yc_validate_editor',
    'ba11yc/post-title-validation',
    (isValid, blocks, postType, checkName) => {
        if (checkName !== 'post_title_required') {
            return isValid;
        }

        const title = select('core/editor')?.getEditedPostAttribute('title');
        return !!(title && title.trim().length > 0);
    }
);
```

### Example: First Block Must Be Heading

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function() {
    \BlockAccessibility\Editor\Registry::get_instance()->register_editor_check_for_post_types(
        array( 'post', 'page' ),
        'first_block_heading',
        array(
            'namespace'    => 'my-plugin',
            'error_msg'    => __( 'The first block must be a Heading.', 'text-domain' ),
            'description'  => __( 'Ensures content starts with a heading.', 'text-domain' ),
            'level'        => 'error',
            'configurable' => false,
        )
    );
} );
```

**JavaScript:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/first-block-heading',
    (isValid, blocks, postType, checkName) => {
        if (checkName !== 'first_block_heading' || (postType !== 'post' && postType !== 'page')) {
            return isValid;
        }

        if (blocks.length === 0) {
            return true; // Empty editor is valid
        }

        return blocks[0].name === 'core/heading';
    }
);
```

### Example: Limit Paragraph Count

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace'    => 'my-plugin',
        'name'         => 'max_paragraphs',
        'warning_msg'  => __( 'Consider using fewer paragraphs for brevity.', 'text-domain' ),
        'description'  => __( 'Warns if there are more than 3 paragraphs.', 'text-domain' ),
        'level'        => 'warning',
        'configurable' => true,
    ) );
} );
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/max-paragraphs',
    (isValid, blocks, postType, checkName) => {
        if (checkName !== 'max_paragraphs' || postType !== 'post') {
            return isValid;
        }

        const paragraphCount = blocks.reduce((count, block) => {
            return block.name === 'core/paragraph' ? count + 1 : count;
        }, 0);

        return paragraphCount <= 3;
    }
);
```

### Example: Image Followed by Text

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace'    => 'my-plugin',
        'name'         => 'image_followed_by_text',
        'error_msg'    => __( 'Images must be followed by a text description.', 'text-domain' ),
        'level'        => 'error',
        'configurable' => false,
    ) );
} );
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/image-followed-by-text',
    (isValid, blocks, postType, checkName) => {
        if (checkName !== 'image_followed_by_text' || postType !== 'post') {
            return isValid;
        }

        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].name === 'core/image') {
                const nextBlock = blocks[i + 1];
                if (!nextBlock || nextBlock.name !== 'core/paragraph') {
                    return false;
                }
            }
        }

        return true;
    }
);
```

## Complete Integration Example

A complete example showing all three validation systems working together:

**PHP:**
```php
// Block check
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/card', [
        'namespace'    => 'my-plugin',
        'name'         => 'has_title',
        'error_msg'    => 'Card title is required.',
        'level'        => 'error',
        'configurable' => false,
    ] );
} );

// Meta check
add_action( 'init', function() {
    $validator_class = '\BlockAccessibility\Meta\Validator';
    if ( class_exists( $validator_class ) ) {
        register_post_meta( 'post', 'card_category', [
            'validate_callback' => $validator_class::required( 'post', 'card_category', [
                'namespace'    => 'my-plugin',
                'error_msg'    => 'Category is required.',
                'level'        => 'error',
                'configurable' => false,
            ] ),
        ] );
    }
} );

// Editor check
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

**JavaScript:**
```javascript
import { addFilter } from '@wordpress/hooks';

// Block validation
addFilter(
    'ba11yc.validateBlock',
    'my-plugin/block-validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType === 'my-plugin/card' && checkName === 'has_title') {
            return !!(attributes.title && attributes.title.trim());
        }
        return isValid;
    }
);

// Meta validation
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/meta-validation',
    (isValid, value, postType, metaKey, checkName) => {
        if (postType === 'post' && metaKey === 'card_category' && checkName === 'required') {
            return !!(value && value.trim());
        }
        return isValid;
    }
);

// Editor validation
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/editor-validation',
    (isValid, blocks, postType, checkName) => {
        if (checkName === 'has_first_card' && postType === 'post') {
            return blocks.length > 0 && blocks[0].name === 'my-plugin/card';
        }
        return isValid;
    }
);
```

## Working Example Plugin

For a complete working example, see:
- [Block Check Integration Example](https://github.com/troychaplin/block-check-integration-example)

## See Also

- [Block Attributes Validation](./block-validation/quick-start.md)
- [Post Meta Validation](./meta-validation/quick-start.md)
- [Editor Validation](./editor-validation/quick-start.md)
- [API Reference](./reference/api.md)
- [Hooks Reference](./reference/hooks.md)
