# Quick Start: Post Meta Validation

Post meta validation allows you to validate data stored in WordPress post meta fields. This approach integrates directly with WordPress's `register_meta()` function to provide real-time validation for custom fields in the block editor.

## When to Use This Approach

Use post meta validation when you need to:

- Validate custom post meta fields
- Ensure required metadata is present for specific post types
- Validate custom field values in real-time as editors type
- Provide accessibility checks for post-level data

## Implementation Steps

### Step 1: Register Post Meta with Validation in PHP

Register your post meta fields using WordPress's `register_meta()` function and integrate with the Block Accessibility Checks validator.

```php
public function register_custom_meta() {
    // Check if Validator class is available
    $validator_class     = '\BlockAccessibility\Meta\Validator';
    $validator_available = class_exists( $validator_class );

    register_meta(
        'post',
        'custom_field_name',
        array(
            'single'            => true,
            'type'              => 'string',
            'show_in_rest'      => true,
            'object_subtype'    => 'post', // Your post type
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => $validator_available
                ? call_user_func(
                    array( $validator_class, 'required' ),
                    'post', // Post type
                    'custom_field_name', // Meta key
                    array(
                        'error_msg'   => __( 'This field is required.', 'my-plugin' ),
                        'warning_msg' => __( 'This field is recommended.', 'my-plugin' ),
                        'description' => __( 'Description of what this field is for', 'my-plugin' ),
                        'type'        => 'settings',
                    )
                )
                : null,
        )
    );
}
add_action( 'init', array( $this, 'register_custom_meta' ) );
```

### Step 2: Implement Validation Logic in JavaScript

Create a JavaScript file that hooks into the `ba11yc_validate_meta` filter to perform client-side validation.

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_meta',
    'my-plugin/validation',
    ( isValid, value, postType, metaKey, checkName ) => {
        // Only validate for your specific post type
        if ( postType !== 'post' ) {
            return isValid;
        }

        // Validate based on the meta key
        switch ( metaKey ) {
            case 'custom_field_name':
                if ( checkName === 'required' ) {
                    // Validate that the field is not empty
                    return !!( value && value.trim() );
                }
                break;
        }

        return isValid;
    }
);
```

### Step 3: Enqueue Your Validation Script

Ensure your JavaScript validation file is loaded in the block editor with the correct dependencies.

```php
function my_plugin_enqueue_meta_validation_scripts() {
    wp_enqueue_script(
        'my-plugin-meta-validation',
        plugins_url( 'build/meta-validation.js', __FILE__ ),
        array(
            'wp-hooks',
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

### Filter Parameters

The `ba11yc_validate_meta` filter receives five parameters:

- **isValid** - Current validation state; return this unchanged if your check doesn't apply
- **value** - The current value of the meta field being validated
- **postType** - The post type being edited (e.g., `'post'`, `'page'`, `'band'`)
- **metaKey** - The meta key being validated (e.g., `'custom_field_name'`)
- **checkName** - The validation check type (e.g., `'required'`)

### Validator Class Methods

The Block Accessibility Checks plugin provides a `Validator` class with built-in validation methods:

- **required** - Validates that a field has a value

```php
call_user_func(
    array( $validator_class, 'required' ),
    'post_type',
    'meta_key',
    array(
        'error_msg'   => __( 'Error message', 'my-plugin' ),
        'warning_msg' => __( 'Warning message', 'my-plugin' ),
        'description' => __( 'Field description', 'my-plugin' ),
        'type'        => 'settings',
    )
)
```

### Multiple Meta Fields

Register and validate multiple meta fields for the same post type:

```php
public function register_multiple_meta_fields() {
    $validator_class     = '\BlockAccessibility\Meta\Validator';
    $validator_available = class_exists( $validator_class );

    // Field 1
    register_meta(
        'post',
        'field_one',
        array(
            'single'            => true,
            'type'              => 'string',
            'show_in_rest'      => true,
            'object_subtype'    => 'custom_post_type',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => $validator_available
                ? call_user_func(
                    array( $validator_class, 'required' ),
                    'custom_post_type',
                    'field_one',
                    array(
                        'error_msg'   => __( 'Field One is required.', 'my-plugin' ),
                        'warning_msg' => __( 'Field One is recommended.', 'my-plugin' ),
                        'description' => __( 'Description for field one', 'my-plugin' ),
                        'type'        => 'settings',
                    )
                )
                : null,
        )
    );

    // Field 2
    register_meta(
        'post',
        'field_two',
        array(
            'single'            => true,
            'type'              => 'string',
            'show_in_rest'      => true,
            'object_subtype'    => 'custom_post_type',
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => $validator_available
                ? call_user_func(
                    array( $validator_class, 'required' ),
                    'custom_post_type',
                    'field_two',
                    array(
                        'error_msg'   => __( 'Field Two is required.', 'my-plugin' ),
                        'warning_msg' => __( 'Field Two is recommended.', 'my-plugin' ),
                        'description' => __( 'Description for field two', 'my-plugin' ),
                        'type'        => 'settings',
                    )
                )
                : null,
        )
    );
}
```

### JavaScript Validation with Switch Statements

Handle multiple meta fields efficiently using switch statements:

```javascript
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/validation',
    ( isValid, value, postType, metaKey, checkName ) => {
        // Only validate for your specific post type
        if ( postType !== 'custom_post_type' ) {
            return isValid;
        }

        switch ( metaKey ) {
            case 'field_one':
                if ( checkName === 'required' ) {
                    return !!( value && value.trim() );
                }
                break;

            case 'field_two':
                if ( checkName === 'required' ) {
                    return !!( value && value.trim() );
                }
                break;

            case 'field_three':
                if ( checkName === 'required' ) {
                    return !!( value && value.trim() );
                }
                break;
        }

        return isValid;
    }
);
```

### Post Type Specific Validation

The filter automatically receives the post type, making it easy to apply different validations per post type:

```javascript
addFilter(
    'ba11yc_validate_meta',
    'my-plugin/validation',
    ( isValid, value, postType, metaKey, checkName ) => {
        // Validate for 'band' post type
        if ( postType === 'band' ) {
            switch ( metaKey ) {
                case 'band_origin':
                    if ( checkName === 'required' ) {
                        return !!( value && value.trim() );
                    }
                    break;
            }
        }

        // Validate for 'artist' post type
        if ( postType === 'artist' ) {
            switch ( metaKey ) {
                case 'artist_name':
                    if ( checkName === 'required' ) {
                        return !!( value && value.trim() );
                    }
                    break;
            }
        }

        return isValid;
    }
);
```

### Important Requirements

For meta validation to work properly:

1. **show_in_rest must be true** - Meta fields must be exposed to the REST API
2. **Check Validator class availability** - Always verify the Validator class exists before using it
3. **Match post type** - The `object_subtype` in PHP must match the `postType` in JavaScript
4. **Match meta key** - The meta key in `register_meta()` must match the `metaKey` in JavaScript

## Testing Your Implementation

1. Activate both your plugin and Block Accessibility Checks
2. Create or edit a post of the target post type
3. Locate your custom meta field in the editor
4. Leave the field empty or enter an invalid value
5. Check that validation feedback appears in real-time
6. Verify the check appears in Settings > Block Accessibility Checks

## Examples

### Example 1: [Add Your Example Title]

[Space for your example code and description]

### Example 2: [Add Your Example Title]

[Space for your example code and description]

### Example 3: [Add Your Example Title]

[Space for your example code and description]
