# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Prefix the change with one of these keywords:

- _Added_: for new features.
- _Changed_: for changes in existing functionality.
- _Deprecated_: for soon-to-be removed features.
- _Improved_: for enhancements to code or architecture.
- _Removed_: for now removed features.
- _Fixed_: for any bug fixes.
- _Security_: in case of vulnerabilities.

## [Unreleased]

### Changed

- Image alt text error now reads "Images are required to have alternative text or be marked as decorative", surfacing the native decorative-image option that WordPress 7.1 adds to `core/image`; on WordPress 6.7–7.0 no decorative control exists, so alt text remains the only available fix there
- Site Editor toggles in the settings table now announce "Enable in Site Editor" rather than "Enable"; the label is hidden from vision, so screen reader users heard a context-free "Enable" on every row with no indication of which column it controlled
- Editor sidebar retitled "Accessibility & Validation" (previously "Validation")
- Blocks with accessibility issues are now marked with a 2px outline around the whole block (red for errors, yellow for warnings), replacing the small triangle in the block's top-left corner; the outline identifies the affected block at a glance instead of relying on a 15px corner marker that was easy to overlook
- Outline colors switched to the darker `--ba11yc-dark-red` / `--ba11yc-dark-yellow` tokens; the previous bright yellow (`#f0dc00`) had only ~1.4:1 contrast against a white canvas, well under the 3:1 minimum for non-text UI indicators (WCAG 1.4.11), so warning outlines were nearly invisible on most blocks
- Editor header sidebar icon now shows a light-red/light-yellow chip with a dark-red/dark-yellow glyph when errors or warnings are present (previously a plain currentColor icon with ad hoc red/yellow fill); the pressed state is untouched, so core's default dark background and white icon still apply when the sidebar is open
- Build tooling migrated from npm to pnpm — `pnpm-lock.yaml` replaces `package-lock.json`; run `corepack enable && pnpm install` after pulling
- Updated `@wordpress/*` packages, most notably `components` 35 → 39 and `dataviews` 16 → 18, which back the settings UI

## [4.0.0]

> **Developer note:** This release contains breaking changes to the registration API and JavaScript filter hooks. Settings migrate automatically on first load after upgrading, so admins need take no action — but see **Decorative Images** below for the one change that does affect existing post content. See [docs/upgrade-to-v4.md](docs/upgrade-to-v4.md) for a full migration checklist.

### Breaking Changes

#### PHP Registration API

The registry-method approach for registering checks has been replaced with top-level functions. The `$plugin_info` array parameter is gone; plugin attribution now uses a required `namespace` key inside `$args`. The `'type'` key is replaced with two explicit keys: `'level'` (default severity: `error`, `warning`, or `none`) and `'configurable'` (whether the admin can change it in the settings UI).

| v3 | v4 |
|---|---|
| `$registry->register_check( $block_type, $name, $args, $plugin_info )` on `ba11yc_ready` | `ba11yc_register_block_check( $block_type, $args )` on `ba11yc_ready` |
| `$registry->register_meta_check( ... )` | `ba11yc_register_meta_check( $post_type, $args )` |
| `$registry->register_editor_check( ... )` on `ba11yc_editor_checks_ready` | `ba11yc_register_editor_check( $post_type, $args )` on `ba11yc_editor_checks_ready` |
| `'type' => 'settings'` | `'level' => 'error', 'configurable' => true` |
| `'type' => 'error'` | `'level' => 'error', 'configurable' => false` |
| `'type' => 'warning'` | `'level' => 'warning', 'configurable' => false` |

#### JavaScript Filter Hooks

Filter names changed to dot notation. Arguments are identical — this is a find-and-replace:

| v3 | v4 |
|---|---|
| `ba11yc_validate_block` | `ba11yc.validateBlock` |
| `ba11yc_validate_editor` | `ba11yc.validateEditor` |
| `ba11yc_validate_meta` | `ba11yc.validateMeta` |

Hooks registered on the old names are silently ignored: every check passes without error. Always verify that your integration actually flags invalid content after updating.

#### JavaScript Global Removed

`window.BlockAccessibilityChecks` is gone. Read check configuration from the editor settings and validation state from the WordPress data store:

```javascript
// Check configuration
const config = select( 'core/editor' ).getEditorSettings().blockA11yChecks;

// Validation state
const invalidBlocks = useSelect(
    ( select ) => select( 'block-accessibility-checks' )?.getInvalidBlocks(),
    []
);
```

#### Decorative Images

The plugin no longer registers its own `isDecorative` attribute or the "Accessibility Settings" inspector panel on `core/image`. Marking an image decorative is now WordPress core's feature, added in **WordPress 7.1**.

The attribute name is unchanged, so the saved value carries forward — but core's version writes `role="none"` onto the `<img>` in the block's save output, where the plugin's never altered the markup at all. Existing content therefore behaves differently depending on the WordPress version:

| WordPress | Effect on images marked decorative in v3 |
|---|---|
| 7.1+ | Block validation fails on first edit ("this block contains unexpected or invalid content") because the stored markup lacks the `role="none"` core now generates. Attempting recovery re-saves the block correctly and the decorative flag is kept. |
| 6.7 – 7.0 | Nothing registers `isDecorative`, so the flag is ignored: affected images are reported as missing alt text, and the value is dropped from post content on the next save. |

#### REST API Namespace

Changed from `block-accessibility/v1` to `block-accessibility-checks/v1`. The new namespace exposes `GET /checks` and `GET|POST /settings`. The v3 routes no longer exist.

#### Settings Pages

External plugins no longer receive their own submenu page. All configurable checks from all plugins appear in the single unified settings table, filterable by plugin. Bookmarked `block-a11y-checks-*` subpages redirect to the unified page automatically.

### Added

- `ba11yc_register_block_check()`, `ba11yc_register_meta_check()`, `ba11yc_register_editor_check()` global functions as the new registration API
- `ba11yc_check_level` filter for overriding a check's effective severity at runtime without touching saved settings
- `block-accessibility-checks` WordPress data store with `getInvalidBlocks()`, `getInvalidMeta()`, and `getInvalidEditorChecks()` selectors
- REST API at `block-accessibility-checks/v1`: `GET /checks` exposes all registered checks with plugin attribution; `GET|POST /settings` reads and writes all configurable settings
- `AbstractRegistry` base class shared by block, meta, and editor registries
- Automatic one-time migration of v3 settings (multiple flat options) into the unified `ba11yc_settings` option; v3 options are preserved so downgrading is safe
- Legacy `block-a11y-checks-*` submenu slugs redirect to the unified settings page
- WordPress Playground blueprint for Live Preview on wordpress.org (`assets/blueprints/blueprint.json`)
- Upgrade guide (`docs/upgrade-to-v4.md`) with migration checklist and before/after examples

### Changed

- Settings UI rebuilt as a single unified DataViews table, replacing the four separate submenu pages (Core Blocks, External Plugins, Meta Field Checks, Editor Validation)
- Settings storage consolidated into a single `ba11yc_settings` option (previously multiple flat per-check options)
- `ba11yc_plugin()` singleton function is now the canonical plugin accessor; replaces the file-scope variable that broke under WP-CLI
- All documentation updated to reflect the new API, with before/after examples throughout

### Removed

- `includes/Core/SettingsAPI.php` — replaced by `Rest/ChecksController.php` and `Rest/SettingsController.php`
- Separate per-page settings JavaScript bundles — replaced by a single unified `settings.js`
- Automatic external plugin detection (`$plugin_info` parameter) — replaced by the required `namespace` key in `$args`
- Custom `isDecorative` attribute and the "Accessibility Settings" inspector panel on `core/image` — superseded by the native decorative-image option in WordPress 7.1 (see **Decorative Images** above)

## [3.0.2]

### Fixed

- Fixed fatal error under WP-CLI caused by relying on a file-scope variable for the plugin instance; the instance is now held in a static singleton (`ba11yc_plugin()`) so it survives when WordPress is loaded from inside a method scope

## [3.0.1]

### Fixed

- Prevented focus change when adding image alt text

## [3.0.0]

### Breaking Changes

#### API Method Renaming
External plugins using the validation API must update their function calls:

**Block Validation:**
- `register_check_with_plugin_detection()` → `register_block_check()`
  ```php
  // Old (deprecated)
  $registry->register_check_with_plugin_detection( 'my-plugin/block', 'check_name', $args );

  // New
  $registry->register_block_check( 'my-plugin/block', 'check_name', $args );
  ```

**Migration Impact:**
- External plugins using `register_check_with_plugin_detection()` will no longer work and should update to the new method name
- The new name better reflects the method's purpose (registering block-specific checks)

### Added

#### Site Editor Validation Controls
- Site Editor toggle column in settings tables for granular control over validation enforcement
- Ability to enable/disable individual validation checks specifically in the site editor
- Site Editor toggle automatically grays out when Priority Level is set to "None"
- All validation checks now support separate configuration for post editor vs. site editor contexts
- Site editor validation logic integrated into core validation pipeline

**Settings Features:**
- New "Site Editor" column in all settings tables (Core Blocks, External Plugins, Meta, Editor)
- Per-check toggle controls for site editor validation
- State persistence for site editor settings across all validation types
- Automatic dependency handling (toggles disabled when check is set to "None")

**Server-Side Implementation:**
- `{field_name}_site_editor` storage pattern for site editor settings
- PHP sanitization and validation for boolean site editor settings
- Settings data preparation includes `siteEditorEnabled` flag for each check
- REST API endpoints updated to handle site editor settings

**Client-Side Implementation:**
- React state management for site editor settings
- WordPress ToggleControl component integration
- Editor context detection (`post-editor` vs `site-editor`)
- Validation skip logic for disabled site editor checks
- Settings page UI updates for all validation types

#### Validation API Documentation
- Comprehensive quick start guides for all three validation types:
  - Block Attributes Validation guide with filter parameters, switch statements, inner blocks, and optional attributes
  - Post Meta Validation guide with `register_meta()` integration and `ba11yc_validate_meta` filter
  - General Editor Validation guide with `ba11yc_validate_editor` filter and document-level checks
- Core Concepts guide covering checks, registry types, severity levels, categories, and plugin integration
- Best Practices guide with optimization tips, common patterns, and troubleshooting solutions
- Streamlined API Overview with clear navigation to all documentation resources

**Documentation Features:**
- Working code examples matching actual implementation patterns
- Performance optimization guidance
- i18n support examples
- Troubleshooting sections for common issues
- Progressive structure from overview to implementation
- Cross-references between related documentation

#### Validation Sidebar Features
- Occurrence counts display for validation issues (e.g., "x3" for 3 instances of the same error)
- Warnings now display alongside errors in the sidebar instead of being hidden

### Changed

#### Settings Page UI Overhaul
- Refactored settings tables from CSS Grid to semantic HTML `<table>` elements
- Implemented WordPress responsive table patterns with mobile card layout at 782px breakpoint
- Unified table styling across Core Blocks, External Plugins, Meta, and Editor settings pages
- Removed striped table rows for cleaner, more consistent appearance
- All table content now left-aligned and vertically centered
- Consistent column widths across all settings tables (Block: 10%, Category: 10%, Priority Level: 220px, Site Editor: 90px)
- Badge styling added for Block and Category columns with subtle background and borders

**Table Architecture:**
- Proper `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` HTML structure
- WordPress `.widefat` class integration
- Responsive design with stacked card layout on mobile devices
- Column header configuration simplified (removed unused width/align properties)
- Removed deprecated `getGridTemplate()` function

- Reorganized documentation from single long page into focused, digestible guides
- Updated all code examples to use correct API method names (`register_block_check()`, `register_editor_check()`)
- Updated JavaScript filter hooks to use correct naming (`ba11yc_validate_block`, `ba11yc_validate_meta`, `ba11yc_validate_editor`)
- Consolidated repetitive content in Core Concepts guide (35% reduction in length)

#### Code Organization & Architecture
- **Complete folder structure reorganization** from `src/scripts/` to domain-based organization:
  - `src/editor/` - All editor-related code (validation, components, HOCs, modifications)
  - `src/admin/` - Settings pages and admin components
  - `src/shared/` - Utilities and helpers shared across contexts
- **Webpack path aliases** for cleaner imports:
  - `@editor` - Editor domain code
  - `@admin` - Admin domain code
  - `@shared` - Shared utilities
  - `@` - Root src directory
- **Barrel exports** implemented throughout codebase for simplified imports
- Updated all 50+ import statements across the codebase to use new structure

#### Validation System
- Sidebar deduplication logic now processes all invalid blocks regardless of mode, enabling warnings to show when errors are present in the same block

### Improved

- **Developer Experience**:
  - Cleaner import statements using path aliases
  - Better code organization with clear separation of concerns
  - Simplified component discovery through barrel exports
  - Easier navigation of codebase with domain-based structure

- **Settings Page Performance**:
  - Simplified table rendering with native HTML elements
  - Removed unnecessary CSS Grid calculations
  - More efficient mobile responsive behavior

- **User Experience**:
  - Clearer visual hierarchy in settings tables
  - Improved mobile usability with card-based layout
  - Consistent table styling across all settings pages
  - Better accessibility with semantic HTML table structure

### Fixed

- Validation messages now display correctly instead of showing generic "Accessibility issue found" text
  - Fixed compatibility between PHP snake_case properties (error_msg, warning_msg) and JavaScript camelCase (errorMsg, warningMsg)
  - Updated `createIssue()` helper in `src/shared/utils/validation/issueHelpers.js` to support both naming conventions
- External plugin settings page now loads correctly after folder reorganization
  - Fixed DOM element ID mismatch in `src/admin/pages/ExternalPlugins/index.js`
- Meta and editor validation settings now apply correctly from external plugin settings page
  - Fixed field name mismatch between save format (`meta_{post_type}_{meta_key}_{check_name}`) and retrieval format
  - Updated `includes/Meta/Registry.php` and `includes/Editor/Registry.php` to check external plugin format first, then fall back to core format
  - Settings now properly respect configured priority levels (error, warning, info, disabled)

## [2.3.0]

### Added

#### Post Meta Validation System
- Complete validation framework for WordPress post meta fields
- Server-side validation via WordPress REST API with `WP_Error` responses
- Client-side validation through React hooks for real-time feedback
- Automatic post locking when required meta fields have validation errors
- Visual feedback with inline error/warning messages and colored borders
- Settings page integration for configuring validation severity per check

**Developer Features:**
- `MetaValidation::required()` static method for easy registration
- `MetaChecksRegistry` class for managing validation checks across post types
- React components: `ValidatedToolsPanelItem` and `MetaField` wrappers
- `useMetaValidation` hook for validation state management
- JavaScript API: `validateMetaField()`, `validateAllMetaChecks()`, `GetInvalidMeta` component
- PHP filters: `ba11yc_validate_meta`, `ba11yc_meta_check_args`, `ba11yc_should_register_meta_check`
- JavaScript filter: `ba11yc_validate_meta` for custom client-side validation
- Dynamic CSS classes: `has-meta-validation-errors`, `has-meta-validation-warnings`
- Comprehensive documentation in `meta-validation.md`
- External plugin support with automatic settings page integration
- Working examples in integration plugin

### Removed

- `BlockConfig.php` class (93 lines) - obsolete file with non-existent render function references
- `PluginInitializer` methods: `has_service()`, `get_all_services()`, `register_check()`, `unregister_check()`
- `SettingsPage::$block_settings` property - replaced by dynamic rendering
- `BlockChecksRegistry::run_checks()` method (~31 lines) - JavaScript-only validation makes this obsolete
- Standalone `check_heading_first_level` check - functionality integrated into `check_heading_rank`

### Changed

#### Architecture & Initialization
- Integrated `HeadingLevels` into `PluginInitializer` service container
- `PluginInitializer` now instantiated in global scope for proper filter timing
- Removed `init_block_config()` method from initialization sequence
- All services now managed consistently through service container

#### Validation System
- Extended `ValidationAPI` component to monitor both block and meta validation
- Post locking logic now combines block and meta validation errors
- Heading rank validation now includes first heading level validation (consolidated from separate check)
- Updated heading validation error messages to reflect consolidated functionality

#### Settings & Localization
- Simplified `SettingsPage::init_settings()` to directly register heading options
- Enhanced external plugin settings to support both block checks and meta validation
- Added `metaValidationRules` to JavaScript global object
- Removed unused `'blocks'` data from script localization
- Added `prepare_meta_validation_rules_for_js()` method to `ScriptsStyles` class

### Improved

- **Code Quality**: Removed 150-170 lines of obsolete code
- **Performance**: Reduced unnecessary class instantiations and JavaScript data payload
- **Memory**: Eliminated unused data structures and dead code paths
- **Developer Experience**: 
  - Simplified meta validation registration to single `MetaValidation::required()` call
  - Consistent hook-based architecture for block and meta validation
- **User Experience**:
  - Unified validation messaging and visual styling
  - Real-time validation feedback as users type
  - Better settings organization with post type grouping

### Fixed

- Heading rank validation now matches violations by `clientId` instead of level
- Heading validation independence - disabling first heading check no longer breaks rank check
- Heading level validation now works in template preview views within content editor
- Button URL validation only applies to anchor elements (`tagName === 'a'`), not button elements
- Image validation no longer triggers in placeholder state (before image selection)

## [2.2.0]

### Added

#### Heading Validation System
- Comprehensive heading hierarchy validation for WordPress core heading blocks
- Real-time detection of skipped heading levels (e.g., H2 followed by H4)
- Intelligent validation of the first heading in a document based on available restrictions
- Document-wide heading analysis including nested blocks (groups, columns, etc.)
- Global heading change listener for real-time re-validation across all heading blocks

#### Image Alt Text Validation
- Pattern detection for non-descriptive alt text (e.g., "image", "picture", "photo", generic terms)

#### URL Validation System
- Advanced `isValidUrl()` function using `tldts` library
- Real TLD validation against Public Suffix List (PSL)
- Support for international domains, punycode, and complex TLDs (e.g., .co.uk)
- Development environment support (localhost, IP addresses, .localhost domains)

### Changed

#### Core Validation
- Extended `CoreBlockChecks.php` with new check types:
  - `check_heading_rank` and `check_heading_first_level` for heading validation
  - `check_image_alt_text_patterns` for image alt text pattern checking
- Enhanced image alt text validation to include pattern checking
- Updated JavaScript validation pipeline to handle document-wide heading analysis

#### Settings & UI
- Heading level restrictions now only allow removal of H1, H5, and H6 for better accessibility compliance
- Repositioned heading level restriction checkboxes above individual check settings

#### Code Architecture
- Migrated URL validation from custom regex to `tldts` library
- Updated `validateButtonLink()` to use new robust URL validation system
- Reorganized validation functions for better code flow
- Enhanced documentation with improved JSDoc comments and inline documentation

### Fixed

- Heading validation errors now display only on problematic blocks, not all heading blocks
- First heading validation logic now properly checks based on available heading restrictions
- Heading level restriction validation now only allows removal of appropriate levels
- Fixed critical issue where invalid domains like "foo.notworking" were being accepted
- Button validation no longer accepts invalid URLs like "http://test"
- TLD validation now uses real TLD data instead of hardcoded lists
- Development workflow compatibility for localhost and IP addresses

## [2.1.0]

### Added

#### Issue Categorization System
- New `category` field in check registration to distinguish "accessibility" vs "validation" issues
- Inspector panel displays errors/warnings in consolidated panels with category sub-headings
- Enhanced settings page labels with category-based descriptions

#### Design System
- CSS custom properties for centralized color system:
  - `--a11y-red`: Primary error color (#d82000)
  - `--a11y-yellow`: Primary warning color (#dbc900)
  - `--a11y-light-red`: Error background (#ffe4e0)
  - `--a11y-light-yellow`: Warning background (#fffde2)
  - `--a11y-border-width`: Standardized border width (3px solid)

#### Code Architecture
- Modular SCSS architecture with separate files for panel messages and block icons
- Migrated from deprecated `@import` to `@use` statements
- Advanced external plugin detection system analyzing file structure and plugin headers
- Plugin information caching for performance optimization
- Consolidated documentation into single comprehensive external integration guide

#### Settings Page Redesign
- Complete overhaul with modern, accessible design
- Unified settings page layout eliminating code duplication
- External plugins display with actual names, versions, and unique slugs
- Enhanced form controls with improved radio button and checkbox styling
- Better visual organization with clear sub-headings

### Changed

#### API & Validation
- `BlockChecksRegistry::register_check()` now accepts optional `category` parameter (defaults to 'accessibility')
- JavaScript validation pipeline updated to pass category information from PHP to frontend
- UI display logic consolidated into two main panels with conditional sub-headings
- Default check categorization: button checks as "validation", image/table checks as "accessibility"

#### Settings & UI
- Inspector panel title updated from "Accessibility Check" to "Accessibility & Validation"
- Enhanced check label generation for more descriptive, user-friendly names
- External plugin settings grouping improved to use actual plugin metadata
- Plugin slug generation enhanced to use directory names, preventing namespace conflicts

#### Code Quality
- Refactored CSS to use custom properties for maintainability and theme support
- SettingsPage class refactored with logical function organization
- Consolidated duplicate radio button rendering logic (reduced ~50 lines)
- Updated HTML structure with semantic elements and improved accessibility attributes

### Fixed

- Sass deprecation warnings resolved by migrating to `@use` syntax
- UI structure issues with conditional rendering logic for error/warning panels
- Data flow consistency ensuring category information flows from PHP to JavaScript
- External plugin grouping issues where multiple plugins were incorrectly grouped
- Plugin name display now shows actual names instead of derived names
- Settings page slug conflicts resolved with unique slug generation
- Code duplication eliminated with consolidated shared functionality
- Site editor compatibility - plugin no longer prevents site editor from loading
- Post type compatibility - checks now work on all post types, not just 'post'
- Security compliance - fixed PHPCS warning by using `get_current_screen()` instead of `$_GET`
- Editor context detection improved to distinguish post editor vs site editor
- Settings page checkbox state now properly displays checked state

## [2.0.0]

### Added

#### Validation System Overhaul
- Multiple issues display - all accessibility problems shown simultaneously
- Priority-based visual indicators - block borders reflect highest severity (red/yellow)
- Comprehensive inspector panel feedback - all issues listed at once, organized by severity
- JavaScript-only validation system for real-time block editor feedback
- Unified validation architecture with `ba11yc_validate_block` filter hook system
- Real-time visual feedback for all blocks (core and external) with borders and messages

#### External Plugin Support
- Enhanced external plugin support with full editor UI integration
- Visual accessibility indicators for external plugin blocks
- External block integration screenshots in documentation

#### Core Block Features
- Individual validation control for each core block type (enable/disable)
- Custom messages and descriptions for each accessibility check
- Grouped error and warning messages in inspector panel

#### Developer API
- `PluginInitializer` class for organized plugin startup and service location
- `BlockChecksRegistry` class for centralized accessibility check management
- Extensive hooks and filters for extensibility:
  - `ba11yc_register_checks` - register custom checks
  - `ba11yc_ready` - access to registry and plugin initializer
  - `ba11yc_check_registered`, `ba11yc_check_unregistered`, `ba11yc_check_toggled` - lifecycle events
  - `ba11yc_register_default_checks` - prevent default checks from loading
  - `ba11yc_should_register_check` - control individual check registration
  - `ba11yc_check_args` - modify check configuration
  - `ba11yc_block_checks` - control which checks run for specific blocks
  - `ba11yc_block_attributes` - modify block attributes before checks
  - `ba11yc_before_check`, `ba11yc_check_result`, `ba11yc_final_check_result` - execution pipeline
  - `ba11yc_block_check_results` - modify all results for a block
- Registry API methods:
  - `register_check()`, `unregister_check()` - check registration
  - `set_check_enabled()` - enable/disable checks dynamically
  - `is_check_registered()`, `get_check_config()` - check introspection
  - `get_registered_block_types()` - discover available block types

#### Code Quality & Architecture
- PHP-JavaScript unified validation system:
  - `BlockChecksRegistry` as single source of truth for validation rules
  - JavaScript validation consumes PHP registry data via `wp_localize_script()`
  - Eliminates code duplication between PHP and JavaScript
- Enhanced `BlockChecksRegistry` with additional check methods:
  - `check_image_alt_required()` - verify images have alt text (unless decorative)
  - `check_check_button_link()` - ensure buttons have both text and links
- Input validation for heading level data
- Option caching in `HeadingLevels` class for performance
- Comprehensive settings sanitization
- Comprehensive error handling and debug logging:
  - Try-catch blocks around critical operations
  - Input validation for all user data and API parameters
  - Graceful degradation when services fail
  - Admin notices for initialization failures
  - Debug logging when `WP_DEBUG` enabled
  - Error logging for production tracking
- Comprehensive type hints, PHPDoc comments, and `@throws` annotations
- Improved nullable type hints for better type safety

#### Documentation
- Modular developer documentation split into individual markdown files:
  - API reference, hooks, integration, advanced usage, troubleshooting, examples
- Complete integration documentation with working examples
- Enhanced developer API documentation with troubleshooting guide

### Changed

- Higher-order component system uses dynamic check registry instead of hardcoded block types
- JavaScript validation system supports external plugin checks through filter integration
- Block error component enhanced to show visual feedback for any registered block type
- Improved caching system for filtered checks array
- Minimum WordPress version requirement updated to 6.7
- `HeadingLevels` class instantiated early for correct filter timing
- Settings page layout improved with better organization and accessibility
- Submenu and settings page titles updated for clarity
- Improved plugin architecture with centralized service management

### Fixed

- Visual accessibility indicators now show for external plugin blocks
- JavaScript validation system now recognizes custom block types
- Higher-order component now applies to all registered block types, not just core blocks
- Block error messages and visual styling now appear for dynamically registered checks
- Cache invalidation issues with filtered checks array resolved
- Debug console logging removed from production builds
- Heading level one fallback issue in settings resolved
- Heading levels can now be properly removed in plugin options
- Heading level restrictions now work with correct filter timing
- Settings page accessibility issues resolved with proper ARIA labels
- Message grouping and display improvements in inspector panel

### Security

- Enhanced input sanitization for all plugin settings to prevent malicious data injection

## [1.2.1]

### Fixed

- Issue where heading level one was a fallback in settings

## [1.2.0]

### Added

- Image block validation for alt text exceeding 125 characters
- Image block validation for alt text matching caption text

### Changed

- Moved message location above block options
- Added lint and format tools for WPCS (PHP, JS, CSS)
- Added proper escaping in PHP templates
- Updated translation load order and plugin initialization
- Tested and bumped compatibility to WordPress 6.8

### Fixed

- Lint errors related to PHP, JS, and CSS

## [1.1.0]

### Changed

- Redesigned editor notice to be less obtrusive, added icon
- Moved error message to InspectorControls
- Removed individual SCSS files
- Updated README and Changelog
- Updated dependencies
- Replaced heading level validation with direct heading level restrictions in editor
- Updated settings page to allow selection of which heading levels to remove

### Fixed

- Added timeout to image alt check to prevent change of focus

## [1.0.3]

### Changed

- Updated dependencies

## [1.0.2]

### Added

- Icon and banner image for public release
- Mike Corkum as contributor

## [1.0.1]

### Added

- Check for core/button text and link

### Changed

- Updated both README files

## [1.0.0]

### Added

- Initial release