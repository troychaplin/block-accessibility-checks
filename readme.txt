=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: accessibility, wcag, gutenberg, blocks, validation
Requires at least: 6.7
Tested up to: 6.8.2
Stable tag: 2.1.0
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

Extend the plugin with <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/">custom accessibility checks</a> for any block type. The robust API includes registration functions, validation hooks, and automatic JavaScript integration. Perfect for plugin developers who want to add accessibility validation to their custom blocks.

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
4. **Table Header Validation** - Table block showing accessibility error with red border and detailed error message preventing publication
5. **Comprehensive Settings Panel** - Plugin configuration page with granular control over accessibility check severity levels
6. **External Block Validation** -- A custom external card block leveraging the block checks system
7. **External Block Settings Panel** -- A custom external card block leveraging the block checks system
 
== Changelog ==

= 2.1.0 =

**Enhanced User Experience & Advanced Plugin Integration**

This release focuses on dramatically improving the user experience with better organization, modern design, and seamless integration with external plugins. The update introduces intelligent issue categorization, a completely redesigned settings interface, and advanced plugin detection capabilities that make accessibility validation more intuitive and powerful than ever.

* **Issue Categorization System** - New intelligent categorization distinguishes between "accessibility" and "validation" issues, providing clearer guidance on what needs attention
* **Redesigned Settings Interface** - Complete overhaul of the admin settings page with modern, accessible design and improved user experience
* **Enhanced Inspector Panel** - Consolidated error/warning display with clear sub-headings for "Accessibility" and "Validation" categories, updated panel title to "Accessibility & Validation"
* **Advanced External Plugin Detection** - New automatic plugin detection system that identifies external plugins by analyzing file structure and plugin headers
* **CSS Custom Properties** - Centralized color system with semantic variable names for consistent theming and better maintainability
* **Modern Sass Architecture** - Migrated to modern `@use` syntax and modular SCSS organization for improved performance
* **Plugin Information Caching** - Performance optimization with intelligent caching of plugin metadata
* **Enhanced Form Controls** - Improved radio button and checkbox styling with semantic CSS classes for better accessibility
* **Site Editor Compatibility** - Fixed compatibility issues with WordPress site editor and improved post type detection
* **Security Improvements** - Enhanced security compliance with proper WordPress API usage

* View the <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/CHANGELOG.md">full changelog</a> in Github