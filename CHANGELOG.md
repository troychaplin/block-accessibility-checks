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

### Added

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