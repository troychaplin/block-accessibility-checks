# Editor Validation - Quick Start

This guide provides a fast path for developers to add validation checks that examine the entire state of the block editor.

## Overview

Editor validation allows you to validate the entire editor state, including block order, block relationships, and post type requirements. This is useful for validations that depend on multiple blocks or the overall structure of the content.

## Quick Start

### 1. Register a Check in PHP

Use the `ba11yc_editor_checks_ready` action to register your check:

```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',              // Post type
        'first_block_heading', // Check name
        array(
            'error_msg'   => __( 'The first block must be a Heading.', 'text-domain' ),
            'type'        => 'error',
            'description' => __( 'Ensures content starts with a heading.', 'text-domain' ),
        )
    );
} );
```

### 2. Implement Validation in JavaScript

All validation logic runs in JavaScript. Use the `ba11yc_validate_editor` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/first-block-heading',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'first_block_heading' || postType !== 'post' ) {
            return isValid;
        }

        if ( blocks.length === 0 ) {
            return true; // Empty editor is valid
        }

        const firstBlock = blocks[0];
        if ( firstBlock.name !== 'core/heading' ) {
            return false; // Validation failed
        }

        return true;
    }
);
```

### 3. Enqueue Your JavaScript Validation Script

Your validation logic must be loaded in the block editor:

```php
function my_plugin_enqueue_editor_validation() {
    wp_enqueue_script(
        'my-plugin-editor-validation',
        plugins_url( 'build/editor-validation.js', __FILE__ ),
        array( 'wp-hooks', 'wp-i18n', 'block-accessibility-script' ),
        '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_editor_validation' );
```

**Important:** Include `'block-accessibility-script'` as a dependency.

## Common Use Cases

- **Block Order** - Ensure blocks appear in a specific order
- **Block Relationships** - Validate relationships between blocks (e.g., image followed by caption)
- **Block Presence** - Ensure specific blocks exist in the editor
- **Post Type Requirements** - Validate content structure for specific post types

## Next Steps

- **[PHP Integration →](./php.md)** - Detailed PHP registration guide
- **[JavaScript Integration →](./javascript.md)** - Detailed JavaScript validation guide
- **[API Reference →](../reference/api.md)** - Complete API documentation
- **[Hooks Reference →](../reference/hooks.md)** - All available hooks

