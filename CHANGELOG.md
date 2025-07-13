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

### Changed

- Minimum WordPress version requirement to 6.7 for latest security and performance features
- HeadingLevels class instantiation timing to ensure proper filter registration before core blocks
- Plugin initialization refactored to use PluginInitializer class for better organization

### Fixed

- Issue where heading level one was a fallback in settings
- Heading levels can now be properly removed in the plugin options
- Heading level restrictions not working due to incorrect filter timing

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
