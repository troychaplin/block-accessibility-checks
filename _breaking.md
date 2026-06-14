# BAC v4 — Consolidate the Validation API plugins into Block Accessibility Checks

## Context

**Block Accessibility Checks (BAC)** is a shipping WordPress plugin (currently v3.0.2) that adds WCAG
error/warning validation to core blocks in the editor. We previously split its logic out into three modern
plugins to prove a cleaner architecture:

- **validation-api** — the engine: `AbstractRegistry` base class, global registration functions, a
  `@wordpress/data` Redux store, an `editor.validateBlock` filter, `block_editor_settings_all` config
  injection, a read-only REST checks endpoint, and a runtime severity-override filter.
- **validation-api-core-blocks** — the core block checks (image/button/heading/table), split into an add-on.
- **validation-api-settings** — a single **DataViews** (`@wordpress/dataviews` v15) settings page listing
  every registered check from every plugin in one filterable table.

The goal now is to **bring all three back into the single BAC plugin** in a streamlined, better-integrated
form — adopting the validation-api architecture wholesale, but under BAC's own brand/conventions. The headline
wins: one DataViews settings page replaces BAC's three React submenu pages, and the per-external-plugin submenu
system is **deleted** entirely (DataViews' plugin filter handles multi-plugin attribution). This is a major,
breaking release → **v4.0.0**.

### Decisions (confirmed with user)

1. **Naming:** keep BAC's `ba11yc_` prefix and `BlockAccessibility\` namespace everywhere. Rebrand
   validation-api's API onto it (not `validation_api_`).
2. **Clean break at v4.0:** run the run-once **data migration** (non-negotiable — preserves user settings),
   but ship **no API compatibility shims**. The legacy `type`-based `register_check()` signature, the old
   `ba11yc_validate_block` JS filter, the `window.BlockAccessibilityChecks` global, and the
   `plugin_info` auto-detection are all removed. Integrators must update to the new API.
3. **Keep per-check site-editor control:** preserve the ability to disable each check specifically in the
   site editor (an extra DataViews column + migration of the old `*_site_editor` flags), rather than
   collapsing to one global toggle.
4. **Keep `category`:** retain the `accessibility | validation` field as a passthrough arg surfaced as an
   extra DataViews filter.

---

## Naming convention (final)

| Concern | BAC v4 |
|---|---|
| PHP hook prefix | `ba11yc_` |
| Global registration fns | `ba11yc_register_block_check()` / `_meta_check()` / `_editor_check()` |
| Runtime level override filter | `ba11yc_check_level` (context: scope + ids + check_name) |
| JS validation filter | `ba11yc.validateBlock` (only — old `ba11yc_validate_block` removed) |
| Redux store key | `block-accessibility-checks` (avoid `core/*`) |
| REST namespace | `block-accessibility-checks/v1` → `GET /checks`, `GET|POST /settings` |
| Settings option | single nested `ba11yc_settings` |
| Editor config inject | `getEditorSettings().blockA11yChecks` (via `block_editor_settings_all`) |

---

## Target architecture

### PHP — `includes/` (namespace `BlockAccessibility\`)

```
includes/
  AbstractRegistry.php       NEW — port validation-api's base: normalize_args, stamp_namespace (_namespace),
                                   sort_by_priority, apply_level_filter (uses ba11yc_check_level)
  Block/
    Registry.php             extends AbstractRegistry. DELETE plugin_info/detect_plugin_info/
                                   find_main_plugin_file/extract_plugin_info_from_block_type/plugin_info_cache
                                   and the 4th $plugin_info param (clean break). Require `namespace` arg.
    CoreChecks.php           KEEP — rewrite defs to level+configurable+category+namespace
    HeadingLevels.php        KEEP — reads ba11yc_settings['general']['headingLevels']
  Meta/    Registry.php (extends AbstractRegistry) + Validator.php (keep)
  Editor/  Registry.php (extends AbstractRegistry) + CoreChecks.php (rewrite defs)
  Rest/
    ChecksController.php     PORT — GET .../v1/checks (all block/meta/editor checks, _namespace attributed)
    SettingsController.php   PORT — GET/POST .../v1/settings (reads/writes ba11yc_settings, sanitizes)
  Filter/
    LevelOverride.php        PORT — hooks ba11yc_check_level, reads ba11yc_settings overrides + per-check
                                   site-editor flags; returns 'none' when disabled for the active context
  Core/
    Plugin.php               KEEP service locator; wire in Rest/, Filter/, Upgrade/, settings page
    Assets.php               REWRITE — block_editor_settings_all injection under blockA11yChecks; editor
                                   handle → build/block-checks.js; admin path loads build/settings.js on the
                                   BAC settings page only
    Settings.php             SHRINK to ~1 menu page + render root (see below). DELETE the 3 enqueue_react_*,
                                   3 get_*_settings_data, external-plugin menu generation, sanitize callbacks
    SettingsAPI.php          DELETE — replaced by Rest/SettingsController
    I18n.php, Traits/        KEEP (EditorDetection, Logger)
  Upgrade/
    Migrator.php             NEW — run-once v3→v4 data migration keyed on ba11yc_db_version
```

### JS — `src/`

```
src/
  editor/
    index.js          entry (→ build/block-checks.js); bootstraps store + side-effect imports
    store/            PORT — actions/selectors/reducer/index (Redux store 'block-accessibility-checks')
    hooks/            PORT — validate-block (editor.BlockEdit), block-validation-classes (BlockListBlock),
                            pre-save-validation, register-sidebar, use-validation-sync, use-validation-lifecycle
    components/       PORT — validation-sidebar, validation-toolbar-button, validation-icon
    utils/            PORT — validate-block/meta/editor, issue-helpers, use-debounced-validation,
                            get-validation-config (reads getEditorSettings().blockA11yChecks)
    checks/           PORT core-image/button/table/heading JS from validation-api-core-blocks, hooked to
                            ba11yc.validateBlock
  settings/
    index.js          entry (→ build/settings.js); mounts the DataViews app
    App.js            PORT validation-api-settings DataViews app + General panel + site-editor column
    components/SeveritySelect.js   PORT
    components/GeneralPanel.js      NEW — heading-levels checkboxes + global site-editor toggle
    utils/transform.js             PORT transformChecksToRows / rowsToSettings (extended for category +
                                          per-check site-editor + general)
```

DELETE the legacy `src/admin/*` (three React pages) and `src/editor/validation/*` trees.

---

## Check data model: `type`+`category` → `level`+`configurable`+`category`

New per-check config (registration args): `namespace` (required), `name`, `error_msg`, `warning_msg`,
`level` (`error|warning|none`, default severity), `configurable` (bool — may the admin change it?),
`category` (`accessibility|validation`, label/filter only), `priority`, `enabled`, `description`.

`type` is **removed** (clean break). The old `type` values map conceptually as: `settings`→`level:error,
configurable:true`; `error`/`warning`/`none`→that `level`, `configurable:false`. Core checks are rewritten to
the new keys directly; external registrants must update (no translation shim). `configurable:false` rows are
omitted from the DataViews table (reproducing "forced checks aren't user-editable").

All bundled core checks (`core/button` ×2, `core/image` ×4, `core/table` ×1, `core/heading` ×1, plus
Editor/Meta core checks) get the mechanical rewrite with `namespace => 'block-accessibility-checks'`.

---

## Settings: 3 submenu pages → 1 DataViews page

Single top-level menu `block-a11y-checks` renders one React root. The app:

- Loads checks from `GET .../v1/checks` and overrides from `GET .../v1/settings`.
- **DataViews table** of all configurable block/meta/editor checks from all plugins, attributed by
  `_namespace`. Columns: description, target, check_type (scope), **category** (filter), plugin_name (filter),
  **level** (SeveritySelect: error/warning/disabled), **site-editor** (per-check toggle column). Filters,
  search, sort, pagination, and a "Reset to default" row action (port from validation-api-settings).
- **General panel** (new, rendered above the table; `@wordpress/components`): heading-levels removal
  checkboxes (H1/H5/H6) + a global "validate in site editor" toggle. Saves into `ba11yc_settings['general']`.
- One POST to `.../v1/settings` writes the whole nested option in a single round-trip.

This deletes `add_external_plugin_menus`, `add_post_page_validation_menu`, `external_plugin_settings_page`,
`get_external_plugins_with_settings`, and all `enqueue_react_*` / `get_*_settings_data` methods.

### `ba11yc_settings` shape (only overrides stored; unset = registered default)

```php
[
  'block'      => [ '{block_type}' => [ '{check}' => 'error|warning|none' ] ],
  'meta'       => [ '{post_type}'  => [ '{meta_key}' => [ '{check}' => 'level' ] ] ],
  'editor'     => [ '{post_type}'  => [ '{check}' => 'level' ] ],
  'siteEditor' => [ 'block'|'meta'|'editor' => ... same shape ... => bool ],  // per-check site-editor disable
  'general'    => [ 'headingLevels' => ['h1','h5','h6'], 'siteEditorEnabled' => bool ],
]
```

`LevelOverride` resolves a check's effective level from `block|meta|editor`; when the active editor context is
the site editor, it additionally consults `general.siteEditorEnabled` and the per-check `siteEditor` flag,
returning `'none'` (skip) when disabled.

---

## Data migration (`Upgrade/Migrator.php`)

Run on **late `init` (priority 99)** — after CoreChecks and add-ons have registered, so the registries are the
source of truth for splitting concatenated keys. Compare `get_option('ba11yc_db_version')` to `BA11YC_VERSION`;
if `< 4.0.0`, run `migrate_v3_to_v4()` then stamp `ba11yc_db_version = '4.0.0'`.

Map old options → new nested `ba11yc_settings`:

- `block_checks_options`:
  - `core_heading_levels` → `general.headingLevels`
  - `{block_type}_{check}` (e.g. `core/image_check_image_alt_text`) → `block.{block_type}.{check}` —
    **split using registered `{block_type => [checks]}` candidates, NOT a regex** (block_type contains `/`
    but the join is `_`).
  - `{...}_{check}_site_editor` booleans → `siteEditor.block.{block_type}.{check}`
- `block_checks_site_editor_options.enabled` → `general.siteEditorEnabled`
- `block_checks_meta_{post_type}`: `editor_{check}` → `editor.{pt}.{check}`;
  `meta_{pt}_{meta_key}_{check}` → `meta.{pt}.{meta_key}.{check}` (registry-driven parse)
- `block_checks_external_{slug}` (scan `wp_load_alloptions`): `{block_type}_{check}` → `block.{block_type}.{check}`

**Safety:** do not delete old options in v4.0 (allows downgrade); log a debug summary. Optionally expose a
WP-CLI `wp ba11yc migrate` and an admin "re-run migration" affordance for support. Schedule old-option removal
for a later release.

---

## Breaking changes (clean break — accepted)

**End users:** settings are preserved via migration. Bookmarks to old submenu slugs
(`block-a11y-checks-post-page`, `block-a11y-checks-{slug}`) 404 — add cheap `admin_menu` redirects to the
unified page (user-facing convenience, not an API shim). Per-check site-editor control is **retained**;
`category` is **retained** as a filter.

**External developers (no shims):**
- `Registry::register_check($bt,$cn,$args,$plugin_info)` → new `ba11yc_register_block_check($block_type,$args)`
  with `namespace`+`level`+`configurable`; the 4th `plugin_info` param and `type` key are removed.
- JS validators on `ba11yc_validate_block` must move to `ba11yc.validateBlock`.
- JS reading `window.BlockAccessibilityChecks` must read `getEditorSettings().blockA11yChecks`.
- Per-external-plugin submenu auto-generation removed; integrators' checks now appear automatically in the
  DataViews table (filtered by their `namespace`).

All documented in an upgrade guide / CHANGELOG shipped with v4.0.0.

---

## Build / tooling

- **package.json:** add `@wordpress/dataviews` (^15); ensure `@wordpress/components`, `@wordpress/api-fetch`
  in deps; keep `tldts` (URL validators). Add `test`/`test:watch` (`wp-scripts test-unit-js`) and port
  validation-api's store/util Jest tests.
- **webpack.config.js:** collapse the five entries to two —
  `'block-checks' → src/editor/index.js`, `'settings' → src/settings/index.js`. Delete `settings-core-blocks`,
  `settings-editor-validation`, `settings-external-plugins`, `block-admin`. Add a `@settings` alias.
- **composer.json:** PSR-4 `BlockAccessibility\ → includes/` already covers new `Rest/`, `Filter/`, `Upgrade/`,
  and root `AbstractRegistry.php`.
- Bump `BA11YC_VERSION` and plugin header to **4.0.0**; update "Requires" if DataViews needs a newer WP.

---

## Phasing (each phase keeps the plugin shippable)

- **Phase 0 — Prep:** add `Upgrade/Migrator` scaffold (no-op) + `ba11yc_db_version`. Snapshot current behavior.
- **Phase 1 — PHP model:** add `AbstractRegistry`; registries extend it; switch to `level`+`configurable`
  (+`category` passthrough); add `ba11yc_check_level` filter; rewrite CoreChecks defs. Old React pages still
  serve from old options. Verify editor validation unchanged.
- **Phase 2 — REST:** add `Rest/ChecksController`, `Rest/SettingsController`, `Filter/LevelOverride` reading
  `ba11yc_settings`.
- **Phase 3 — Migration:** implement `migrate_v3_to_v4()` (late `init`, registry-driven splitting, incl.
  `*_site_editor` flags). Verify levels resolve identically before/after via REST.
- **Phase 4 — JS runtime:** port Redux store, `ba11yc.validateBlock` filter, debounced validation,
  sidebar/toolbar/icon components, core-block JS checks; switch config to `getEditorSettings().blockA11yChecks`.
  Remove `src/editor/validation/*`. Verify error/warning/post-lock behavior.
- **Phase 5 — DataViews UI:** port `App.js`/`SeveritySelect`/`transform.js`; add General panel + per-check
  site-editor column; reduce `Core/Settings.php` to one page; add old-slug redirects. Verify save round-trip
  and overrides apply (incl. site-editor disable).
- **Phase 6 — Cleanup:** delete `SettingsAPI.php`, `src/admin/*`, dead `plugin_info` detection, obsolete
  webpack entries. Bump to v4.0.0. Write upgrade guide / CHANGELOG.

---

## Verification

- **PHP unit/static:** `composer` lint (phpcs), and a focused test that `ba11yc_settings` resolves the same
  effective levels post-migration as the v3 options did (diff `get_effective_check_level` across all
  registered checks before/after).
- **REST:** `GET /wp-json/block-accessibility-checks/v1/checks` returns all checks with `_namespace`;
  `POST /settings` round-trips and `GET` reflects the change.
- **Editor (manual / Playground):** in the post editor, an image with no alt text shows an error, locks
  publishing, and appears in the sidebar/toolbar; changing its level to "warning" in DataViews unlocks
  publishing and downgrades the notice; disabling its site-editor flag suppresses it in the site editor only.
- **Migration:** install over a v3 install with customized settings; confirm every customization (levels,
  heading-levels, per-check site-editor flags, external-plugin overrides) survives into `ba11yc_settings`.
- **Build:** `npm run build` produces exactly `build/block-checks.*` and `build/settings.*`; no references to
  the deleted entry points remain.
- **Lint:** `npm run lint`, `npm run format`, `wp-scripts test-unit-js` all pass.