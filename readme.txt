=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: accessibility, wcag, gutenberg, blocks, validation
Requires at least: 6.7
Tested up to: 7.1
Stable tag: 4.2.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Prevent WCAG accessibility errors in your content with real-time validation for blocks, meta fields, and document structure.

== Description ==

<a href="https://blockaccessibilitychecks.com/">Block Accessibility Checks</a> is a comprehensive WordPress plugin that proactively prevents accessibility issues in your content before they reach your audience. Designed for the Gutenberg block editor, it provides real-time validation with a three-tier system that ensures your blocks, post meta fields, and overall document structure meet WCAG (Web Content Accessibility Guidelines) requirements.

Unlike reactive accessibility tools that scan published content, this plugin catches problems during the editing process—giving immediate visual feedback and preventing publication of content with critical accessibility errors. Content creators get clear guidance on what needs fixing, while developers can extend the system with custom checks for blocks, meta fields, and editor-level validation.

Whether you're a content creator ensuring your posts are accessible, a developer building accessible blocks, or an organization maintaining compliance standards, Block Accessibility Checks provides the tools you need to create inclusive content effortlessly.

**Features for Content Creators & Editors:**

* **Real-time Visual Feedback** - See accessibility issues instantly with color-coded borders (red for errors, yellow for warnings) around problematic blocks and detailed error messages in the block inspector panel
* **Smart Publishing Control** - Critical accessibility errors prevent publishing until resolved, while warnings allow publication with user awareness
* **Comprehensive Block Coverage** - Built-in validation for images, buttons, tables, headings, and galleries with clear guidance on how to fix issues
* **Document-Wide Validation** - Advanced heading hierarchy checking prevents skipped heading levels and ensures proper content structure across your entire post
* **Title Validation** - Ensures posts and pages have a title set for accessibility and SEO, validates in real-time as you type
* **Intelligent URL Validation** - Real TLD validation using the Public Suffix List ensures only legitimate domains are accepted in button links
* **Configurable Settings** - Control which checks are errors (prevent publishing), warnings (allow with notice), or disabled through an intuitive admin interface
* **Grouped Error Display** - All accessibility issues shown at once in organized groups, eliminating the "fix one, see another" frustration
* **Works Everywhere** - Validation runs in both the post editor and site editor (templates/template parts) with separate configurable settings

**Features for Developers & Plugin Authors:**

* **Three-Tier Validation API** - Register custom checks for block attributes, post meta fields, and editor-level validation using comprehensive hooks and filters
* **JavaScript-Only Validation** - All validation logic runs in JavaScript for real-time editor feedback without server round-trips
* **Automatic Settings Integration** - Checks from external plugins automatically appear in the unified settings table, attributed and filterable by plugin
* **External Plugin Support** - Works seamlessly with custom blocks from third-party plugins and themes
* **Heading Source Declaration** - Blocks that render their own headings count toward heading order validation, automatically or via `ba11yc_register_heading_source()`
* **Extensive Hook System** - 20+ action and filter hooks for complete customization of registration, validation, and display behavior
* **Well-Documented API** - Complete developer documentation with quick start guides and working code examples

**Upgrading an integration from v3?** Version 4.0.0 introduced breaking changes to the developer API — registration functions, argument keys, and JavaScript filter names all changed, and v3 integrations stop validating silently rather than erroring. See the <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/upgrade-to-v4.md">v4 upgrade guide</a> for a complete migration reference.

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
* **Heading Blocks** - Validates heading hierarchy across the whole document, including headings rendered by other blocks. Requires the first heading to be H1 or H2, and any of H1–H6 can be disabled (H1 by default)
* **Gallery Blocks** - Applies comprehensive image accessibility checks to all gallery items (alt text, length, patterns, caption duplication)
* **Post & Page Title Validation** - Ensures posts and pages have a title set for accessibility and SEO, validates in real-time as users type, prevents publishing content without a title, configurable independently for posts and pages
* **Post Meta Fields** - Validate required custom fields with real-time validation, automatic post locking for errors, and seamless integration with block validation system

**Perfect For:**

* Government websites requiring WCAG compliance
* Educational institutions with accessibility mandates
* Businesses committed to inclusive web content
* Developers building accessible WordPress themes and plugins
* Content teams who want accessibility guidance built into their workflow

**Developer Resources:**

Extend the plugin with <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/">custom accessibility checks</a> using the comprehensive validation API. See the complete <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/">developer documentation</a> for quick start guides, API reference, code examples, and a <a href="https://github.com/troychaplin/block-check-integration-example">working example plugin</a>.

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

* **Block Checks → Core Block Validations** - Configure core WordPress block validation
* **Block Checks → Editor Validation** - Configure post/page title validation
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

* **Block validation** - `ba11yc_register_block_check()`
* **Meta field validation** - `ba11yc_register_meta_check()`
* **Editor-level validation** - `ba11yc_register_editor_check()`
* **Heading sources** - `ba11yc_register_heading_source()`

Register these on the `ba11yc_ready` action. See the developer documentation for complete examples and quick start guides.

= Does this work with blocks from other plugins? =

Absolutely! Any WordPress block works, whether from core, themes, or third-party plugins. Their checks appear in the single Block Checks settings table, attributed and filterable by plugin, and headings they render count toward heading order validation.

= Can I configure which checks are errors vs warnings? =

Yes, all checks can be configured as errors (prevent publishing), warnings (allow publishing with notice), or disabled entirely. Visit **Block Checks** in your WordPress admin to access:

* Core block check settings
* Meta field check settings
* Site editor check settings
* External plugin check settings (automatically created)

= Can I validate required post meta fields? =

Yes! Register required meta fields with `ba11yc_register_meta_check()` and implement the validation in JavaScript with the `ba11yc.validateMeta` filter. The plugin locks post saving when validation fails and surfaces the issues alongside block validation.

= Does this work in the site editor? =

Yes! The plugin works in both the post editor and site editor. The site editor has separate configurable settings accessible at **Block Checks → Site Editor Checks**, allowing you to configure different validation rules for template/template part editing versus post-level content.

= Will this slow down my editor? =

No, the plugin is optimized for performance with smart caching and efficient validation algorithms. All validation runs in JavaScript for real-time feedback without server round-trips. Checks run in real-time without impacting editor responsiveness.
 
= How to uninstall the plugin? =
 
Simply deactivate and delete the plugin through the WordPress admin interface. 

== Screenshots ==

1. **Validation Sidebar** - A custom sidebar displays error and warning messages that link to blocks in the content area
2. **Validation Popover** - Blocks with issues have an inline indicator that trigger an information popover on click
3. **Comprehensive Settings Panel** - Plugin configuration page with granular control over accessibility check severity levels
4. **External Plugin Validation** -- An external plugin with a Band custom post type, card block and post meta that leverage the Validation API
5. **External Plugin Settings Panel** -- An external plugin integrated into the settings page grouped by block, post meta and editor validation options
 
== Changelog ==

= 4.0.0 =

Major release. All admin settings move to a single unified settings page, and the developer API is overhauled with **breaking changes** — see the upgrade notice below and the <a href="https://github.com/troychaplin/block-accessibility-checks/blob/main/docs/upgrade-to-v4.md">v4 upgrade guide</a>.

* New: single settings page listing every registered check from every plugin in one filterable, sortable table
* New: global registration functions `ba11yc_register_block_check()`, `ba11yc_register_meta_check()`, `ba11yc_register_editor_check()`
* New: `ba11yc_check_level` filter for runtime severity overrides
* New: REST API at `block-accessibility-checks/v1` (`/checks`, `/settings`)
* Changed (breaking): check severity is now `level` + `configurable` (replaces `type`); a `namespace` argument is required
* Changed (breaking): JavaScript validation filters renamed to `ba11yc.validateBlock`, `ba11yc.validateEditor`, `ba11yc.validateMeta`
* Changed (breaking): `window.BlockAccessibilityChecks` removed; configuration now available via `getEditorSettings().blockA11yChecks` and the `block-accessibility-checks` data store
* Removed: per-plugin settings submenu pages (old links redirect to the unified page)
* Migration: all saved v3 settings are migrated automatically; no user action needed

View the full <a href="https://blockaccessibilitychecks.com/changelog/">changelog</a> on the plugin website.

== Upgrade Notice ==

= 4.0.0 =

Major update. End-user settings migrate automatically. Developers integrating custom checks MUST update to the new registration API and renamed JavaScript filters — v3 integrations stop validating silently. See docs/upgrade-to-v4.md.