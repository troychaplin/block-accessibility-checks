# Quick Start: General Editor Validation

General editor validation allows you to validate the overall state of the editor, including all blocks in a post, block patterns, or global content structure. This approach is useful for validating relationships between blocks or enforcing document-level accessibility requirements.

## When to Use This Approach

Use general editor validation when you need to:

- Validate the entire content structure of a post
- Check relationships between multiple blocks
- Ensure required blocks are present in the document
- Validate the order or hierarchy of blocks
- Enforce document-level accessibility requirements
- Count specific block types across the entire post

## Implementation Steps

### Step 1: Register Your Check in PHP

Register your editor validation check using the `ba11yc_editor_checks_ready` action hook. Editor checks are registered per post type.

```php
public function __construct() {
    add_action( 'ba11yc_editor_checks_ready', array( $this, 'register_checks' ), 10, 2 );
}

public function register_checks( $registry ) {
    // Check that first block is a heading
    $registry->register_editor_check(
        'post', // Post type
        'first_block_heading',
        array(
            'error_msg'   => __( 'The first block must be a Heading block.', 'my-plugin' ),
            'warning_msg' => __( 'It is recommended that the first block is a Heading block.', 'my-plugin' ),
            'description' => __( 'Ensures that the content starts with a heading for better accessibility and SEO.', 'my-plugin' ),
            'type'        => 'settings',
            'priority'    => 10,
        )
    );

    // Limit paragraph count
    $registry->register_editor_check(
        'post', // Post type
        'max_paragraphs',
        array(
            'error_msg'   => __( 'You cannot have more than 5 paragraphs.', 'my-plugin' ),
            'warning_msg' => __( 'You have more than 5 paragraphs, which might be too long.', 'my-plugin' ),
            'description' => __( 'Limits the number of paragraph blocks to encourage brevity.', 'my-plugin' ),
            'type'        => 'settings',
            'priority'    => 20,
        )
    );
}
```

### Step 2: Implement Validation Logic in JavaScript

Create a JavaScript file that hooks into the `ba11yc_validate_editor` filter to perform the actual validation.

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/validation',
    ( isValid, blocks, postType, checkName ) => {
        // Only process this specific check
        if ( checkName !== 'first_block_heading' ) {
            return isValid;
        }

        // The validation system filters by post type, so no need to check it here
        // This check only runs for post types where it's registered

        if ( ! blocks || blocks.length === 0 ) {
            return true; // Empty editor passes validation
        }

        const firstBlock = blocks[ 0 ];
        if ( firstBlock.name !== 'core/heading' ) {
            return false;
        }

        return true;
    }
);
```

### Step 3: Enqueue Your Validation Script

Ensure your JavaScript validation file is loaded in the block editor with the correct dependencies.

```php
function my_plugin_enqueue_editor_validation_scripts() {
    wp_enqueue_script(
        'my-plugin-editor-validation',
        plugins_url( 'build/editor-validation.js', __FILE__ ),
        array(
            'wp-hooks',
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

### Filter Parameters

The `ba11yc_validate_editor` filter receives four parameters:

- **isValid** - Current validation state; return this unchanged if your check doesn't apply
- **blocks** - Array of all top-level blocks in the editor
- **postType** - The post type being edited (e.g., `'post'`, `'page'`, `'band'`)
- **checkName** - The specific check identifier (matches the name in PHP registration)

### No Need to Filter by Post Type

The validation system automatically filters checks by post type based on your PHP registration. Your JavaScript validation only runs for the post types you specified in `register_editor_check()`.

```javascript
// DON'T do this - the system already filters by post type
if ( postType !== 'post' ) {
    return isValid;
}

// DO this - just validate based on checkName
if ( checkName !== 'your_check_name' ) {
    return isValid;
}
```

### Accessing the Blocks Array

The `blocks` parameter contains all top-level blocks in the editor. This is equivalent to calling `select('core/block-editor').getBlocks()` but is passed to you automatically.

```javascript
// Check if blocks exist
if ( ! blocks || blocks.length === 0 ) {
    return true;
}

// Access first block
const firstBlock = blocks[ 0 ];

// Access last block
const lastBlock = blocks[ blocks.length - 1 ];

// Access specific block properties
const blockName = firstBlock.name;
const blockAttributes = firstBlock.attributes;
const innerBlocks = firstBlock.innerBlocks;
```

### Counting Block Types

Use JavaScript array methods to count specific block types:

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/validation',
    ( isValid, blocks, postType, checkName ) => {
        if ( checkName !== 'max_paragraphs' ) {
            return isValid;
        }

        // Count paragraph blocks
        const paragraphCount = blocks.reduce( ( count, block ) => {
            if ( block.name === 'core/paragraph' ) {
                return count + 1;
            }
            return count;
        }, 0 );

        // Validate count
        if ( paragraphCount > 5 ) {
            return false;
        }

        return true;
    }
);
```

### Validating Block Order and Position

Check the position and sequence of blocks:

```javascript
// Ensure first block is a heading
if ( checkName === 'first_block_heading' ) {
    if ( ! blocks || blocks.length === 0 ) {
        return true;
    }

    const firstBlock = blocks[ 0 ];
    if ( firstBlock.name !== 'core/heading' ) {
        return false;
    }

    return true;
}

// Ensure last block is not a separator
if ( checkName === 'no_trailing_separator' ) {
    if ( ! blocks || blocks.length === 0 ) {
        return true;
    }

    const lastBlock = blocks[ blocks.length - 1 ];
    if ( lastBlock.name === 'core/separator' ) {
        return false;
    }

    return true;
}
```

### Handling Nested Blocks

The `blocks` parameter only includes top-level blocks. To validate nested blocks, you need to traverse the `innerBlocks` property:

```javascript
function countAllBlocks( blocks, blockName ) {
    let count = 0;

    blocks.forEach( block => {
        if ( block.name === blockName ) {
            count++;
        }

        // Recursively count in nested blocks
        if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
            count += countAllBlocks( block.innerBlocks, blockName );
        }
    } );

    return count;
}

// Use in validation
if ( checkName === 'max_images_total' ) {
    const imageCount = countAllBlocks( blocks, 'core/image' );

    if ( imageCount > 10 ) {
        return false;
    }

    return true;
}
```

### Multiple Checks with Switch Statements

Use a switch statement to handle multiple editor checks efficiently:

```javascript
addFilter(
    'ba11yc_validate_editor',
    'my-plugin/validation',
    ( isValid, blocks, postType, checkName ) => {
        switch ( checkName ) {
            case 'first_block_heading':
                if ( ! blocks || blocks.length === 0 ) {
                    return true;
                }
                return blocks[ 0 ].name === 'core/heading';

            case 'max_paragraphs':
                const paragraphCount = blocks.reduce( ( count, block ) => {
                    return block.name === 'core/paragraph' ? count + 1 : count;
                }, 0 );
                return paragraphCount <= 5;

            case 'requires_image':
                return blocks.some( block => block.name === 'core/image' );

            default:
                return isValid;
        }
    }
);
```

### Validating Heading Hierarchy

Check that heading levels follow a logical order:

```javascript
if ( checkName === 'heading_hierarchy' ) {
    const headingBlocks = blocks.filter( block => block.name === 'core/heading' );

    if ( headingBlocks.length === 0 ) {
        return true;
    }

    let previousLevel = 0;

    for ( const heading of headingBlocks ) {
        const currentLevel = heading.attributes.level || 2;

        // Check if heading level skips more than one level
        if ( currentLevel > previousLevel + 1 && previousLevel !== 0 ) {
            return false;
        }

        previousLevel = currentLevel;
    }

    return true;
}
```

### Performance Tips

- The validation runs automatically when blocks change, so keep logic efficient
- Use early returns when validation doesn't apply to your check
- Avoid complex calculations - keep validation simple and fast
- Use `.some()` to stop searching as soon as a match is found
- Use `.every()` to validate all items meet a condition

## Testing Your Implementation

1. Activate both your plugin and Block Accessibility Checks
2. Create or edit a post of the target post type
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
