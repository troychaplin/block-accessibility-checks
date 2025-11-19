=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: accessibility, wcag, gutenberg, blocks, validation
Requires at least: 6.7
Tested up to: 6.9
Stable tag: 2.3.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Configure a series of block checks to prevent WCAG accessibility errors in content.

== Description ==

<a href="https://blockaccessibilitychecks.com/">Block Accessibility Checks</a> is a comprehensive WordPress plugin that proactively prevents accessibility issues in your content before they reach your audience. Designed for the Gutenberg block editor, it provides real-time validation that ensures your images, buttons, tables, headings, galleries, and post meta fields meet WCAG (Web Content Accessibility Guidelines) requirements.

Unlike reactive accessibility tools that scan published content, this plugin catches problems during the editing process—giving immediate visual feedback and preventing publication of content with critical accessibility errors. Content creators get clear guidance on what needs fixing, while developers can extend the system with custom checks for any block type or post meta field.

Whether you're a content creator ensuring your posts are accessible, a developer building accessible blocks, or an organization maintaining compliance standards, Block Accessibility Checks provides the tools you need to create inclusive content effortlessly.

**Key Features:**

* **Real-time Visual Feedback** - See accessibility issues instantly with color-coded borders around problematic blocks and detailed error messages in the block inspector panel
* **Smart Publishing Control** - Prevents publication of content with critical accessibility errors while allowing warnings with user awareness
* **Comprehensive Block Coverage** - Built-in checks for images, buttons, tables, headings, and galleries with multiple validation rules per block type
* **Post Meta Validation** - Validate required post meta fields with real-time feedback, automatic post locking for errors, and seamless integration with block validation
* **Advanced Heading Validation** - Document-wide hierarchy checking prevents skipped heading levels and ensures proper content structure
* **Intelligent URL Validation** - Real TLD validation using the Public Suffix List ensures only legitimate domains are accepted
* **Configurable Settings** - Granular control over each check's severity (error/warning/disabled) with an intuitive admin interface for both block and meta validation
* **Issue Categorization** - Clear distinction between accessibility issues and validation errors for better understanding
* **Developer-Friendly API** - Comprehensive hooks and filters system for registering custom accessibility checks for blocks and post meta fields
* **External Plugin Support** - Works seamlessly with custom blocks from third-party plugins and themes, with automatic settings page integration

**How It Works:**

The plugin provides immediate feedback as you edit content. When accessibility issues are detected in blocks or required meta fields, they are highlighted with visual indicators and detailed messages explain how to fix the problems. Critical errors prevent publishing until resolved, while warnings allow publication with user acknowledgment.

**Built-in Accessibility Checks:**

* **Button Blocks** - Ensures buttons have descriptive text content and valid link destinations with real URL validation
* **Image Blocks** - Requires alt text (unless marked decorative), validates length, prevents caption duplication, and detects non-descriptive patterns
* **Table Blocks** - Requires proper headers or captions for screen reader navigation
* **Heading Blocks** - Validates proper heading hierarchy (no skipped levels), ensures appropriate first heading level, and configurable heading level restrictions
* **Gallery Blocks** - Applies comprehensive image accessibility checks to all gallery items
* **Post Meta Fields** - Validate required custom fields with server-side and client-side validation, automatic post locking, and visual feedback in the editor

**Perfect For:**

* Government websites requiring WCAG compliance
* Educational institutions with accessibility mandates
* Businesses committed to inclusive web content
* Developers building accessible WordPress themes and plugins
* Content teams who want accessibility guidance built into their workflow

**Developer API:**

Extend the plugin with <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/">custom accessibility checks</a> for any block type or post meta field. The robust API includes registration functions, validation hooks, and automatic JavaScript integration. Perfect for plugin developers who want to add accessibility validation to their custom blocks and ensure required meta fields are properly validated.

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

View the <a href="https://blockaccessibilitychecks.com/changelog/">changelog</a> on the plugin website.