# Best Practices

Follow these guidelines to create effective, performant, and user-friendly validation checks.

## Keep Validation Simple

Validation runs frequently as users edit, so keep logic simple and fast. Avoid complex calculations or heavy processing.

### Do This

```javascript
// Simple, fast validation
if ( checkName === 'title_required' ) {
    return !!( attributes.title && attributes.title.trim() );
}
```

### Avoid This

```javascript
// Slow, complex validation
if ( checkName === 'title_required' ) {
    const words = attributes.title.split(' ');
    const uniqueWords = new Set(words);
    const wordFrequency = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    // ... more complex processing
    return someComplexCondition;
}
```

## Provide Clear Messages

Write error and warning messages that clearly explain the problem and how to fix it. Avoid technical jargon when possible.

### Do This

```php
'error_msg' => __( 'Image must include alt text for screen reader users.', 'my-plugin' )
```

### Avoid This

```php
'error_msg' => __( 'Alt attribute validation failed.', 'my-plugin' )
```

### Message Guidelines

- **Be specific** - Tell users exactly what's wrong
- **Be actionable** - Explain how to fix the issue
- **Be concise** - Keep messages short and scannable
- **Be helpful** - Focus on the solution, not the problem
- **Avoid jargon** - Use plain language that content creators understand

## Use Appropriate Severity

Choose the right severity level for each check based on its importance.

### Use 'error' for:
- Critical accessibility issues (WCAG violations)
- Required fields that prevent content from working
- Security or data integrity issues

### Use 'warning' for:
- Recommendations that improve quality
- Best practices that aren't strictly required
- Style guide suggestions

### Use 'settings' for:
- Checks where site administrators should decide severity
- Checks that may vary by site or use case
- Most checks (this is the recommended default)

### Example

```php
// Critical accessibility issue - always error
'type' => 'error'

// Quality recommendation - allow admin to choose
'type' => 'settings'
```

## Test Thoroughly

Test your validation with various content scenarios to ensure it works correctly.

### Test Cases to Consider

1. **Empty values** - What happens with no content?
2. **Edge cases** - Test boundary conditions (max length, min length, etc.)
3. **Special characters** - Test with unicode, HTML entities, etc.
4. **Different user workflows** - Test copy/paste, block patterns, etc.
5. **Multiple blocks** - Test with many blocks in the editor
6. **Nested blocks** - Test with complex block hierarchies

### Example Test Plan

```javascript
// Test with empty string
attributes.title = '';

// Test with whitespace only
attributes.title = '   ';

// Test with special characters
attributes.title = 'Title with <HTML> & special™ chars';

// Test at boundaries
attributes.content = 'x'.repeat(500); // Max length
attributes.content = 'x'.repeat(501); // Over limit
```

## Support Multiple Languages

Always wrap messages in translation functions to support internationalized sites.

### Do This

```php
array(
    'error_msg'   => __( 'Title is required.', 'my-plugin' ),
    'warning_msg' => __( 'Title is recommended.', 'my-plugin' ),
    'description' => __( 'Helps screen readers understand content.', 'my-plugin' ),
)
```

### Avoid This

```php
array(
    'error_msg'   => 'Title is required.',
    'warning_msg' => 'Title is recommended.',
    'description' => 'Helps screen readers understand content.',
)
```

## Common Patterns

### Single Validation for Multiple Blocks

Register the same check for different block types:

```php
$config = array(
    'error_msg'   => __( 'Alt text is required.', 'my-plugin' ),
    'warning_msg' => __( 'Alt text is recommended.', 'my-plugin' ),
    'description' => __( 'Ensures images are accessible.', 'my-plugin' ),
    'type'        => 'settings',
    'category'    => 'accessibility',
);

$registry->register_block_check( 'core/image', 'alt_text_required', $config );
$registry->register_block_check( 'my-plugin/gallery', 'alt_text_required', $config );
```

Then handle both in JavaScript with a single switch case:

```javascript
switch ( checkName ) {
    case 'alt_text_required':
        // Works for both core/image and my-plugin/gallery
        return !!( attributes.alt && attributes.alt.trim() );
}
```

### Multiple Validations for Single Block

Register multiple checks for one block:

```php
$registry->register_block_check(
    'my-plugin/card',
    'title_required',
    array(
        'error_msg' => __( 'Card title is required.', 'my-plugin' ),
        'type'      => 'error',
    )
);

$registry->register_block_check(
    'my-plugin/card',
    'image_required',
    array(
        'error_msg' => __( 'Card image is required.', 'my-plugin' ),
        'type'      => 'settings',
    )
);
```

Use switch statements in JavaScript to handle each check efficiently:

```javascript
addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        if ( blockType !== 'my-plugin/card' ) {
            return isValid;
        }

        switch ( checkName ) {
            case 'title_required':
                return !!( attributes.title && attributes.title.trim() );

            case 'image_required':
                return !!( attributes.imageUrl && attributes.imageUrl.trim() );

            default:
                return isValid;
        }
    }
);
```

### Conditional Validation

Perform validation only when certain conditions are met:

```javascript
case 'description_required':
    // Only require description if featured is enabled
    if ( attributes.isFeatured ) {
        return !!( attributes.description && attributes.description.trim() );
    }
    // If not featured, description is optional
    return true;
```

### Post Type Specific Checks

For editor and meta validation, register checks per post type:

```php
// Only validate 'band' post type
$registry->register_editor_check( 'band', 'first_block_heading', $config );

// Validate multiple post types
$registry->register_editor_check( 'post', 'first_block_heading', $config );
$registry->register_editor_check( 'page', 'first_block_heading', $config );
```

## Performance Optimization

### Use Early Returns

Return as soon as you know validation doesn't apply:

```javascript
// Good - returns immediately if not our block
if ( blockType !== 'my-plugin/custom-block' ) {
    return isValid;
}

// Good - returns immediately if not our check
if ( checkName !== 'title_required' ) {
    return isValid;
}
```

### Use Switch Statements

Switch statements are faster than multiple if/else chains:

```javascript
// Good - fast switch statement
switch ( checkName ) {
    case 'check_one':
        return validateCheckOne();
    case 'check_two':
        return validateCheckTwo();
    default:
        return isValid;
}

// Avoid - slower if/else chain
if ( checkName === 'check_one' ) {
    return validateCheckOne();
} else if ( checkName === 'check_two' ) {
    return validateCheckTwo();
} else {
    return isValid;
}
```

### Cache Complex Calculations

If you need to perform complex operations, cache results outside the filter:

```javascript
// Cache regex patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

addFilter(
    'ba11yc_validate_block',
    'my-plugin/validation',
    ( isValid, blockType, attributes, checkName, block ) => {
        if ( checkName === 'email_valid' ) {
            // Reuse cached pattern instead of creating new one
            return emailPattern.test( attributes.email );
        }
        return isValid;
    }
);
```

### Avoid Heavy Operations

Keep validation lightweight:

```javascript
// Good - simple check
return !!( attributes.title && attributes.title.trim() );

// Avoid - expensive operations
return fetch('/api/validate-title', {
    method: 'POST',
    body: JSON.stringify({ title: attributes.title })
});
```