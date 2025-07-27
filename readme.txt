=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: accessibility, a11y, wcag, gutenberg, blocks, content, validation, compliance
Requires at least: 6.7
Tested up to: 6.8.2
Stable tag: v2.0.0-beta-1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Configure a series of block checks to prevent WCAG accessibility errors in content.

== Description ==

Block Accessibility Checks is a comprehensive WordPress plugin that ensures your content meets WCAG (Web Content Accessibility Guidelines) requirements. With real-time validation in the Gutenberg block editor, this plugin helps content creators and organizations maintain accessibility compliance effortlessly.

**Key Features:**

* **Real-time Visual Feedback** - See accessibility issues instantly with red borders around problematic blocks and detailed error messages in the block inspector panel
* **Smart Publishing Control** - Prevents publication of content with critical accessibility errors while allowing warnings with user awareness
* **Extensive Block Coverage** - Built-in checks for core WordPress blocks (images, buttons, tables, headings, galleries)
* **Developer-Friendly** - Comprehensive API with 12+ hooks and filters for custom accessibility checks
* **External Plugin Support** - Works seamlessly with custom blocks from third-party plugins and themes
* **Unified Architecture** - PHP-JavaScript integrated system ensures consistent validation everywhere

**How It Works:**

The plugin provides immediate feedback as you edit content. When accessibility issues are detected, blocks are highlighted with visual indicators and detailed messages explain how to fix the problems. Critical errors prevent publishing until resolved, while warnings allow publication with user acknowledgment.

**Built-in Accessibility Checks:**

* **Button Blocks** - Ensures buttons have both text content and proper link destinations
* **Image Blocks** - Requires alt text (unless marked decorative), validates length, prevents caption duplication
* **Table Blocks** - Requires proper headers or captions for screen reader navigation
* **Heading Blocks** - Configurable heading level restrictions to maintain proper hierarchy
* **Gallery Blocks** - Applies comprehensive image accessibility checks to all gallery items

**Perfect For:**

* Government websites requiring WCAG compliance
* Educational institutions with accessibility mandates
* Businesses committed to inclusive web content
* Developers building accessible WordPress themes and plugins
* Content teams who want accessibility guidance built into their workflow

**Developer API:**

Extend the plugin with <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/developer-api.md">custom accessibility checks</a> for any block type. The robust API includes registration functions, validation hooks, and automatic JavaScript integration. Perfect for plugin developers who want to add accessibility validation to their custom blocks.

== Installation ==
 
**From WordPress Admin:**
1. Go to **Plugins → Add New** in your WordPress admin
2. Search for "Block Accessibility Checks"
3. Click "Install Now" and then "Activate"
4. Navigate to **Settings → Block Accessibility Checks** to configure your preferences

**Manual Installation:**
1. Download the plugin files and upload to `/wp-content/plugins/block-accessibility-checks/`
2. Activate the plugin through the **Plugins** menu in WordPress
3. Configure your accessibility check preferences in the settings

**After Installation:**
Visit **Settings → Block Accessibility Checks** to customize which checks should be errors, warnings, or disabled. The plugin works immediately after activation with sensible defaults.

== Getting Involved ==

If you would like to get involved and contribute to the development of this plugin or view it's source code you can find more information in the <a href="https://github.com/troychaplin/block-accessibility-checks">plugins GitHub repo</a>.

== Frequently Asked Questions ==
 
= How do I use this plugin? =
 
1. Once activated, navigate to **Settings → Block Accessibility Checks** to configure your preferences
2. Choose which checks should be errors (prevent publishing) or warnings (allow publishing with notice)
3. Start editing content in the Gutenberg editor - accessibility checks run automatically
4. Blocks with issues will show red borders and error messages in the block inspector panel
5. Fix the highlighted issues or adjust check severity levels as needed

= What happens when accessibility issues are found? =

The plugin provides immediate visual feedback:
* **Red borders** around blocks with accessibility problems
* **Detailed error messages** in the block inspector sidebar panel
* **Publishing prevention** for critical errors (configurable)
* **Warning indicators** for less critical issues that still allow publishing

= Can I add custom accessibility checks for my own blocks? =

Yes! The plugin includes a comprehensive <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/developer-api.md">developer API</a> with extensive hooks and filters. You can register custom accessibility checks for any block type, including custom blocks from your themes or plugins. See the developer documentation for complete examples.

= Does this work with blocks from other plugins? =

Absolutely! The plugin's architecture supports any WordPress block, whether from core, themes, or third-party plugins. Developers can easily integrate their custom blocks with the accessibility checking system.

= Can I configure which checks are errors vs warnings? =

Yes, most checks can be configured as errors (prevent publishing), warnings (allow publishing with notice), or disabled entirely. Visit the plugin settings page to customize the behavior for your needs.

= Will this slow down my editor? =

No, the plugin is optimized for performance with smart caching and efficient validation algorithms. Checks run in real-time without impacting editor responsiveness.
 
= How to uninstall the plugin? =
 
Simply deactivate and delete the plugin through the WordPress admin interface. 

== Screenshots ==

1. **Block Error Validation** - Button block showing accessibility error with red border and detailed error message preventing publication, also demonstrates multiple errors in a grouped display
2. **Visual Warning System** - Image block displaying accessibility warning with clear explanation in the block inspector panel, also demonstrates multiple warnings in a grouped display
3. **Heading Level Management** - Customized heading level restrictions maintaining proper content hierarchy in the editor
4. **Comprehensive Settings Panel** - Plugin configuration page with granular control over accessibility check severity levels
 
== Changelog ==
= v2.0.0-beta-1 =

#### Added

* **Multiple issues display**: Complete validation overhaul to show all accessibility problems simultaneously, eliminating the "fix one, see another" user experience
* **Priority-based visual indicators**: Block borders now reflect highest severity issue (red for errors, yellow for warnings) with intelligent fallback behavior
* **Comprehensive inspector panel feedback**: All validation issues are listed at once in the sidebar, organized by severity (errors first, then warnings)
* **JavaScript-only validation system**: Complete migration from PHP to JavaScript-only validation for real-time block editor feedback
* **Unified validation architecture**: New `ba11yc.validateBlock` filter hook system for consistent validation across all block types
* **Enhanced external plugin support**: External blocks now display visual accessibility indicators and integrate fully with the editor UI
* **Real-time visual feedback**: All blocks (core and external) now show instant accessibility validation with visual borders and inspector panel messages
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
    * `check_check_button_link()` for ensuring buttons have both text and links
    * All checks now include complete metadata for JavaScript consumption
* Real-time editor validation now powered by PHP registry rules:
    * Image blocks: alt text required, length validation, caption matching
    * Button blocks: required content validation, text quality checks
    * Table blocks: header or caption requirement validation
* JavaScript-only validation system with real-time feedback using the `ba11yc.validateBlock` filter hook
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

* View the <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/CHANGELOG.md">full changelog</a> in Github