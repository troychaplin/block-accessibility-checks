# Editor Validation - JavaScript Integration

This guide explains how to implement editor validation logic in JavaScript using the Block Accessibility Checks Validation API.

## Overview

All validation logic is handled in JavaScript for real-time feedback in the block editor. PHP is used for configuration and registration, while JavaScript determines if the editor state passes or fails validation checks.

## Implementing Validation Logic

### Basic Validation

Use the `ba11yc_validate_editor` filter to add your validation logic:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/first-block-heading',
    ( isValid, blocks, postType, checkName, rule ) => {
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

### Filter Parameters

- **`isValid`** (boolean) - Current validation status (from previous filters)
- **`blocks`** (array) - Array of all blocks currently in the editor
- **`postType`** (string) - The current post type (e.g., `'post'`, `'page'`)
- **`checkName`** (string) - The check being run (e.g., `'first_block_heading'`)
- **`rule`** (object) - The check configuration from PHP

### Return Value

Return `true` if the check passes, `false` if it fails. The validation system will use the `rule` object to determine the appropriate error/warning message and severity level.

## Accessing Validation Rules

The PHP registry exposes check configurations to JavaScript via a global object:

```javascript
const editorRules = window.BlockAccessibilityChecks?.editorValidationRules || {};
const postRules = editorRules.post || {};
const firstBlockRule = postRules.first_block_heading;

console.log(firstBlockRule.error_msg);   // Error message
console.log(firstBlockRule.warning_msg); // Warning message
console.log(firstBlockRule.type);        // 'error', 'warning', or 'none'
```

## Working with Blocks Array

The `blocks` parameter contains all blocks in the editor. Each block object includes:

- **`name`** (string) - Block type (e.g., `'core/heading'`, `'core/paragraph'`)
- **`attributes`** (object) - Block attributes
- **`innerBlocks`** (array) - Nested blocks (if any)
- **`clientId`** (string) - Unique block identifier

### Example: Checking Block Order

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/image-followed-by-text',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'image_followed_by_text' ) {
            return isValid;
        }

        for ( let i = 0; i < blocks.length; i++ ) {
            if ( blocks[i].name === 'core/image' ) {
                // Check if next block exists and is a paragraph
                const nextBlock = blocks[i + 1];
                if ( ! nextBlock || nextBlock.name !== 'core/paragraph' ) {
                    return false;
                }
            }
        }

        return true;
    }
);
```

### Example: Counting Blocks

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/max-paragraphs',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'max_paragraphs' ) {
            return isValid;
        }

        const paragraphCount = blocks.reduce( ( count, block ) => {
            return block.name === 'core/paragraph' ? count + 1 : count;
        }, 0 );

        if ( paragraphCount > 3 ) {
            return false;
        }

        return true;
    }
);
```

### Example: Checking Block Presence

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/has-copyright',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'has_copyright' ) {
            return isValid;
        }

        // Check top-level blocks (add recursion if you need to check nested blocks)
        const hasCopyright = blocks.some( block => block.name === 'my-plugin/copyright' );

        return hasCopyright;
    }
);
```

## Advanced Patterns

### Recursive Block Checking

To check nested blocks (inner blocks), you may need to recursively traverse the blocks:

```javascript
function hasBlockRecursive( blocks, blockName ) {
    for ( const block of blocks ) {
        if ( block.name === blockName ) {
            return true;
        }
        if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
            if ( hasBlockRecursive( block.innerBlocks, blockName ) ) {
                return true;
            }
        }
    }
    return false;
}

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/has-copyright-recursive',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'has_copyright' ) {
            return isValid;
        }

        return hasBlockRecursive( blocks, 'my-plugin/copyright' );
    }
);
```

### Complex Validation Logic

For complex validations, you can break the logic into separate functions:

```javascript
function validateBlockOrder( blocks ) {
    // Complex validation logic
    // ...
    return true;
}

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/complex-validation',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'complex_validation' ) {
            return isValid;
        }

        return validateBlockOrder( blocks );
    }
);
```

## Enqueuing Your Script

Your validation script must be loaded in the block editor with the correct dependencies:

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

**Important:** Include `'block-accessibility-script'` as a dependency to ensure the validation system is loaded first.

## How Validation Works

1. **Registration** - PHP registers checks with configuration
2. **Export** - Configuration is exported to JavaScript via `wp_localize_script`
3. **Validation** - When blocks change, `validateEditor()` is called
4. **Filter Application** - The `ba11yc_validate_editor` filter is applied for each registered check
5. **Result Collection** - Validation results are collected
6. **Post Locking** - If any checks fail with `type: 'error'`, post saving is locked

## Best Practices

### Early Returns

Use early returns to avoid unnecessary processing:

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/validation',
    ( isValid, blocks, postType, checkName ) => {
        // Early return for post types we don't handle
        if ( postType !== 'post' ) {
            return isValid;
        }
        
        // Early return for checks we don't handle
        if ( checkName !== 'first_block_heading' ) {
            return isValid;
        }
        
        // Validation logic here
        if ( blocks.length === 0 ) {
            return true;
        }
        
        return blocks[0].name === 'core/heading';
    }
);
```

### Performance

- Keep validation logic simple and fast
- Avoid expensive operations in validation filters
- Consider caching results for complex validations
- Only check what's necessary for the specific check

### Defensive Programming

Always check for edge cases:

```javascript
// Check if blocks array exists and has items
if ( ! blocks || blocks.length === 0 ) {
    return true; // Empty editor might be valid
}

// Check if block has required properties
if ( ! block.name ) {
    return true; // Skip invalid blocks
}
```

## Quick Reference

### Filter Hook

- **`ba11yc_validate_editor`** - Main validation filter for editor state

### Global Object

- **`window.BlockAccessibilityChecks.editorValidationRules`** - All registered editor checks

### Filter Signature

```javascript
addFilter(
    'ba11yc_validate_editor',
    'namespace/unique-name',
    (isValid, blocks, postType, checkName, rule) => {
        // Return true (valid) or false (invalid)
    }
);
```

## See Also

- [Quick Start Guide](./quick-start.md)
- [PHP Integration](./php.md)
- [Hooks Reference](../reference/hooks.md)
- [Architecture](../architecture.md)

