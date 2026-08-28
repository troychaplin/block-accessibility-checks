# External Plugin Integration

This guide explains how to integrate external plugins and custom blocks with the Block Accessibility Checks Validation API, enabling dedicated accessibility validation for your blocks.

> **Upgrading from v3?** The registration API changed significantly in v4.0.0. Jump to [Upgrading from v3](#upgrading-from-v3) for a complete before/after reference.

## Overview

External plugins register validation checks in PHP (configuration) and implement the validation logic in JavaScript (real-time feedback). Registered checks automatically appear in the unified Block Accessibility Checks settings table, attributed to your plugin via the required `namespace` field.

## Quick Start

### 1. Register Checks in PHP

Use `ba11yc_register_block_check()` inside the `ba11yc_ready` action. The `namespace` and `name` keys are required:

```php
<?php
add_action( 'ba11yc_ready', function() {
    ba11yc_register_block_check(
        'your-plugin/your-block',
        array(
            'namespace'    => 'your-plugin',
            'name'         => 'check_name',
            'error_msg'    => __( 'Error message', 'your-text-domain' ),
            'warning_msg'  => __( 'Warning message', 'your-text-domain' ),
            'description'  => __( 'Check description', 'your-text-domain' ),
            'level'        => 'error',   // default severity: 'error', 'warning', or 'none'
            'configurable' => true,      // true = admin can change the level in settings
            'category'     => 'accessibility', // 'accessibility' or 'validation'
        )
    );
} );
```

### 2. Implement Validation in JavaScript

All validation logic runs in JavaScript for real-time feedback. Use the `ba11yc.validateBlock` filter:

```javascript
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-plugin/card-block') {
            return isValid;
        }
        switch (checkName) {
            case 'check_title':
                return !!(attributes.title && attributes.title.trim());
            case 'check_image_alt':
                return !!(attributes.imageAlt && attributes.imageAlt.trim());
            default:
                return isValid;
        }
    }
);
```

## Check Configuration

### Required Keys

- **`namespace`** (string) — Your plugin's identifier. Used to attribute checks to your plugin in the DataViews settings table.
- **`name`** (string) — Unique check name within the block type.
- **`error_msg`** (string) — Message shown when the check fails.

### Optional Keys

- **`warning_msg`** (string) — Warning message (defaults to `error_msg`).
- **`description`** (string) — Description shown in the settings UI.
- **`level`** (string) — Default severity: `'error'`, `'warning'`, or `'none'`. Default: `'error'`.
- **`configurable`** (bool) — Whether the admin can change the level in settings. Default: `true`.
- **`category`** (string) — `'accessibility'` or `'validation'`. Used as a filter in the settings table.
- **`priority`** (int) — Execution order (lower = earlier). Default: `10`.
- **`enabled`** (bool) — Whether the check is active. Default: `true`.

### `level` and `configurable` Together

| Goal | `level` | `configurable` |
|---|---|---|
| User-configurable check (starts as error) | `'error'` | `true` |
| User-configurable check (starts as warning) | `'warning'` | `true` |
| Fixed error, not configurable | `'error'` | `false` |
| Fixed warning, not configurable | `'warning'` | `false` |
| Disabled by default | `'none'` | `true` |

Checks with `configurable: false` are omitted from the settings table (they cannot be changed).

## Declaring Heading Sources

The heading order check (`check_heading_rank`) compares every heading in the document, not just
`core/heading` blocks. For it to see a heading your block renders, it has to know the level.

### Most blocks need nothing

Two kinds of block are recognized automatically:

- **Core's heading blocks** — `core/post-title`, `core/site-title`, `core/query-title`,
  `core/comments-title`, `core/site-tagline`, `core/term-name`, `core/widget-group`, and
  `core/accordion-heading`.
- **Any block storing its heading level in a numeric `level` attribute.** This is the convention
  core itself uses, where `0` means the block renders a paragraph rather than a heading. If your
  block already offers a heading level control that way, it works with no registration.

Check what was detected from the browser console in the editor:

```javascript
wp.data.select( 'core/editor' ).getEditorSettings().blockA11yChecks.headingSources;
```

### Declaring the rest

For a block that renders a heading some other way, register it on `ba11yc_ready`:

```php
add_action( 'ba11yc_ready', function () {

    // A fixed level.
    ba11yc_register_heading_source( 'my-plugin/section', array( 'level' => 2 ) );

    // The level is chosen by the user, stored under a different attribute name.
    ba11yc_register_heading_source( 'my-plugin/hero', array(
        'attribute' => 'headingLevel',
        'level'     => 2,               // used when the attribute is unset
    ) );

    // The attribute holds a token rather than a number.
    ba11yc_register_heading_source( 'my-plugin/callout', array(
        'attribute' => 'size',
        'map'       => array( 'large' => 2, 'medium' => 3, 'small' => 4 ),
        'level'     => 3,
    ) );

    // The heading only exists when an optional field has content. Without this,
    // an empty block would still be counted as rendering a heading.
    ba11yc_register_heading_source( 'my-plugin/panel', array(
        'level'    => 2,
        'requires' => 'title',
    ) );

    // The block renders no heading. Also useful to exclude a block that would
    // otherwise be detected.
    ba11yc_register_heading_source( 'my-plugin/quiet', array( 'level' => 0 ) );

    // Several blocks sharing one shape — the common case in a block library.
    ba11yc_register_heading_source(
        array( 'my-plugin/hero', 'my-plugin/card-list' ),
        array(
            'attribute' => 'headingLevel',
            'level'     => 2,
        )
    );
} );
```

This works for any block, including ones belonging to another plugin, which is why it is the
recommended surface.

### Declaring in `block.json`

If you own the block and would rather keep the declaration with it:

```json
{
    "supports": {
        "ba11yc": {
            "headingLevel": { "level": 2, "requires": "title" }
        }
    }
}
```

A bare number works as shorthand (`"headingLevel": 2`), and `false` means the block renders no
heading. PHP registration overrides anything declared here.

### Computed levels

When the level cannot be expressed as data — it depends on nesting depth, on sibling state, or on
several attributes at once — use the JavaScript filter, which overrides everything above:

```javascript
addFilter(
    'ba11yc.blockHeadingLevels',
    'my-plugin/heading-levels',
    ( levels, block ) => {
        if ( block.name !== 'my-plugin/section' ) {
            return levels;
        }
        return [ block.attributes.depth + 1 ];
    }
);
```

Return `[]` for no heading, or several entries for a block that renders more than one.

### Notes

- A declared block is also **flagged** when it is the block that skips a level, not just counted as
  context for the headings around it.
- No settings row is created. Severity follows the single **Heading level order** row, so turning
  that off turns it off everywhere.

## Settings Integration

Checks with `'configurable' => true` appear in the unified DataViews settings table under **Block Accessibility Checks**. Admins can filter by your `namespace` to see only your plugin's checks. There are no per-plugin submenus — all plugins share the single table.

## Complete Integration Example

```php
<?php
/**
 * Plugin Name: My Custom Blocks
 * Version: 1.0.0
 * Text Domain: my-custom-blocks
 */

class MyCustomBlocksIntegration {
    public function __construct() {
        add_action( 'ba11yc_ready', array( $this, 'register_checks' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_validation_script' ) );
    }

    public function register_checks() {
        // Card block — title check
        ba11yc_register_block_check(
            'my-custom-blocks/card',
            array(
                'namespace'    => 'my-custom-blocks',
                'name'         => 'check_title',
                'error_msg'    => __( 'Card title is required.', 'my-custom-blocks' ),
                'warning_msg'  => __( 'Consider adding a title for better accessibility.', 'my-custom-blocks' ),
                'description'  => __( 'Card title validation', 'my-custom-blocks' ),
                'level'        => 'error',
                'configurable' => true,
                'category'     => 'accessibility',
            )
        );

        // Card block — image alt text check
        ba11yc_register_block_check(
            'my-custom-blocks/card',
            array(
                'namespace'    => 'my-custom-blocks',
                'name'         => 'check_image_alt',
                'error_msg'    => __( 'Card image requires alt text.', 'my-custom-blocks' ),
                'warning_msg'  => __( 'Alt text is recommended for card images.', 'my-custom-blocks' ),
                'description'  => __( 'Image alt text validation', 'my-custom-blocks' ),
                'level'        => 'warning',
                'configurable' => true,
                'category'     => 'accessibility',
            )
        );
    }

    public function enqueue_validation_script() {
        $asset_file = include plugin_dir_path( __FILE__ ) . 'build/validation.asset.php';

        // Start with base dependencies.
        $dependencies = $asset_file['dependencies'];

        // Only add Block Accessibility Checks as a dependency if it's active.
        // This allows your plugin to work even when BAC is deactivated.
        if ( wp_script_is( 'block-accessibility-script', 'registered' ) ) {
            $dependencies[] = 'block-accessibility-script';
        }

        wp_enqueue_script(
            'my-custom-blocks-validation',
            plugins_url( 'build/validation.js', __FILE__ ),
            $dependencies,
            isset( $asset_file['version'] ) ? $asset_file['version'] : '1.0.0',
            true
        );
    }
}

new MyCustomBlocksIntegration();
```

```javascript
// build/validation.js (src)
import { addFilter } from '@wordpress/hooks';

addFilter(
    'ba11yc.validateBlock',
    'my-custom-blocks/validation',
    (isValid, blockType, attributes, checkName) => {
        if (blockType !== 'my-custom-blocks/card') {
            return isValid;
        }
        switch (checkName) {
            case 'check_title':
                return !!(attributes.title && attributes.title.trim());
            case 'check_image_alt':
                return !!(attributes.imageAlt && attributes.imageAlt.trim());
            default:
                return isValid;
        }
    }
);
```

## User Interface

Registered checks automatically appear in the block editor:

- **Unified Sidebar** — All validation issues consolidated in one panel (click the accessibility icon in the toolbar).
- **Block Indicators** — Blocks with issues display a badge. Clicking it shows a popover with details.
- **Header Badge** — Total error/warning count shown in the editor toolbar.
- **Post Locking** — Checks resolving to `'error'` level prevent publishing until resolved.

## Block Naming Convention

Use a consistent namespace for all blocks from your plugin:

```php
// Good: consistent namespace
'your-plugin/block-one'
'your-plugin/block-two'

// Avoid: inconsistent namespaces — they appear as separate plugins in the settings table
'plugin1/block-one'
'plugin2/block-two'
```

## Best Practices

- Use unique block type and check names to avoid conflicts with other plugins.
- Register checks in the `ba11yc_ready` action.
- Provide clear, actionable error and warning messages.
- Keep your JavaScript validation logic simple and fast.
- Use the same `namespace` value for every check in your plugin so they group together in the settings table.

## Upgrading from v3

v4.0.0 is a clean-break release. There are no compatibility shims — all integrations must update. This section covers block checks; for the complete migration reference (meta and editor checks, the data store, REST changes, and the settings migration), see the **[Upgrading to v4.0 guide](../upgrade-to-v4.md)**.

### 1. PHP Registration Function

The `$registry->register_block_check()` method called on the `$registry` passed to `ba11yc_ready` is replaced by the global `ba11yc_register_block_check()` function. The check name moves from its own parameter into `$args['name']`.

**Before (v3):**
```php
add_action( 'ba11yc_ready', function( $registry ) {
    $registry->register_block_check(
        'my-plugin/card',
        'check_title',           // second positional param
        array(
            'error_msg'  => 'Title required.',
            'type'       => 'settings',
            'category'   => 'accessibility',
        )
        // optional 4th $plugin_info array was here
    );
} );
```

**After (v4):**
```php
add_action( 'ba11yc_ready', function() {  // $registry param no longer needed
    ba11yc_register_block_check(
        'my-plugin/card',
        array(
            'namespace'    => 'my-plugin',   // required
            'name'         => 'check_title', // moved into $args
            'error_msg'    => 'Title required.',
            'level'        => 'error',       // replaces 'type'
            'configurable' => true,          // replaces type:'settings'
            'category'     => 'accessibility',
        )
    );
} );
```

### 2. `type` → `level` + `configurable`

The `'type'` key is removed. Replace it with `'level'` (default severity) and `'configurable'` (whether the admin can change it).

| v3 `type` | v4 `level` | v4 `configurable` |
|---|---|---|
| `'settings'` | `'error'` | `true` |
| `'error'` | `'error'` | `false` |
| `'warning'` | `'warning'` | `false` |
| `'none'` | `'none'` | `false` |

### 3. JavaScript Filter Hook Name

**Before (v3):**
```javascript
addFilter(
    'ba11yc_validate_block',   // underscore-separated
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => { /* ... */ }
);
```

**After (v4):**
```javascript
addFilter(
    'ba11yc.validateBlock',    // dot-separated camelCase
    'my-plugin/validation',
    (isValid, blockType, attributes, checkName) => { /* ... */ }
);
```

### 4. Editor Config Global Removed

**Before (v3):**
```javascript
const rules = window.BlockAccessibilityChecks?.validationRules || {};
```

**After (v4):**
```javascript
import { select } from '@wordpress/data';
const { blockA11yChecks } = select( 'core/editor' ).getEditorSettings();
```

### 5. Per-Plugin Submenus Removed

Previously, each plugin with `type: 'settings'` checks got an auto-generated submenu page under the Block Accessibility Checks admin menu. Those submenus are gone. Your checks now appear in the unified DataViews settings table alongside all other plugins' checks. Filter by your `namespace` to see only your checks.

No code change is required for this — it's purely a UI change. If you had bookmarked URLs pointing to old submenu slugs (`block-a11y-checks-{your-slug}`), they redirect to the unified page.

## Troubleshooting

### Checks Not Appearing in the Settings Table

1. Confirm `ba11yc_register_block_check()` is called inside `ba11yc_ready`.
2. Ensure `'namespace'`, `'name'`, and `'error_msg'` are all present in `$args`.
3. Checks with `'configurable' => false` are intentionally excluded from the table.

### Incorrect Plugin Attribution

All checks from your plugin should share the same `namespace` value. If they appear under different groups, different `namespace` values are being passed.

### Validation Not Running

Ensure your JavaScript file is enqueued on `enqueue_block_editor_assets` and includes `block-accessibility-script` as a dependency (when registered).

## See Also

- [Block Attributes Validation](../block-validation/quick-start.md)
- [Post Meta Validation](../meta-validation/quick-start.md)
- [Editor Validation](../editor-validation/quick-start.md)
- [API Reference](../reference/api.md)
- [Hooks Reference](../reference/hooks.md)
