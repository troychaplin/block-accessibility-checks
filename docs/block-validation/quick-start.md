# Block Attributes Validation - Quick Start

This guide provides a fast path for developers to add custom accessibility checks for block attributes. For a complete working example, see the [block-check-integration-example](https://github.com/troychaplin/block-check-integration-example).

## Overview

Block attributes validation allows you to validate individual block attributes (e.g., image alt text, heading levels, button text). The system works in two parts:

1. **PHP Registration** - Register your check and its configuration
2. **JavaScript Validation** - Implement the validation logic

## Quick Start

### 1. Register a Check in PHP

Use the `ba11yc_ready` action to register your check:

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
    $registry->register_check(
        'my-plugin/custom-block', // Block type
        'content_length',         // Check name
        array(
            'error_msg'   => __( 'Content is too long for optimal readability', 'my-plugin' ),
            'warning_msg' => __( 'Content is long but still allowed (warning)', 'my-plugin' ),
            'description' => __( 'Long content can be difficult to read', 'my-plugin' ),
            'type'        => 'settings', // 'error', 'warning', or 'settings'
            'category'    => 'validation', // 'accessibility' or 'validation'
            'priority'    => 10,
        )
    );
}
```

### 2. Implement Validation in JavaScript

All validation logic runs in JavaScript for real-time feedback. Create a `validation.js` file in your block folder:

**`src/blocks/custom-block/validation.js`:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        switch (checkName) {
            case 'content_length':
                const content = attributes.content || '';
                return content.length <= 500;
            default:
                return isValid;
        }
    }
);
```

### 3. Import Validation in Your Block

Import the validation file in your block's `index.js` file:

**`src/blocks/custom-block/index.js`:**
```javascript
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './validation'; // Import validation

registerBlockType(metadata.name, {
    edit: Edit,
    save,
});
```

The validation code will be automatically bundled with your block and loaded in the editor when the block is registered.

## Next Steps

- **[PHP Integration →](./php.md)** - Detailed PHP registration guide
- **[JavaScript Integration →](./javascript.md)** - Detailed JavaScript validation guide
- **[API Reference →](../reference/api.md)** - Complete API documentation
- **[Hooks Reference →](../reference/hooks.md)** - All available hooks

