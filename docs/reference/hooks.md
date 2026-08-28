# Hooks Reference

This document lists all action and filter hooks available in the Block Accessibility Checks plugin, organized by category.

## Important: Configuration vs. Validation

**PHP filter hooks** are for modifying check **configuration and registration** only.

**JavaScript hooks** are for implementing **validation logic**. All validation happens in JavaScript for real-time feedback.

## PHP Action Hooks

### Plugin Initialization

#### `ba11yc_plugin_initialized`

Fired when the plugin is fully initialized.

**Parameters:**
- `$plugin_initializer` (PluginInitializer) - The plugin initializer instance

**Example:**
```php
add_action( 'ba11yc_plugin_initialized', function( $plugin_initializer ) {
    // Plugin is fully initialized
} );
```

#### `ba11yc_ready`

Fired when the plugin is ready for developer interaction. Use this to register block checks.

**Parameters:**
- `$registry` (Block\Registry) - The block checks registry instance (optional — prefer the global function)
- `$plugin_initializer` - The plugin initializer instance

**Example:**
```php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/block', array(
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Error message.',
        'level'     => 'error',
    ) );
} );
```

#### `ba11yc_editor_checks_ready`

Fired when the editor checks registry is ready. Use this to register editor checks.

**Parameters:**
- `$registry` (Editor\Registry) - The editor checks registry instance

**Example:**
```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Error message.',
        'level'     => 'error',
    ) );
} );
```

#### `ba11yc_register_checks`

Alternative action fired during the check registration phase. Use this to register custom block checks.

**Example:**
```php
add_action( 'ba11yc_register_checks', function() {
    ba11yc_register_block_check( 'my-plugin/block', array(
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Error message.',
    ) );
} );
```

### Block Check Events

#### `ba11yc_check_registered`

Fired when a block check is successfully registered.

**Parameters:**
- `$block_type` (string) - Block type
- `$check_name` (string) - Check name
- `$check_args` (array) - Check configuration

**Example:**
```php
add_action( 'ba11yc_check_registered', function( $block_type, $check_name, $check_args ) {
    // Check was registered
} );
```

#### `ba11yc_check_unregistered`

Fired when a block check is unregistered.

**Parameters:**
- `$block_type` (string) - Block type
- `$check_name` (string) - Check name

**Example:**
```php
add_action( 'ba11yc_check_unregistered', function( $block_type, $check_name ) {
    // Check was unregistered
} );
```

#### `ba11yc_check_toggled`

Fired when a block check is enabled or disabled.

**Parameters:**
- `$block_type` (string) - Block type
- `$check_name` (string) - Check name
- `$enabled` (bool) - Whether check is enabled

**Example:**
```php
add_action( 'ba11yc_check_toggled', function( $block_type, $check_name, $enabled ) {
    // Check was toggled
} );
```

### Meta Check Events

#### `ba11yc_meta_check_registered`

Fired when a meta check is successfully registered.

**Parameters:**
- `$post_type` (string) - Post type
- `$meta_key` (string) - Meta key
- `$check_name` (string) - Check name
- `$check_args` (array) - Check configuration

**Example:**
```php
add_action( 'ba11yc_meta_check_registered', function( $post_type, $meta_key, $check_name, $check_args ) {
    // Meta check was registered
} );
```

### Editor Check Events

#### `ba11yc_editor_check_registered`

Fired when an editor check is successfully registered.

**Parameters:**
- `$post_type` (string) - Post type
- `$check_name` (string) - Check name
- `$check_args` (array) - Check configuration

**Example:**
```php
add_action( 'ba11yc_editor_check_registered', function( $post_type, $check_name, $check_args ) {
    // Editor check was registered
} );
```

## PHP Filter Hooks

### Block Checks

#### `ba11yc_register_default_checks`

Controls whether default checks should be registered.

**Parameters:**
- `$register` (bool) - Whether to register default checks

**Returns:**
- `bool` - Whether to register default checks

**Example:**
```php
add_filter( 'ba11yc_register_default_checks', '__return_false' );
```

#### `ba11yc_should_register_check`

Controls whether a specific block check should be registered.

**Parameters:**
- `$should_register` (bool) - Whether to register the check
- `$block_type` (string) - Block type
- `$check_name` (string) - Check name
- `$check_args` (array) - Check configuration

**Returns:**
- `bool` - Whether to register the check

**Example:**
```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    if ( $check_name === 'optional_check' && ! current_user_can( 'manage_options' ) ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

#### `ba11yc_check_args`

Filters block check arguments before registration.

**Parameters:**
- `$check_args` (array) - Check configuration
- `$block_type` (string) - Block type
- `$check_name` (string) - Check name

**Returns:**
- `array` - Modified check configuration

**Example:**
```php
add_filter( 'ba11yc_check_args', function( $check_args, $block_type, $check_name ) {
    if ( $check_name === 'content_length' ) {
        $check_args['priority'] = 5;
    }
    return $check_args;
}, 10, 3 );
```

#### `ba11yc_core_heading_sources`

Adjust the built-in list of core blocks that render a heading without using a numeric `level`
attribute. Blocks that follow that convention are detected automatically and are not in this list.

**Parameters:**
- `$exceptions` (array) - Heading specs keyed by block type, in the same shape as
  `ba11yc_register_heading_source()`.

**Example:**
```php
add_filter( 'ba11yc_core_heading_sources', function ( $exceptions ) {
    $exceptions['core/some-block'] = array( 'level' => 2 );
    unset( $exceptions['core/widget-group'] );

    return $exceptions;
} );
```

### Meta Checks

#### `ba11yc_should_register_meta_check`

Controls whether a specific meta check should be registered.

**Parameters:**
- `$should_register` (bool) - Whether to register the check
- `$post_type` (string) - Post type
- `$meta_key` (string) - Meta key
- `$check_name` (string) - Check name
- `$check_args` (array) - Check configuration

**Returns:**
- `bool` - Whether to register the check

**Example:**
```php
add_filter( 'ba11yc_should_register_meta_check', function( $should_register, $post_type, $meta_key, $check_name, $check_args ) {
    if ( $check_name === 'required' && $post_type === 'draft' ) {
        return false;
    }
    return $should_register;
}, 10, 5 );
```

#### `ba11yc_meta_check_args`

Filters meta check arguments before registration.

**Parameters:**
- `$check_args` (array) - Check configuration
- `$post_type` (string) - Post type
- `$meta_key` (string) - Meta key
- `$check_name` (string) - Check name

**Returns:**
- `array` - Modified check configuration

**Example:**
```php
add_filter( 'ba11yc_meta_check_args', function( $check_args, $post_type, $meta_key, $check_name ) {
    if ( $meta_key === 'band_origin' ) {
        $check_args['priority'] = 5;
    }
    return $check_args;
}, 10, 4 );
```

#### `ba11yc_validate_meta`

Validate post meta server-side (REST API validation).

**Parameters:**
- `$is_valid` (bool) - Current validation status
- `$value` (mixed) - Meta field value
- `$post_type` (string) - Post type
- `$meta_key` (string) - Meta key
- `$check_name` (string) - Check name
- `$config` (array) - Check configuration

**Returns:**
- `bool` - Whether the value is valid

**Example:**
```php
add_filter( 'ba11yc_validate_meta', function( $is_valid, $value, $post_type, $meta_key, $check_name, $config ) {
    if ( $meta_key === 'band_origin' && $check_name === 'required' ) {
        $parts = explode( ',', $value );
        return count( $parts ) >= 2;
    }
    return $is_valid;
}, 10, 6 );
```

### Editor Checks

#### `ba11yc_should_register_editor_check`

Controls whether a specific editor check should be registered.

**Parameters:**
- `$should_register` (bool) - Whether to register the check
- `$post_type` (string) - Post type
- `$check_name` (string) - Check name
- `$check_args` (array) - Check configuration

**Returns:**
- `bool` - Whether to register the check

**Example:**
```php
add_filter( 'ba11yc_should_register_editor_check', function( $should_register, $post_type, $check_name, $check_args ) {
    if ( $check_name === 'first_block_heading' && $post_type === 'draft' ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

#### `ba11yc_editor_check_args`

Filters editor check arguments before registration.

**Parameters:**
- `$check_args` (array) - Check configuration
- `$post_type` (string) - Post type
- `$check_name` (string) - Check name

**Returns:**
- `array` - Modified check configuration

**Example:**
```php
add_filter( 'ba11yc_editor_check_args', function( $check_args, $post_type, $check_name ) {
    if ( $check_name === 'max_paragraphs' ) {
        $check_args['priority'] = 5;
    }
    return $check_args;
}, 10, 3 );
```

## JavaScript Filter Hooks

### Block Validation

#### `ba11yc.validateBlock`

Implement validation logic for block attributes.

**Parameters:**
- `isValid` (boolean) - Current validation status
- `blockType` (string) - Block type being validated
- `attributes` (object) - Block attributes
- `checkName` (string) - Check name being run
- `block` (object) - Full block object, including `clientId` and `innerBlocks`

**Returns:**
- `boolean` - `true` if valid, `false` if invalid

**Example:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/custom-block') {
            return isValid;
        }
        if (checkName === 'content_length') {
            const content = attributes.content || '';
            return content.length <= 500;
        }
        return isValid;
    }
);
```

### Heading Sources

#### `ba11yc.blockHeadingLevels`

Declare the heading levels a block renders, for the heading order check.

Runs for every block, after the sources declared in PHP have been resolved, and overrides them. Use
it when the level cannot be expressed as data — derived from nesting depth, from sibling state, or
from several attributes at once. For a fixed level, a level held in an attribute, or a heading that
only exists when a field is filled in, `ba11yc_register_heading_source()` is simpler and needs no
build step.

**Parameters:**
- `levels` (number[]) - Levels resolved so far. Empty when the block declares no heading.
- `block` (object) - `{ name, attributes, clientId }`

**Returns:**
- `number[]` - The levels this block renders, in document order. Return `[]` for no heading; return
  more than one entry for a block that renders several.

**Example:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.blockHeadingLevels',
    'my-plugin/heading-levels',
    (levels, block) => {
        if (block.name !== 'my-plugin/section') {
            return levels;
        }
        if (block.attributes.mode === 'compact') {
            return [];
        }
        return [block.attributes.depth + 1];
    }
);
```

Levels are memoized per block against its attributes. A filter deriving levels from anything else
must tell the editor when that changes:

```javascript
import { dispatch } from '@wordpress/data';

dispatch('block-accessibility-checks').invalidateHeadingOutline();
```

### Meta Validation

#### `ba11yc_validate_meta`

Implement validation logic for post meta fields.

**Parameters:**
- `isValid` (boolean) - Current validation status
- `value` (mixed) - Meta field value
- `postType` (string) - Post type
- `metaKey` (string) - Meta key
- `checkName` (string) - Check name
- `rule` (object) - Check configuration from PHP

**Returns:**
- `boolean` - `true` if valid, `false` if invalid

**Example:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_meta',
    'my-plugin/meta-validation',
    (isValid, value, postType, metaKey, checkName) => {
        if (postType !== 'band' || metaKey !== 'band_origin') {
            return isValid;
        }
        if (checkName === 'required') {
            const parts = value ? value.split(',') : [];
            return parts.length >= 2;
        }
        return isValid;
    }
);
```

### Editor Validation

#### `ba11yc_validate_editor`

Implement validation logic for editor-wide state.

**Parameters:**
- `isValid` (boolean) - Current validation status
- `blocks` (array) - Array of all blocks in the editor
- `postType` (string) - Current post type
- `checkName` (string) - Check name being run
- `rule` (object) - Check configuration from PHP

**Returns:**
- `boolean` - `true` if valid, `false` if invalid

**Example:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_editor',
    'my-plugin/editor-validation',
    (isValid, blocks, postType, checkName) => {
        if (checkName !== 'first_block_heading' || postType !== 'post') {
            return isValid;
        }
        if (blocks.length === 0) {
            return true;
        }
        return blocks[0].name === 'core/heading';
    }
);
```

## Usage Examples

### Registering Checks

```php
// Block checks
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check( 'my-plugin/block', array(
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Error message.',
        'level'     => 'error',
    ) );
} );

// Editor checks
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace' => 'my-plugin',
        'name'      => 'check_name',
        'error_msg' => 'Error message.',
        'level'     => 'error',
    ) );
} );

// Meta checks (via Validator helper)
use BlockAccessibility\Meta\Validator;
register_post_meta( 'post_type', 'meta_key', [
    'validate_callback' => Validator::required( 'post_type', 'meta_key', array(
        'namespace' => 'my-plugin',
        'error_msg' => 'This field is required.',
        'level'     => 'error',
    ) ),
] );
```

### Modifying Check Configuration

```php
add_filter( 'ba11yc_check_args', function( $args, $block_type, $check_name ) {
    if ( $check_name === 'content_length' ) {
        $args['priority'] = 5;
    }
    return $args;
}, 10, 3 );
```

### Preventing Check Registration

```php
add_filter( 'ba11yc_should_register_check', function( $should_register, $block_type, $check_name, $check_args ) {
    if ( $check_name === 'optional_check' && ! current_user_can( 'manage_options' ) ) {
        return false;
    }
    return $should_register;
}, 10, 4 );
```

## See Also

- [Block Attributes Validation](../block-validation/javascript.md)
- [Post Meta Validation](../meta-validation/javascript.md)
- [Editor Validation](../editor-validation/javascript.md)
- [API Reference](./api.md)

