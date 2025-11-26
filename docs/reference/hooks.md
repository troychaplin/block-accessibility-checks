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
- `$registry` (BlockChecksRegistry) - The block checks registry instance
- `$plugin_initializer` (PluginInitializer) - The plugin initializer instance

**Example:**
```php
add_action( 'ba11yc_ready', function( $registry, $plugin_initializer ) {
    $registry->register_check( 'my-block/type', 'check_name', $args );
} );
```

#### `ba11yc_editor_checks_ready`

Fired when the editor checks registry is ready. Use this to register editor checks.

**Parameters:**
- `$registry` (EditorChecksRegistry) - The editor checks registry instance
- `$plugin_initializer` (PluginInitializer) - The plugin initializer instance

**Example:**
```php
add_action( 'ba11yc_editor_checks_ready', function( $registry, $plugin_initializer ) {
    $registry->register_editor_check( 'post', 'check_name', $args );
} );
```

#### `ba11yc_register_checks`

Fired during check registration phase. Use this to register custom block checks.

**Parameters:**
- `$registry` (BlockChecksRegistry) - The block checks registry instance

**Example:**
```php
add_action( 'ba11yc_register_checks', function( $registry ) {
    $registry->register_check( 'my-block/type', 'check_name', $args );
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

#### `ba11yc_validate_block`

Implement validation logic for block attributes.

**Parameters:**
- `isValid` (boolean) - Current validation status
- `blockType` (string) - Block type being validated
- `attributes` (object) - Block attributes
- `checkName` (string) - Check name being run
- `rule` (object) - Check configuration from PHP
- `block` (object) - Full block object (optional)

**Returns:**
- `boolean` - `true` if valid, `false` if invalid

**Example:**
```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc_validate_block',
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
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_check( 'my-block/type', 'check_name', $args );
} );

// Editor checks
add_action( 'ba11yc_editor_checks_ready', function( $registry ) {
    $registry->register_editor_check( 'post', 'check_name', $args );
} );

// Meta checks (via MetaValidation helper)
register_post_meta( 'post_type', 'meta_key', [
    'validate_callback' => MetaValidation::required( 'post_type', 'meta_key', $args ),
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

