# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Prefix the change with one of these keywords:

- _Added_: for new features.
- _Changed_: for changes in existing functionality.
- _Deprecated_: for soon-to-be removed features.
- _Removed_: for now removed features.
- _Fixed_: for any bug fixes.
- _Security_: in case of vulnerabilities.

## [Unreleased]

### Added

- **Issue categorization system**: New `category` field in check registration to distinguish between "accessibility" and "validation" issues
- **Enhanced UI organization**: Inspector panel now displays errors and warnings in consolidated panels with sub-headings for "Accessibility" and "Validation" categories
- **CSS custom properties**: Centralized color system with semantic variable names for consistent theming:
  - `--a11y-red`: Primary error color (#d82000)
  - `--a11y-yellow`: Primary warning color (#dbc900) 
  - `--a11y-light-red`: Error background color (#ffe4e0)
  - `--a11y-light-yellow`: Warning background color (#fffde2)
  - `--a11y-border-width`: Standardized border width (3px solid)
- **Modular SCSS architecture**: Improved stylesheet organization with separate files for panel messages and block icons
- **Modern Sass syntax**: Migrated from deprecated `@import` to `@use` statements for better performance and maintainability

### Changed

- **BlockChecksRegistry API**: Enhanced `register_check()` method to accept optional `category` parameter (defaults to 'accessibility')
- **JavaScript validation pipeline**: Updated to pass category information from PHP registry to frontend validation
- **UI display logic**: Consolidated error/warning display into two main panels with conditional sub-headings
- **CSS architecture**: Refactored styles to use custom properties for improved maintainability and theme support
- **Default check categorization**: Core button checks now categorized as "validation", image and table checks as "accessibility"

### Fixed

- **Sass deprecation warnings**: Resolved build warnings by migrating from `@import` to `@use` syntax
- **UI structure issues**: Fixed conditional rendering logic for error and warning panels
- **Data flow consistency**: Ensured category information properly flows from PHP registry to JavaScript validation

## [2.0.0]

### Added

- **Multiple issues display**: Complete validation overhaul to show all accessibility problems simultaneously, eliminating the "fix one, see another" user experience
- **Priority-based visual indicators**: Block borders now reflect highest severity issue (red for errors, yellow for warnings) with intelligent fallback behavior
- **Comprehensive inspector panel feedback**: All validation issues are listed at once in the sidebar, organized by severity (errors first, then warnings)
- **JavaScript-only validation system**: Complete migration from PHP to JavaScript-only validation for real-time block editor feedback
- **Unified validation architecture**: New `ba11yc.validateBlock` filter hook system for consistent validation across all block types
- **Enhanced external plugin support**: External blocks now display visual accessibility indicators and integrate fully with the editor UI
- **Real-time visual feedback**: All blocks (core and external) now show instant accessibility validation with visual borders and inspector panel messages
- **Core block check settings**: Individual validation control for each core block type with enable/disable options
- **Individual error and warning messages**: Support for custom messages and descriptions for each accessibility check
- **Grouped error and warning messages**: Improved UI organization with grouped message display in inspector panel
- **External block integration screenshots**: Visual documentation showing external plugin integration examples
- Modular developer documentation: Split API, hooks, integration, advanced usage, troubleshooting, and examples into individual markdown files for improved clarity and usability
- Input validation for heading level data to prevent invalid configurations
- Option caching in HeadingLevels class for improved performance
- Comprehensive settings sanitization to validate all user input
- PluginInitializer class for organized plugin startup and simple service location
- BlockChecksRegistry class for centralized management of accessibility checks
- Developer API with extensive hooks and filters for extensibility:
    - `ba11yc_register_checks` action for registering custom accessibility checks
    - `ba11yc_ready` action providing access to registry and plugin initializer
    - `ba11yc_check_registered`, `ba11yc_check_unregistered`, `ba11yc_check_toggled` actions for check lifecycle events
    - `ba11yc_register_default_checks` filter to prevent default checks from loading
    - `ba11yc_should_register_check` filter to control individual check registration
    - `ba11yc_check_args` filter to modify check configuration before registration
    - `ba11yc_block_checks` filter to control which checks run for specific blocks
    - `ba11yc_block_attributes` filter to modify block attributes before checks run
    - `ba11yc_before_check`, `ba11yc_check_result`, `ba11yc_final_check_result` filters for check execution pipeline
    - `ba11yc_block_check_results` filter for modifying all results for a block
- Registry API methods for programmatic check management:
    - `register_check()`, `unregister_check()` for check registration
    - `set_check_enabled()` for enabling/disabling checks dynamically
    - `is_check_registered()`, `get_check_config()` for check introspection
    - `get_registered_block_types()` for discovering available block types
- Example file demonstrating developer API usage patterns
- Comprehensive error handling and debug logging system:
    - Try-catch blocks around all critical operations to prevent plugin crashes
    - Input validation for all user data and API parameters
    - Graceful degradation when services fail to initialize
    - Admin notices for initialization failures
    - Debug logging for troubleshooting when WP_DEBUG is enabled
    - Error logging for production issue tracking
    - Robust fallbacks to maintain plugin functionality during errors
- Comprehensive type hints for improved code quality and IDE support
- Enhanced PHPDoc comments with detailed parameter and return type documentation
- Proper @throws annotations for methods that can throw exceptions
- Consistent void return type declarations for methods that don't return values
- Improved nullable type hints (e.g., ?object, ?BlockChecksRegistry) for better type safety
- PHP-JavaScript unified validation system:
    - BlockChecksRegistry now serves as single source of truth for all validation rules and messages
    - JavaScript validation functions now consume PHP registry data via `wp_localize_script()`
    - Eliminates code duplication between PHP and JavaScript validation logic
    - Ensures consistent validation behavior across all contexts
- Enhanced BlockChecksRegistry with additional check methods:
    - `check_image_alt_required()` for verifying images have alt text (unless decorative)
    - `check_check_button_link()` for ensuring buttons have both text and links
    - All checks now include complete metadata for JavaScript consumption
- Real-time editor validation now powered by PHP registry rules:
    - Image blocks: alt text required, length validation, caption matching
    - Button blocks: required content validation, text quality checks
    - Table blocks: header or caption requirement validation
- JavaScript-only validation system with real-time feedback using the `ba11yc.validateBlock` filter hook
- External plugin integration support with proper dependency management and load order
- Visual error indicators (red borders, inspector panel messages) for invalid blocks in editor
- Complete integration documentation with working examples for external plugin developers
- Enhanced developer API documentation with complete integration examples and troubleshooting guide

### Changed

- Higher-order component system updated to use dynamic check registry instead of hardcoded block types
- JavaScript validation system now supports external plugin checks through filter integration
- Block error component enhanced to show visual feedback for any registered block type
- Improved caching system for filtered checks array to prevent repeated filter applications
- Minimum WordPress version requirement updated to 6.7
- HeadingLevels class now instantiated early for correct filter timing
- Settings page layout improved with better organization and accessibility
- Submenu and settings page titles updated for clarity
- Improved plugin architecture with centralized service management

### Fixed

- Visual accessibility indicators not showing for external plugin blocks due to hardcoded block type checks
- JavaScript validation system not recognizing custom block types from external plugins
- Higher-order component applying only to core WordPress blocks instead of all registered block types
- Block error messages and visual styling not appearing for dynamically registered checks
- Cache invalidation issues with filtered checks array causing stale validation results
- Debug console logging in production builds removed for cleaner output
- Issue where heading level one was a fallback in settings
- Heading levels can now be properly removed in the plugin options
- Heading level restrictions not working due to incorrect filter timing
- Settings page accessibility issues with proper ARIA labels and keyboard navigation
- Message grouping and display improvements in inspector panel

### Security

- Enhanced input sanitization for all plugin settings to prevent malicious data injection

## [1.2.0]

### Added

- Condition on image block to check if more than 125 characters are used
- Condition on image block to check if alt text matches caption text

### Changed

- Moved message location above block options
- Lint and format tools to handle WPCS for PHP, JS and CSS
- Added proper escaping in PHP templates
- Translation load order and plugin initialization
- Tested and bumped compatibility to WordPress 6.8

### Fixed

- Lint errors related to PHP, JS and CSS

## [1.1.0]

### Changed

- Redesigned editor notice be less obtrusive, added icon
- Moved error message to InspectorControls
- Removed individual SCSS files
- Updated README and Changelog
- Updated dependencies
- Replaced heading level validation with direct heading level restrictions in the editor
- Updated settings page to allow selection of which heading levels to remove from the editor

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

- Add check for core/button text and link

### Changed

- Updated both README files

## [1.0.0]

### Added

- Initial release
