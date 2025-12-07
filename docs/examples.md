# Examples

This guide provides real-world code examples for all three validation systems.

## Block Attributes Validation Examples

### Example: Required Field Check

**PHP:**
```php
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-plugin/card-block', 'card_title_required', [
        'error_msg'   => __( 'Card title is required.', 'my-plugin' ),
        'warning_msg' => __( 'Card title is recommended.', 'my-plugin' ),
        'type'        => 'settings',
        'category'    => 'validation',
    ] );
} );
```

**JavaScript:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
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
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-plugin/card-block', 'content_length', [
        'error_msg'   => __( 'Content is too long (max 500 characters).', 'my-plugin' ),
        'warning_msg' => __( 'Content is long (consider shortening).', 'my-plugin' ),
        'type'        => 'settings',
        'category'    => 'validation',
    ] );
} );
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc_validate_block',
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
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-plugin/card-block', 'title_required', [
        'error_msg' => __( 'Title is required.', 'my-plugin' ),
        'type'      => 'error',
    ] );
    
    $registry->register_check( 'my-plugin/card-block', 'image_alt_required', [
        'error_msg' => __( 'Image alt text is required.', 'my-plugin' ),
        'type'      => 'error',
    ] );
} );
```

**JavaScript:**
```javascript
addFilter(
    'ba11yc_validate_block',
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
                    'type'        => 'settings',
                ]
            )
            : null,
    ]);
});
```

**JavaScript (Optional - uses default validation):**
```javascript
// Default validation checks if value is not empty
// Custom validation example:
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
$validator_class = '\BlockAccessibility\Meta\Validator';
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
                'error_msg' => __( 'Start date is required and must be in YYYY-MM-DD format.', 'my-plugin' ),
                'type'      => 'error',
            ]
        )
        : null,
]);
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
        // Validate date format
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }
);
```

### Example: Using UI Components

**JavaScript:**
```javascript
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { TextControl } from '@wordpress/components';
const { MetaField } = window.BlockAccessibilityChecks || {};

const MyMetaPanel = () => {
    const { meta } = useSelect(select => ({
        meta: select('core/editor').getEditedPostAttribute('meta') || {},
    }));
    
    const { editPost } = useDispatch('core/editor');
    
    return (
        <PluginDocumentSettingPanel name="band-info" title="Band Information">
            <MetaField metaKey="band_origin">
                <TextControl
                    label="City of Origin"
                    value={meta.band_origin || ''}
                    onChange={value => editPost({ meta: { band_origin: value } })}
                />
            </MetaField>
        </PluginDocumentSettingPanel>
    );
};
```

## Editor Validation Examples

### Example: First Block Must Be Heading

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check_for_post_types(
        array( 'post', 'page' ),
        'first_block_heading',
        array(
            'error_msg'   => __( 'The first block must be a Heading.', 'text-domain' ),
            'type'        => 'error',
            'description' => __( 'Ensures content starts with a heading.', 'text-domain' ),
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
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',
        'max_paragraphs',
        array(
            'warning_msg' => __( 'Consider using fewer paragraphs for brevity.', 'text-domain' ),
            'type'        => 'warning',
            'description' => __( 'Warns if there are more than 3 paragraphs.', 'text-domain' ),
        )
    );
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
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',
        'image_followed_by_text',
        array(
            'error_msg' => __( 'Images must be followed by a text description.', 'text-domain' ),
            'type'      => 'error',
        )
    );
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
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-plugin/card', 'has_title', [
        'error_msg' => 'Card title is required.',
        'type'      => 'error',
    ] );
} );

// Meta check
$validator_class = '\BlockAccessibility\Meta\Validator';
$validator_available = class_exists( $validator_class );

register_post_meta( 'post', 'card_category', [
    'validate_callback' => $validator_available
        ? call_user_func(
            array( $validator_class, 'required' ),
            'post',
            'card_category',
            [
                'error_msg' => 'Category is required.',
                'type'      => 'error',
            ]
        )
        : null,
] );

// Editor check
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check( 'post', 'has_first_card', [
        'error_msg' => 'First block must be a card.',
        'type'      => 'error',
    ] );
} );
```

**JavaScript:**
```javascript
import { addFilter } from '@wordpress/hooks';

// Block validation
addFilter(
    'ba11yc_validate_block',
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
