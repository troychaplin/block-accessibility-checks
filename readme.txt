=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: accessibility, wcag, gutenberg, blocks, validation
Requires at least: 6.7
Tested up to: 6.9
Stable tag: 2.3.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Prevent WCAG accessibility errors in your content with real-time validation for blocks, meta fields, and document structure.

== Description ==

<a href="https://blockaccessibilitychecks.com/">Block Accessibility Checks</a> is a comprehensive WordPress plugin that proactively prevents accessibility issues in your content before they reach your audience. Designed for the Gutenberg block editor, it provides real-time validation with a three-tier system that ensures your blocks, post meta fields, and overall document structure meet WCAG (Web Content Accessibility Guidelines) requirements.

Unlike reactive accessibility tools that scan published content, this plugin catches problems during the editing process—giving immediate visual feedback and preventing publication of content with critical accessibility errors. Content creators get clear guidance on what needs fixing, while developers can extend the system with custom checks for blocks, meta fields, and editor-level validation.

Whether you're a content creator ensuring your posts are accessible, a developer building accessible blocks, or an organization maintaining compliance standards, Block Accessibility Checks provides the tools you need to create inclusive content effortlessly.

**Key Features:**

* **Three-Tier Validation System** - Validates blocks, post meta fields, and editor-level concerns (like heading hierarchy) with unified error handling
* **Real-time Visual Feedback** - See accessibility issues instantly with color-coded borders around problematic blocks and detailed error messages in the block inspector panel
* **Smart Publishing Control** - Prevents publication of content with critical accessibility errors in blocks, meta fields, or document structure while allowing warnings with user awareness
* **Comprehensive Block Coverage** - Built-in checks for images, buttons, tables, headings, and galleries with multiple validation rules per block type
* **Post Meta Validation** - Validate required post meta fields with real-time feedback, automatic post locking for errors, and seamless integration with block validation
* **Advanced Heading Validation** - Document-wide hierarchy checking prevents skipped heading levels and ensures proper content structure across your entire post
* **Intelligent URL Validation** - Real TLD validation using the Public Suffix List ensures only legitimate domains are accepted in button links
* **Configurable Settings** - Granular control over each check's severity (error/warning/disabled) with an intuitive admin interface for blocks, meta fields, and site editor
* **Issue Categorization** - Clear distinction between accessibility issues and validation errors for better understanding and prioritization
* **Developer-Friendly API** - Comprehensive hooks and filters system for registering custom accessibility checks for blocks, post meta fields, and editor-level validation
* **External Plugin Support** - Works seamlessly with custom blocks from third-party plugins and themes, with automatic settings page generation per plugin
* **Multi-Context Support** - Unified validation works in both post editor and site editor with separate configurable settings for each context

**How It Works:**

The plugin provides immediate feedback as you edit content through a sophisticated three-tier validation system:

1. **Block Validation** - Validates individual block attributes in real-time as you type and edit
2. **Meta Field Validation** - Checks required post meta fields with automatic post locking when validation fails
3. **Editor-Level Validation** - Validates document-wide concerns like heading hierarchy that span across multiple blocks

When accessibility issues are detected, they are highlighted with visual indicators (red for errors, yellow for warnings) and detailed messages explain how to fix the problems. Critical errors prevent publishing until resolved, while warnings allow publication with user acknowledgment.

**Built-in Accessibility Checks:**

* **Button Blocks** - Ensures buttons have descriptive text content and validates link destinations using real TLD validation (Public Suffix List)
* **Image Blocks** - Requires alt text (unless marked decorative), validates alt text length (warns if exceeding 125 characters), prevents caption duplication, and detects non-descriptive patterns like "image of" or "photo123"
* **Table Blocks** - Requires proper headers or captions for screen reader navigation
* **Heading Blocks** - Validates proper heading hierarchy across entire document (prevents skipped levels), ensures appropriate first heading level (H2 recommended, H1 allowed with warnings), and provides configurable heading level restrictions (H1, H5, H6 can be disabled)
* **Gallery Blocks** - Applies comprehensive image accessibility checks to all gallery items (alt text, length, patterns, caption duplication)
* **Post Meta Fields** - Validate required custom fields with real-time validation, automatic post locking for errors, and seamless integration with block validation system

**Perfect For:**

* Government websites requiring WCAG compliance
* Educational institutions with accessibility mandates
* Businesses committed to inclusive web content
* Developers building accessible WordPress themes and plugins
* Content teams who want accessibility guidance built into their workflow

**Developer API:**

Extend the plugin with <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/">custom accessibility checks</a> for blocks, post meta fields, or editor-level validation. The robust three-tier API includes:

* **Block Validation API** - Register custom checks for any block type with the `ba11yc_register_checks` action hook
* **Meta Validation API** - Register custom meta field validation with the `ba11yc_register_meta_checks` action hook
* **Editor Validation API** - Register document-wide validation with the `ba11yc_register_editor_checks` action hook
* **JavaScript Validation Filters** - Implement validation logic using `ba11yc_validate_block`, `ba11yc_validate_meta`, and `ba11yc_validate_editor` filters
* **Automatic Settings Integration** - External plugins automatically get their own settings pages under the Block Checks menu
* **20+ Hooks and Filters** - Complete customization of registration, validation, and display behavior

Perfect for plugin developers who want to add accessibility validation to their custom blocks, ensure required meta fields are properly validated, or implement document-wide accessibility rules.

== Installation ==
 
**From WordPress Admin:**
1. Go to **Plugins → Add New** in your WordPress admin
2. Search for "Block Accessibility Checks"
3. Click "Install Now" and then "Activate"
4. Navigate to **Block Checks → Core Block Checks** to configure your preferences

**Manual Installation:**
1. Download the plugin files and upload to `/wp-content/plugins/block-accessibility-checks/`
2. Activate the plugin through the **Plugins** menu in WordPress
3. Configure your accessibility check preferences in the settings

**After Installation:**
The plugin works immediately after activation with sensible defaults. You can customize settings at:

* **Block Checks → Core Block Checks** - Configure core WordPress block validation
* **Block Checks → Meta Field Checks** - Configure post meta field validation (if any registered)
* **Block Checks → Site Editor Checks** - Configure validation for site editor (templates/template parts)
* **Block Checks → [External Plugin Name]** - Configure validation for external plugin blocks (automatically created)

== Getting Involved ==

If you would like to get involved and contribute to the development of this plugin or view it's source code you can find more information in the <a href="https://github.com/troychaplin/block-accessibility-checks">plugins GitHub repo</a>.

== Frequently Asked Questions ==

= How do I use this plugin? =

1. Once activated, navigate to **Block Checks → Core Block Checks** to configure your preferences
2. Choose which checks should be errors (prevent publishing), warnings (allow publishing with notice), or disabled
3. Start editing content in the Gutenberg editor - accessibility checks run automatically across blocks, meta fields, and document structure
4. Blocks with issues will show red borders (errors) or yellow borders (warnings) with detailed messages in the block inspector panel
5. Fix the highlighted issues or adjust check severity levels as needed

= What happens when accessibility issues are found? =

The plugin provides immediate visual feedback through its three-tier validation system:
* **Red borders and icons** around blocks with critical accessibility errors
* **Yellow borders and icons** around blocks with warnings
* **Detailed error messages** in the block inspector sidebar panel, grouped by severity and category
* **Publishing prevention** for critical errors in blocks, meta fields, or editor-level checks (configurable)
* **Warning indicators** for less critical issues that still allow publishing with user awareness
* **Post locking** when required meta fields fail validation

= Can I add custom accessibility checks for my own blocks? =

Yes! The plugin includes a comprehensive <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/">developer API</a> with extensive hooks and filters. You can register custom accessibility checks for:

* **Block validation** - Any block type using the `ba11yc_register_checks` action
* **Meta field validation** - Post meta fields using the `ba11yc_register_meta_checks` action
* **Editor-level validation** - Document-wide checks using the `ba11yc_register_editor_checks` action

See the developer documentation for complete examples and quick start guides.

= Does this work with blocks from other plugins? =

Absolutely! The plugin's architecture supports any WordPress block, whether from core, themes, or third-party plugins. External plugins automatically get their own settings page under the Block Checks menu, allowing administrators to configure validation levels for each check independently.

= Can I configure which checks are errors vs warnings? =

Yes, all checks can be configured as errors (prevent publishing), warnings (allow publishing with notice), or disabled entirely. Visit **Block Checks** in your WordPress admin to access:

* Core block check settings
* Meta field check settings
* Site editor check settings
* External plugin check settings (automatically created)

= Can I validate required post meta fields? =

Yes! The plugin includes a comprehensive meta field validation system. Register required meta fields using the `ba11yc_register_meta_checks` action hook, implement JavaScript validation using the `ba11yc_validate_meta` filter, and the plugin will automatically lock post saving when validation fails, provide visual feedback, and integrate seamlessly with block validation.

= Does this work in the site editor? =

Yes! The plugin works in both the post editor and site editor. The site editor has separate configurable settings accessible at **Block Checks → Site Editor Checks**, allowing you to configure different validation rules for template/template part editing versus post-level content.

= Will this slow down my editor? =

No, the plugin is optimized for performance with smart caching and efficient validation algorithms. All validation runs in JavaScript for real-time feedback without server round-trips. Checks run in real-time without impacting editor responsiveness.
 
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