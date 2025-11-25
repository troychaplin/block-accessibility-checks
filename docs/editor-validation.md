# Editor Validation

The Editor Validation system allows you to register custom validation checks that examine the entire state of the block editor. This is useful for validations that depend on the relationship between multiple blocks, the order of blocks, or the presence of specific blocks within a post type.

This system integrates with the plugin's existing post locking mechanism and settings page, providing a unified experience for users.

## How It Works

The system works in two parts:
1.  **PHP Registration:** You register your check using PHP. This defines the check's metadata (name, error message, severity) and exposes it to the settings page.
2.  **JavaScript Validation:** You implement the validation logic in JavaScript using a filter. This logic runs in the block editor and determines if the content is valid.

## PHP Registration

To register an editor check, use the `ba11yc_editor_checks_ready` action hook. This hook provides access to the `EditorChecksRegistry` instance.

### Method: `register_editor_check`

```php
$registry->register_editor_check( string $post_type, string $check_name, array $args );
```

*   `$post_type` (string): The post type to run the check on (e.g., `'post'`, `'page'`).
*   `$check_name` (string): A unique identifier for your check.
*   `$args` (array): Configuration options:
    *   `error_msg` (string): The message to display when validation fails (error).
    *   `warning_msg` (string): The message to display when validation fails (warning).
    *   `type` (string): The default severity level (`'error'`, `'warning'`, `'settings'`, or `'none'`).
    *   `priority` (int): Order of execution (default: 10).
    *   `description` (string): Description displayed in the settings page.

## JavaScript Validation

To implement the validation logic, use the `ba11yc_validate_editor` filter in JavaScript.

### Filter: `ba11yc_validate_editor`

```javascript
addFilter( 'ba11yc_validate_editor', 'namespace/check-name', callback );
```

Callback arguments:
*   `isValid` (boolean): The current validation status.
*   `blocks` (array): An array of all blocks currently in the editor.
*   `postType` (string): The current post type.
*   `checkName` (string): The name of the check being run.
*   `rule` (object): The configuration object for the check.

## Examples

### 1. Enforce First Block is a Heading

This example ensures that the very first block in a 'post' is a Heading block.

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',
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

### 2. Limit Paragraph Count

This example warns the user if they have more than 3 paragraphs in a post.

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

### 3. Ensure a Specific Block Exists

This example ensures that a "Copyright" block (fictional custom block) exists somewhere in the post.

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'page',
        'has_copyright',
        array(
            'error_msg'   => __( 'A Copyright block is required.', 'text-domain' ),
            'type'        => 'error',
        )
    );
} );
```

**JavaScript:**
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

### 4. Validate Block Order

This example ensures that every Image block is immediately followed by a Paragraph block (acting as a caption or description).

**PHP:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check(
        'post',
        'image_followed_by_text',
        array(
            'error_msg'   => __( 'Images must be followed by a text description.', 'text-domain' ),
            'type'        => 'error',
        )
    );
} );
```

**JavaScript:**
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
