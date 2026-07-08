# Upgrading to v4.0

Block Accessibility Checks 4.0 is a major release with **breaking changes to the developer API**. There are no compatibility shims: integrations written against the v3 API must be updated to keep working.

**End users do not need to do anything.** All saved settings (check severity levels, heading level restrictions, site editor options, and external plugin overrides) are migrated automatically to the new storage format on the first page load after updating. The old options are left in place, so downgrading to v3 is safe.

> **⚠️ v3 integrations fail silently in v4.** An un-updated integration will not throw errors or crash the editor — its checks simply stop flagging anything. PHP-side registration mostly still succeeds, so your checks may even appear in the settings table, but the renamed JavaScript filters mean your validation logic never runs and every check passes. If your integration "still works" after updating, verify that it actually flags invalid content.

## At a glance

| | v3 | v4 |
|---|---|---|
| Block check registration | `$registry->register_check( $block_type, $check_name, $args, $plugin_info )` on `ba11yc_ready` | `ba11yc_register_block_check( $block_type, $args )` on `ba11yc_ready` |
| Meta check registration | `$registry->register_meta_check( ... )` | `ba11yc_register_meta_check( $post_type, $args )` |
| Editor check registration | `$registry->register_editor_check( ... )` on `ba11yc_editor_checks_ready` | `ba11yc_register_editor_check( $post_type, $args )` on `ba11yc_editor_checks_ready` |
| Severity config | `'type' => 'error' \| 'warning' \| 'settings' \| 'none'` | `'level' => 'error' \| 'warning' \| 'none'` + `'configurable' => bool` |
| Plugin attribution | `$plugin_info` array (or auto-detection) | Required `'namespace'` key in `$args` |
| JS block validation filter | `ba11yc_validate_block` | `ba11yc.validateBlock` |
| JS editor validation filter | `ba11yc_validate_editor` | `ba11yc.validateEditor` |
| JS meta validation filter | `ba11yc_validate_meta` | `ba11yc.validateMeta` |
| JS config access | `window.BlockAccessibilityChecks` | `getEditorSettings().blockA11yChecks` + the `block-accessibility-checks` data store |
| REST namespace | `block-accessibility/v1` | `block-accessibility-checks/v1` |
| Settings UI | Own submenu page per external plugin | One unified settings table (DataViews), filterable by plugin |

## 1. PHP: update check registration

The `type` key is gone. Severity is now expressed with two keys: `level` (the default severity) and `configurable` (whether an admin may change it in the settings UI). The old `type` values map as follows:

| v3 `type` | v4 equivalent |
|---|---|
| `'settings'` | `'level' => 'error', 'configurable' => true` |
| `'error'` | `'level' => 'error', 'configurable' => false` |
| `'warning'` | `'level' => 'warning', 'configurable' => false` |
| `'none'` | `'level' => 'none', 'configurable' => false` |

A `namespace` key is now **required** — it attributes your checks in the unified settings table (the automatic plugin detection from v3 has been removed). Use your plugin slug. The check `name` moves into the `$args` array, and the `$plugin_info` parameter is gone.

**Before (v3):**

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks( $registry ) {
    $registry->register_check(
        'my-plugin/custom-block',
        'content_length',
        array(
            'error_msg'   => __( 'Content is too long', 'my-plugin' ),
            'type'        => 'settings',
            'category'    => 'validation',
        ),
        array( 'name' => 'My Plugin', 'slug' => 'my-plugin' )
    );
}
```

**After (v4):**

```php
add_action( 'ba11yc_ready', 'my_plugin_register_checks' );

function my_plugin_register_checks() {
    ba11yc_register_block_check(
        'my-plugin/custom-block',
        array(
            'namespace'    => 'my-plugin',
            'name'         => 'content_length',
            'error_msg'    => __( 'Content is too long', 'my-plugin' ),
            'level'        => 'error',
            'configurable' => true,
            'category'     => 'validation',
        )
    );
}
```

Meta and editor checks follow the same pattern with `ba11yc_register_meta_check( $post_type, $args )` (which also takes a `meta_key` in `$args`) and `ba11yc_register_editor_check( $post_type, $args )`. See the [quick start guides](./README.md#quick-start) for complete examples.

**Unchanged:** the `ba11yc_ready` and `ba11yc_editor_checks_ready` actions, the registration lifecycle hooks (`ba11yc_check_registered`, `ba11yc_check_args`, `ba11yc_should_register_check` and their meta/editor variants), and the server-side `ba11yc_validate_meta` PHP filter all work exactly as in v3. New in v4: the `ba11yc_check_level` filter lets you override a check's effective severity at runtime.

## 2. JavaScript: rename your filter hooks

The validation filters were renamed to the dot convention. The arguments are unchanged — this is a find-and-replace:

| v3 filter | v4 filter |
|---|---|
| `ba11yc_validate_block` | `ba11yc.validateBlock` |
| `ba11yc_validate_editor` | `ba11yc.validateEditor` |
| `ba11yc_validate_meta` | `ba11yc.validateMeta` |

```javascript
// Before (v3)
addFilter( 'ba11yc_validate_block', 'my-plugin/validation', callback );

// After (v4)
addFilter( 'ba11yc.validateBlock', 'my-plugin/validation', callback );
```

This is the change that bites silently: hooks on the old names are never applied, so every check passes.

## 3. JavaScript: replace `window.BlockAccessibilityChecks`

The global object is gone. Its replacements:

- **Check configuration** (`validationRules`, `editorValidationRules`, `metaValidationRules`, `blockChecksOptions`, `editorContext`) is now injected into the editor settings. Read it with:

  ```javascript
  import { select } from '@wordpress/data';

  const config = select( 'core/editor' ).getEditorSettings().blockA11yChecks;
  ```

- **Validation state** (current issues, per-block/per-meta validity) lives in the `block-accessibility-checks` data store:

  ```javascript
  import { useSelect } from '@wordpress/data';

  const invalidBlocks = useSelect(
      ( select ) => select( 'block-accessibility-checks' )?.getInvalidBlocks(),
      []
  );
  ```

  Available selectors include `getInvalidBlocks()`, `getInvalidMeta()`, and `getInvalidEditorChecks()`.

  The optional chaining keeps your code working when the plugin is deactivated (the store won't be registered).

- **`useMetaField`** is no longer exposed on the global. Import it from the plugin's editor entry point if your build resolves it, or copy the reference implementation from the [integration example plugin](https://github.com/troychaplin/block-check-integration-example).

## 4. REST API and settings pages

- The REST namespace changed from `block-accessibility/v1` (with per-purpose settings routes) to `block-accessibility-checks/v1`, exposing `GET /checks` (all registered checks, with plugin attribution) and `GET|POST /settings`. The v3 routes were internal to the old settings pages and no longer exist.
- External plugins **no longer get their own settings submenu page**. All configurable checks from all plugins now appear in the single Block Checks settings table, filterable by plugin — you get settings UI for free with no extra code. Bookmarks and links to any old `block-a11y-checks-*` submenu slug (including external plugin pages) are redirected to the unified page, but you should still update any hardcoded links in your plugin to point at `admin.php?page=block-a11y-checks`.

## Migration checklist

- [ ] Replace `$registry->register_check()` / `register_meta_check()` / `register_editor_check()` calls with the `ba11yc_register_*` functions
- [ ] Only call `ba11yc_register_*` from the `ba11yc_ready` / `ba11yc_editor_checks_ready` actions (they never fire when the plugin is inactive), or guard with `function_exists()` — calling them from a plain `init` hook fatals when Block Accessibility Checks is deactivated
- [ ] Convert every `'type'` key to `'level'` + `'configurable'`
- [ ] Add a `'namespace'` key (your plugin slug) to every registration
- [ ] Rename JS filters: `ba11yc_validate_block` → `ba11yc.validateBlock`, `ba11yc_validate_editor` → `ba11yc.validateEditor`, `ba11yc_validate_meta` → `ba11yc.validateMeta`
- [ ] Replace `window.BlockAccessibilityChecks` reads with `getEditorSettings().blockA11yChecks` and the `block-accessibility-checks` store
- [ ] Update any hardcoded REST routes or settings page links
- [ ] **Verify in the editor that invalid content is actually flagged** — a silently dead integration looks identical to a passing one
