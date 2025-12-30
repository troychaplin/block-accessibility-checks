# Quick Start: General Editor Validation

General editor validation allows you to validate the overall state of the editor, including all blocks in a post, block patterns, or global content structure. This approach is useful for validating relationships between blocks or enforcing document-level accessibility requirements.

## When to Use This Approach

Use general editor validation when you need to:

- Validate the entire content structure of a post
- Check relationships between multiple blocks
- Ensure required blocks are present in the document
- Validate the order or hierarchy of blocks
- Enforce document-level accessibility requirements

## Implementation Steps

### Step 1: Register Your Check in PHP

Register your validation check. For general editor checks, you might target a common block type or use a specific trigger block.

```php
if ( function_exists( 'ba11yc_init_plugin' ) ) {
    add_action( 'ba11yc_ready', 'my_plugin_register_editor_checks' );
}

function my_plugin_register_editor_checks( $registry ) {
    $registry->register_block_check(
        'core/post-content', // Common trigger block
        'heading_structure',
        array(
            'error_msg'   => __( 'Heading structure must be logical (no skipped levels).', 'my-plugin' ),
            'warning_msg' => __( 'Heading structure should follow a logical hierarchy.', 'my-plugin' ),
            'description' => __( 'Ensures headings follow a logical hierarchy for screen reader navigation.', 'my-plugin' ),
            'type'        => 'settings',
            'category'    => 'accessibility',
            'priority'    => 10,
        )
    );
}
```

### Step 2: Implement Validation Logic in JavaScript

Use the WordPress block editor data store to access all blocks in the post and validate their collective state.

```javascript
import { addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        // Only handle our specific check
        if ( checkName !== 'heading_structure' ) {
            return isValid;
        }

        // Get all blocks in the editor
        const blocks = select( 'core/block-editor' ).getBlocks();

        // Extract all heading blocks
        const headingBlocks = blocks.filter( block => block.name === 'core/heading' );

        // Validate heading hierarchy
        let previousLevel = 0;

        for ( const heading of headingBlocks ) {
            const currentLevel = heading.attributes.level || 2;

            // Check if heading level skips more than one level
            if ( currentLevel > previousLevel + 1 && previousLevel !== 0 ) {
                return false; // Heading hierarchy is broken
            }

            previousLevel = currentLevel;
        }

        return true;
    }
);
```

### Step 3: Enqueue Your Validation Script

Ensure your JavaScript validation file is loaded with access to the block editor data store.

```php
function my_plugin_enqueue_editor_validation_scripts() {
    wp_enqueue_script(
        'my-plugin-editor-validation',
        plugins_url( 'build/editor-validation.js', __FILE__ ),
        array(
            'wp-hooks',
            'wp-data',
            'wp-blocks',
            'wp-block-editor',
            'wp-i18n',
            'block-accessibility-script',
        ),
        '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_editor_validation_scripts' );
```

## Key Concepts

### Accessing All Blocks

Use the block editor data store to retrieve and analyze all blocks:

```javascript
import { select } from '@wordpress/data';

// Get all blocks (flat array)
const blocks = select( 'core/block-editor' ).getBlocks();

// Get blocks including nested blocks (tree structure)
const blockTree = select( 'core/block-editor' ).getBlocks();

// Get selected block
const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();

// Get block count
const blockCount = select( 'core/block-editor' ).getBlockCount();
```

### Traversing Block Trees

Handle nested blocks when validating structure:

```javascript
function getAllBlocksFlat( blocks ) {
    let allBlocks = [];

    blocks.forEach( block => {
        allBlocks.push( block );

        if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
            allBlocks = allBlocks.concat( getAllBlocksFlat( block.innerBlocks ) );
        }
    } );

    return allBlocks;
}

// Use in validation
const blocks = select( 'core/block-editor' ).getBlocks();
const flatBlocks = getAllBlocksFlat( blocks );
```

### Validating Block Patterns

Check for required blocks or specific block sequences:

```javascript
// Check if a specific block type exists
const hasBlock = blocks.some( block => block.name === 'core/heading' );

// Ensure first block is a heading
const firstBlock = blocks[ 0 ];
if ( ! firstBlock || firstBlock.name !== 'core/heading' ) {
    return false;
}

// Count specific block types
const imageCount = blocks.filter( block => block.name === 'core/image' ).length;
if ( imageCount === 0 ) {
    return false; // At least one image required
}
```

### Performance Optimization

General editor validation can be expensive since it processes all blocks:

```javascript
// Cache results when possible
let cachedResult = null;
let cachedBlockCount = 0;

const currentBlockCount = select( 'core/block-editor' ).getBlockCount();

if ( cachedBlockCount === currentBlockCount && cachedResult !== null ) {
    return cachedResult; // Return cached result
}

// Perform validation...
cachedResult = validationResult;
cachedBlockCount = currentBlockCount;
```

### Combining with Block-Specific Checks

You can combine general editor validation with block-specific checks:

```javascript
// First check if this is the right block type
if ( blockType !== 'core/post-content' ) {
    return isValid;
}

// Then perform editor-wide validation
const blocks = select( 'core/block-editor' ).getBlocks();
// ... validation logic
```

## Testing Your Implementation

1. Activate both your plugin and Block Accessibility Checks
2. Create a new post with multiple blocks
3. Create a scenario that violates your validation rule
4. Check that validation feedback appears in the editor
5. Correct the issue and verify validation passes
6. Verify the check appears in Settings > Block Accessibility Checks

## Examples

### Example 1: [Add Your Example Title]

[Space for your example code and description]

### Example 2: [Add Your Example Title]

[Space for your example code and description]

### Example 3: [Add Your Example Title]

[Space for your example code and description]
