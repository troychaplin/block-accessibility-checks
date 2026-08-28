# API Reference

This document provides comprehensive API documentation for all registration functions and registry methods available in the Block Accessibility Checks plugin.

## Global Registration Functions

These are the primary public API. Call them inside `ba11yc_ready` (or `ba11yc_register_checks` / `ba11yc_editor_checks_ready`).

### `ba11yc_register_namespace( $namespace_slug, $args )`

Declare the display name for a check namespace. Call it once and every check registered under that namespace is credited to it in the settings table, instead of a name guessed from the namespace slug.

**Parameters:**
- `$namespace_slug` (string): The namespace slug used by your checks
- `$args` (array): Accepts a `title` key (required)

**Returns:** `bool` — true on success, false on failure

Order does not matter — this may run before or after the checks themselves, because the title is resolved when the settings table is read rather than at registration time.

```php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_namespace( 'my-plugin', array(
        'title' => __( 'My Plugin', 'my-plugin' ),
    ) );
} );
```

---

### `ba11yc_register_block_check( $block_type, $args )`

Register a validation check for a block type.

**Parameters:**
- `$block_type` (string): Block type (e.g., `'core/image'`, `'my-plugin/custom-block'`)
- `$args` (array): Check configuration — see below

**Returns:** `bool` — true on success, false on failure

**Required keys in `$args`:**

| Key | Type | Description |
|---|---|---|
| `namespace` | string | Plugin identifier for attribution in the settings table |
| `name` | string | Unique check name within the block type |
| `error_msg` | string | Message shown when the check fails |

**Optional keys in `$args`:**

| Key | Type | Default | Description |
|---|---|---|---|
| `title` | string | `name` | Human-readable label shown as the check's name in the settings table |
| `warning_msg` | string | `error_msg` | Warning message |
| `description` | string | `''` | Description shown in the settings UI |
| `level` | string | `'error'` | Default severity: `'error'`, `'warning'`, or `'none'` |
| `configurable` | bool | `true` | Whether the admin can change the level in settings |
| `category` | string | `'accessibility'` | `'accessibility'` or `'validation'` |
| `priority` | int | `10` | Execution order (lower = earlier) |
| `enabled` | bool | `true` | Whether the check is active |

`name` is the slug used for storage keys and JavaScript filters and should not change once released; `title` is what admins read, and can be reworded freely. Without a `title`, the settings table falls back to showing the slug.

**Example:**
```php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check(
        'my-plugin/card-block',
        array(
            'namespace'    => 'my-plugin',
            'name'         => 'card_title_required',
            'title'        => __( 'Card title required', 'my-plugin' ),
            'error_msg'    => __( 'Card title is required', 'my-plugin' ),
            'warning_msg'  => __( 'Card title is recommended', 'my-plugin' ),
            'description'  => __( 'Card title validation', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => true,
            'category'     => 'accessibility',
        )
    );
} );
```

---

### `ba11yc_register_meta_check( $post_type, $args )`

Register a validation check for a post meta field.

**Parameters:**
- `$post_type` (string): Post type (e.g., `'post'`, `'page'`, `'band'`)
- `$args` (array): Check configuration

**Required keys in `$args`:** `namespace`, `name`, `meta_key`, `error_msg`

**Returns:** `bool`

---

### `ba11yc_register_editor_check( $post_type, $args )`

Register a document-level validation check for a post type.

**Parameters:**
- `$post_type` (string): Post type
- `$args` (array): Check configuration

**Required keys in `$args`:** `namespace`, `name`, `error_msg`

**Returns:** `bool`

---

### `ba11yc_register_heading_source( $block_types, $args )`

Declares that a block type renders a heading, so the heading order check counts it.

Most blocks need no registration. Core's heading blocks, and any block storing its level in a
numeric `level` attribute, are recognized automatically. Use this for blocks that do something
else — including blocks whose `block.json` you do not control.

**Parameters**

`$block_types` accepts a single block type name, or an array of names that share one spec.

`$args` is the spec itself:

| Key         | Type     | Description                                                                                       |
| ----------- | -------- | ------------------------------------------------------------------------------------------------- |
| `level`     | int      | The heading level, 0-6. `0` means the block renders no heading. Defaults to `2`.                   |
| `attribute` | string   | Name of the attribute holding the level. Falls back to `level` when unset or unreadable.           |
| `map`       | array    | Translates attribute values to levels, for attributes holding a token rather than a number.        |
| `requires`  | string   | Attribute that must have content for the heading to exist at all.                                  |
| `headings`  | array    | A list of the above, for a block that renders more than one heading.                               |

Returns `true` on success, `false` if any block type failed to register. Entries that are not
non-empty strings are skipped and logged; the rest still register.

**Examples**

```php
add_action( 'ba11yc_ready', function () {

    // A fixed level.
    ba11yc_register_heading_source( 'acme/section', array( 'level' => 2 ) );

    // The level is chosen by the user and stored in an attribute.
    ba11yc_register_heading_source( 'acme/hero', array(
        'attribute' => 'headingLevel',
        'level'     => 2,
    ) );

    // The attribute holds a token rather than a number.
    ba11yc_register_heading_source( 'acme/callout', array(
        'attribute' => 'size',
        'map'       => array( 'large' => 2, 'medium' => 3, 'small' => 4 ),
        'level'     => 3,
    ) );

    // The heading only exists when an optional field has content.
    ba11yc_register_heading_source( 'acme/panel', array(
        'level'    => 2,
        'requires' => 'title',
    ) );

    // The block renders no heading at all.
    ba11yc_register_heading_source( 'acme/quiet', array( 'level' => 0 ) );

    // Several blocks that share the same heading shape.
    ba11yc_register_heading_source(
        array( 'acme/hero', 'acme/card-list', 'acme/feature' ),
        array(
            'attribute' => 'headingLevel',
            'level'     => 2,
        )
    );
} );
```

Any spec shape works with an array, since the spec is resolved once and applied to each block.

The spec is data rather than a callback because the check runs live in the editor, in JavaScript.
For a level that cannot be expressed this way — derived from nesting depth, from sibling state, or
from several attributes at once — use the `ba11yc.blockHeadingLevels` JavaScript filter instead.

## Block\Registry

Direct registry access via `\BlockAccessibility\Block\Registry::get_instance()`. Most external integrations should use `ba11yc_register_block_check()` instead.

### `register_check( $block_type, $check_name, $check_args )`

Register a new accessibility check for a block type.

**Parameters:**
- `$block_type` (string)
- `$check_name` (string)
- `$check_args` (array): Same keys as `ba11yc_register_block_check()` minus `name`

**Returns:** `bool`

### `unregister_check( $block_type, $check_name )`

Remove a previously registered check.

**Returns:** `bool` — true on success, false if check wasn't registered

### `set_check_enabled( $block_type, $check_name, $enabled )`

Enable or disable a specific check.

**Parameters:** `$block_type` (string), `$check_name` (string), `$enabled` (bool)

**Returns:** `bool`

### `is_check_registered( $block_type, $check_name )`

Check if a specific check is registered.

**Returns:** `bool`

### `get_check_config( $block_type, $check_name )`

Get configuration for a specific check.

**Returns:** `array|null`

### `get_checks( $block_type )`

Get all checks for a block type.

**Returns:** `array`

### `get_all_checks()`

Get all registered checks organized by block type.

**Returns:** `array`

### `get_registered_block_types()`

Get all block types that have checks registered.

**Returns:** `array`

### `get_effective_check_level( $block_type, $check_name )`

Get the effective check level, considering any admin overrides from `ba11yc_settings`.

**Returns:** `string` — `'error'`, `'warning'`, or `'none'`

---

## Meta\Registry

Access via `\BlockAccessibility\Meta\Registry::get_instance()`.

### `register_meta_check( $post_type, $meta_key, $check_name, $check_args )`

Register a validation check for a post meta field.

**Returns:** `bool`

### `get_meta_checks( $post_type )`

Get all meta checks for a specific post type, organized by meta key.

**Returns:** `array`

### `get_all_meta_checks()`

Get all registered meta checks organized by post type.

**Returns:** `array`

### `get_meta_check_config( $post_type, $meta_key, $check_name )`

Get configuration for a specific meta check.

**Returns:** `array|null`

### `get_effective_meta_check_level( $post_type, $meta_key, $check_name )`

Get the effective meta check level considering admin overrides.

**Returns:** `string`

---

## Editor\Registry

Access via `\BlockAccessibility\Editor\Registry::get_instance()`.

### `register_editor_check( $post_type, $check_name, $check_args )`

Register an editor-level validation check for a post type.

**Check configuration:**
```php
$check_args = array(
    'namespace'    => 'my-plugin',   // Required
    'error_msg'    => '...',         // Required
    'warning_msg'  => '...',         // Optional
    'description'  => '...',         // Optional
    'level'        => 'error',       // Optional
    'configurable' => true,          // Optional
    'priority'     => 10,            // Optional
    'enabled'      => true,          // Optional
);
```

**Returns:** `bool`

### `register_editor_check_for_post_types( $post_types, $check_name, $check_args )`

Register the same check for multiple post types at once.

**Parameters:**
- `$post_types` (array): e.g., `['post', 'page', 'custom_type']`
- `$check_name` (string)
- `$check_args` (array)

**Returns:** `array` — keyed by post type, each value is `true`/`false`

### `get_editor_checks( $post_type )`

Get all editor checks for a specific post type.

**Returns:** `array`

### `get_all_editor_checks()`

Get all registered editor checks organized by post type.

**Returns:** `array`

### `get_editor_check_config( $post_type, $check_name )`

Get configuration for a specific editor check.

**Returns:** `array|null`

### `get_effective_editor_check_level( $post_type, $check_name )`

Get the effective editor check level considering admin overrides.

**Returns:** `string`

---

## MetaValidation Helper

### `MetaValidation::required( $post_type, $meta_key, $args )`

Create a required-field validator for post meta. Registers the check and returns a `validate_callback` for use with `register_post_meta()`.

**Parameters:**
- `$post_type` (string)
- `$meta_key` (string)
- `$args` (array): Check configuration — must include `namespace`, `error_msg`

**Returns:** `callable`

**Example:**
```php
use BlockAccessibility\Meta\Validator as MetaValidation;

register_post_meta( 'band', 'band_origin', array(
    'validate_callback' => MetaValidation::required( 'band', 'band_origin', array(
        'namespace' => 'my-plugin',
        'error_msg' => 'City of Origin is required.',
        'level'     => 'error',
    ) ),
) );
```

---

## Usage Examples

### Block Checks

```php
add_action( 'ba11yc_ready', function() {
    // Register a check
    ba11yc_register_block_check( 'my-plugin/card-block', array(
        'namespace'    => 'my-plugin',
        'name'         => 'card_title_required',
        'error_msg'    => __( 'Card title is required.', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => false,
    ) );

    // Disable or re-enable via the registry directly
    $registry = \BlockAccessibility\Block\Registry::get_instance();
    $registry->set_check_enabled( 'my-plugin/card-block', 'card_title_required', false );

    // Query all checks for a block type
    $checks = $registry->get_checks( 'my-plugin/card-block' );
} );
```

### Meta Checks

```php
use BlockAccessibility\Meta\Validator as MetaValidation;

register_post_meta( 'band', 'band_origin', array(
    'validate_callback' => MetaValidation::required( 'band', 'band_origin', array(
        'namespace' => 'my-plugin',
        'error_msg' => 'City of Origin is required.',
        'level'     => 'error',
    ) ),
) );
```

### Editor Checks

```php
add_action( 'ba11yc_editor_checks_ready', function() {
    ba11yc_register_editor_check( 'post', array(
        'namespace'    => 'my-plugin',
        'name'         => 'first_block_heading',
        'error_msg'    => __( 'The first block must be a Heading.', 'my-plugin' ),
        'level'        => 'error',
        'configurable' => false,
    ) );
} );
```

---

## See Also

- [Block Attributes Validation](../block-validation/php.md)
- [Post Meta Validation](../meta-validation/php.md)
- [Editor Validation](../editor-validation/php.md)
- [Hooks Reference](./hooks.md)
