# Quick Start: Post Meta Validation

Post meta validation allows you to validate data stored in WordPress post meta fields rather than directly in block attributes. This is useful for validating global post settings, custom fields, or data that affects multiple blocks across a post.

## When to Use This Approach

Use post meta validation when you need to:

- Validate custom fields or post meta values
- Check post-level settings that affect accessibility
- Validate data shared across multiple blocks in a post
- Ensure required post metadata is present before publishing

## Implementation Steps

### Step 1: Register Your Check in PHP

Register your validation check targeting a specific block type. The check will validate post meta rather than block attributes.

```php
if ( function_exists( 'ba11yc_init_plugin' ) ) {
    add_action( 'ba11yc_ready', 'my_plugin_register_meta_checks' );
}

function my_plugin_register_meta_checks( $registry ) {
    $registry->register_block_check(
        'core/post-content', // Or your custom block type
        'featured_image_required',
        array(
            'error_msg'   => __( 'Featured image is required for this post type.', 'my-plugin' ),
            'warning_msg' => __( 'Featured image is recommended for better social sharing.', 'my-plugin' ),
            'description' => __( 'Ensures posts have featured images for accessibility and SEO.', 'my-plugin' ),
            'type'        => 'settings',
            'category'    => 'accessibility',
            'priority'    => 5,
        )
    );
}
```

### Step 2: Implement Validation Logic in JavaScript

Use the WordPress data store to access post meta values and validate them.

```javascript
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        // Only handle our specific check
        if ( checkName !== 'featured_image_required' ) {
            return isValid;
        }

        // Get the current post's featured image ID
        const featuredImageId = select( 'core/editor' ).getEditedPostAttribute( 'featured_media' );

        // Validate that a featured image is set
        if ( ! featuredImageId || featuredImageId === 0 ) {
            return false;
        }

        return true;
    }
);
```

### Step 3: Enqueue Your Validation Script

Ensure your JavaScript validation file is loaded with the necessary dependencies, including WordPress data stores.

```php
function my_plugin_enqueue_meta_validation_scripts() {
    wp_enqueue_script(
        'my-plugin-meta-validation',
        plugins_url( 'build/meta-validation.js', __FILE__ ),
        array(
            'wp-hooks',
            'wp-data',
            'wp-i18n',
            'block-accessibility-script',
        ),
        '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_meta_validation_scripts' );
```

## Key Concepts

### Accessing Post Meta

Use the WordPress data stores to access various post-level data:

```javascript
import { select } from '@wordpress/data';

// Get post meta
const metaValue = select( 'core/editor' ).getEditedPostAttribute( 'meta' ).my_custom_field;

// Get post attributes
const postTitle = select( 'core/editor' ).getEditedPostAttribute( 'title' );
const postType = select( 'core/editor' ).getCurrentPostType();
const featuredImage = select( 'core/editor' ).getEditedPostAttribute( 'featured_media' );

// Get post status
const postStatus = select( 'core/editor' ).getEditedPostAttribute( 'status' );
```

### Validating Custom Fields

Access custom post meta values registered with WordPress:

```javascript
// First, ensure your meta is registered in PHP
register_post_meta( 'post', 'my_custom_field', array(
    'show_in_rest' => true,
    'single'       => true,
    'type'         => 'string',
) );

// Then access in JavaScript validation
const customField = select( 'core/editor' )
    .getEditedPostAttribute( 'meta' )?.my_custom_field;

if ( ! customField || customField.trim() === '' ) {
    return false;
}
```

### Post-Type Specific Validation

Validate post meta only for specific post types:

```javascript
const postType = select( 'core/editor' ).getCurrentPostType();

if ( postType !== 'custom-post-type' ) {
    return isValid; // Skip validation for other post types
}

// Proceed with post type specific validation
```

### Performance Considerations

- Post meta validation runs on every block update, so keep logic efficient
- Cache results when possible to avoid repeated data store queries
- Consider debouncing validation for expensive operations

## Testing Your Implementation

1. Activate both your plugin and Block Accessibility Checks
2. Create a new post of the target post type
3. Leave the required post meta field empty or invalid
4. Add a block that triggers the validation
5. Check that validation feedback appears in the editor
6. Verify the check appears in Settings > Block Accessibility Checks

## Examples

### Example 1: [Add Your Example Title]

[Space for your example code and description]

### Example 2: [Add Your Example Title]

[Space for your example code and description]

### Example 3: [Add Your Example Title]

[Space for your example code and description]
