# Quick Start: Block Attributes Validation

Validating block attributes is the most common use case for the Block Accessibility Checks API. This approach allows you to validate data stored directly in a block's attributes, such as titles, image URLs, text content, or custom settings.

## When to Use This Approach

Use block attributes validation when you need to:

- Validate content entered directly in block fields
- Check required attributes are present
- Ensure attribute values meet specific criteria
- Validate relationships between multiple attributes

## Implementation Steps

### Step 1: Register Your Check in PHP

Use the `ba11yc_ready` action to register your validation check. This defines the block type, check name, and configuration.

```php
if ( function_exists( 'ba11yc_init_plugin' ) ) {
    add_action( 'ba11yc_ready', 'my_plugin_register_attribute_checks' );
}

function my_plugin_register_attribute_checks( $registry ) {
    $registry->register_block_check(
        'my-plugin/custom-block',
        'title_required',
        array(
            'error_msg'   => __( 'Block title is required for accessibility.', 'my-plugin' ),
            'warning_msg' => __( 'Block title is recommended for better accessibility.', 'my-plugin' ),
            'description' => __( 'Ensures blocks have descriptive titles for screen reader users.', 'my-plugin' ),
            'type'        => 'settings',
            'category'    => 'accessibility',
            'priority'    => 10,
        )
    );
}
```

### Step 2: Implement Validation Logic in JavaScript

Create a JavaScript file that hooks into the `ba11yc_validate_block` filter to perform the actual validation.

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        // Only validate our specific block
        if ( blockType !== 'my-plugin/custom-block' ) {
            return isValid;
        }

        // Only handle our specific check
        if ( checkName !== 'title_required' ) {
            return isValid;
        }

        // Validate the title attribute
        if ( ! attributes.title || attributes.title.trim() === '' ) {
            return false;
        }

        return true;
    }
);
```

### Step 3: Enqueue Your Validation Script

Ensure your JavaScript validation file is loaded in the block editor with the correct dependencies.

```php
function my_plugin_enqueue_validation_scripts() {
    wp_enqueue_script(
        'my-plugin-validation',
        plugins_url( 'build/validation.js', __FILE__ ),
        array(
            'wp-hooks',
            'wp-i18n',
            'block-accessibility-script',
        ),
        '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_validation_scripts' );
```

## Key Concepts

### Filter Parameters

The validation filter receives five parameters:

- **isValid** - Current validation state; return this unchanged if your check doesn't apply
- **blockType** - The block name being validated (e.g., `'my-plugin/custom-block'`)
- **attributes** - Block attribute values as an object
- **checkName** - The specific check identifier (matches the name in PHP registration)
- **block** - The full block object, including `innerBlocks` for nested content

### Accessing Block Attributes

The `attributes` parameter contains all block attribute values as an object. Access attributes using dot notation:

```javascript
// Simple attributes
attributes.title
attributes.imageUrl
attributes.content

// Nested attributes
attributes.settings.displayMode
attributes.media.alignment
```

### Multiple Validations with Switch Statements

Use a switch statement to handle multiple checks for the same block efficiently:

```javascript
addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        // Only validate our specific block
        if ( blockType !== 'my-plugin/custom-block' ) {
            return isValid;
        }

        // Run validation based on the check name
        switch ( checkName ) {
            case 'title_required':
                return !!( attributes.title && attributes.title.trim() );

            case 'image_alt_text':
                return !!( attributes.imageAlt && attributes.imageAlt.trim() );

            case 'content_length':
                return attributes.content && attributes.content.length <= 500;

            default:
                // Let other filters handle unknown checks
                return isValid;
        }
    }
);
```

### Validating Inner Blocks

The `block` parameter provides access to nested blocks, allowing you to validate block structure:

```javascript
case 'check_innerblock_count':
    // Count specific inner block types
    let paragraphCount = 0;
    let buttonCount = 0;

    if ( block.innerBlocks ) {
        block.innerBlocks.forEach( innerBlock => {
            if ( innerBlock.name === 'core/paragraph' ) {
                paragraphCount++;
            } else if ( innerBlock.name === 'core/buttons' ) {
                buttonCount++;
            }
        } );
    }

    // Validate counts (e.g., 1-2 paragraphs, max 1 button group)
    return paragraphCount >= 1 && paragraphCount <= 2 && buttonCount <= 1;
```

### Handling Optional Attributes

Some attributes may be optional or conditionally required. Check for `undefined` before validating:

```javascript
case 'check_optional_field':
    // Only validate if the attribute exists (not undefined/null)
    if ( attributes.optionalField !== undefined && attributes.optionalField !== null ) {
        return !!( attributes.optionalField && attributes.optionalField.trim() );
    }
    // If attribute doesn't exist, validation passes
    return true;
```

### Performance Tips

- Return early if the block type doesn't match to avoid unnecessary processing
- Use switch statements instead of multiple if statements for better performance
- Cache complex calculations or regex patterns outside the filter function
- Keep validation logic simple and focused

## Testing Your Implementation

1. Activate both your plugin and Block Accessibility Checks
2. Create a new post and add your custom block
3. Leave the validated attribute empty or invalid
4. Check that validation feedback appears in the editor
5. Verify settings appear in Settings > Block Accessibility Checks

## Examples

### Example 1: [Add Your Example Title]

[Space for your example code and description]

### Example 2: [Add Your Example Title]

[Space for your example code and description]

### Example 3: [Add Your Example Title]

[Space for your example code and description]
