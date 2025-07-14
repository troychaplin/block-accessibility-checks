=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: block, accessibility, a11y, content, tools
Requires at least: 6.7
Tested up to: 6.8.2
Stable tag: 2.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Configure a series of block checks to prevent WCAG Accessbility errors in content.

== Description ==

Accessibility is a crucial aspect of web content creation. Many organizations must adhere to strict WCAG (Web Content Accessibility Guidelines) requirements. While the Gutenberg block editor significantly enhances content management, it still allows the publication of content that may not meet basic accessibility standards. This plugin offers site owners and content editors configurable block checks. These checks can either enforce strict accessibility error notices to prevent publishing or provide warnings in the editor while still allowing publication.

The following is a list of checks that are configurable for core blocks. Each check can be set to error (default), warning or none.

* core/button: Checks for text and link on each button
* core/heading: Configurable option allows removal of any heading level
* core/gallery: Leverages all core/image block checks
* core/image: Checks for alternative text on an image
* core/image: Adds option to confirm image as decorative element and bypass a11y check
* core/image: Checks if alternative text on an image exceeds 125 characters
* core/image: Checks if alternative text on an image matches the caption text
* core/table: Checks for a table header row on each individual table block

== Installation ==
 
1. Upload the plugin folder to your /wp-content/plugins/ folder.
2. Go to the **Plugins** page and activate the plugin.

== Getting Involved ==

If you would like to get involved and contribute to the development of this plugin or view it's source code you can find more information in the <a href="https://github.com/troychaplin/block-accessibility-checks">plugins GitHub repo</a>.

== Frequently Asked Questions ==
 
= How do I use this plugin? =
 
1. Once activated head to the "Block Checks" page under the "Settings" menu
2. Configure the checks to your liking
4. Click "Save Changes"

These options will be automatically applied to existing blocks throughout your site and are active as you build new content.
 
= How to uninstall the plugin? =
 
Simply deactivate and delete the plugin. 

== Screenshots ==
1. Core table block not meeting accessibility requirements for publishing
2. Image block providing a warning that the block may not meet accessibility requirements
3. A customized set of heading levels removed from the editor
4. Plugin options page with various block accessibility options
 
== Changelog ==
= 2.0.0 =

#### Added

* Input validation for heading level data to prevent invalid configurations
* Option caching in HeadingLevels class for improved performance
* Comprehensive settings sanitization to validate all user input
* PluginInitializer class for organized plugin startup and simple service location
* BlockChecksRegistry class for centralized management of accessibility checks
* Developer API with extensive hooks and filters for extensibility:
    * `ba11yc_register_checks` action for registering custom accessibility checks
    * `ba11yc_ready` action providing access to registry and plugin initializer
    * `ba11yc_check_registered`, `ba11yc_check_unregistered`, `ba11yc_check_toggled` actions for check lifecycle events
    * `ba11yc_register_default_checks` filter to prevent default checks from loading
    * `ba11yc_should_register_check` filter to control individual check registration
    * `ba11yc_check_args` filter to modify check configuration before registration
    * `ba11yc_block_checks` filter to control which checks run for specific blocks
    * `ba11yc_block_attributes` filter to modify block attributes before checks run
    * `ba11yc_before_check`, `ba11yc_check_result`, `ba11yc_final_check_result` filters for check execution pipeline
    * `ba11yc_block_check_results` filter for modifying all results for a block
* Registry API methods for programmatic check management:
    * `register_check()`, `unregister_check()` for check registration
    * `set_check_enabled()` for enabling/disabling checks dynamically
    * `is_check_registered()`, `get_check_config()` for check introspection
    * `get_registered_block_types()` for discovering available block types
* Example file demonstrating developer API usage patterns
* Comprehensive error handling and debug logging system:
    * Try-catch blocks around all critical operations to prevent plugin crashes
    * Input validation for all user data and API parameters
    * Graceful degradation when services fail to initialize
    * Admin notices for initialization failures
    * Debug logging for troubleshooting when WP_DEBUG is enabled
    * Error logging for production issue tracking
    * Robust fallbacks to maintain plugin functionality during errors
* Comprehensive type hints for improved code quality and IDE support
* Enhanced PHPDoc comments with detailed parameter and return type documentation
* Proper @throws annotations for methods that can throw exceptions
* Consistent void return type declarations for methods that don't return values
* Improved nullable type hints (e.g., ?object, ?BlockChecksRegistry) for better type safety
* PHP-JavaScript unified validation system:
    * BlockChecksRegistry now serves as single source of truth for all validation rules and messages
    * JavaScript validation functions now consume PHP registry data via `wp_localize_script()`
    * Eliminates code duplication between PHP and JavaScript validation logic
    * Ensures consistent validation behavior across all contexts
* Enhanced BlockChecksRegistry with additional check methods:
    * `check_image_alt_required()` for verifying images have alt text (unless decorative)
    * `check_button_required_content()` for ensuring buttons have both text and links
    * All checks now include complete metadata for JavaScript consumption
* Real-time editor validation now powered by PHP registry rules:
    * Image blocks: alt text required, length validation, caption matching
    * Button blocks: required content validation, text quality checks
    * Table blocks: header or caption requirement validation
* PHP validation rules automatically exposed to JavaScript via `BlockAccessibilityChecks.validationRules`
* Developer extensibility for custom checks works seamlessly in both PHP and JavaScript contexts
* Dynamic JavaScript validation system using `blockAccessibilityChecks.blockChecksArray` filter
* External plugin integration support with proper dependency management and load order
* Visual error indicators (red borders, inspector panel messages) for invalid blocks in editor
* Complete integration documentation with working examples for external plugin developers

#### Changed

* Higher-order component system updated to use dynamic check registry instead of hardcoded block types
* JavaScript validation system now supports external plugin checks through filter integration
* Block error component enhanced to show visual feedback for any registered block type
* Improved caching system for filtered checks array to prevent repeated filter applications
* Enhanced developer API documentation with complete integration examples and troubleshooting guide
* Minimum WordPress version requirement updated to 6.7
* HeadingLevels class now instantiated early for correct filter timing
* Improved plugin architecture with centralized service management

#### Fixed

* Visual accessibility indicators not showing for external plugin blocks due to hardcoded block type checks
* JavaScript validation system not recognizing custom block types from external plugins
* Higher-order component applying only to core WordPress blocks instead of all registered block types
* Block error messages and visual styling not appearing for dynamically registered checks
* Cache invalidation issues with filtered checks array causing stale validation results
* Debug console logging in production builds removed for cleaner output
* Issue where heading level one was a fallback in settings
* Heading levels can now be properly removed in the plugin options
* Heading level restrictions not working due to incorrect filter timing

#### Security

* Enhanced input sanitization for all plugin settings to prevent malicious data injection

= Past Versions =

* View the [full changelog](https://github.com/troychaplin/block-accessibility-checks/blob/main/CHANGELOG.md) in Github