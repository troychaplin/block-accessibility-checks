=== Block Accessibility Checks ===

Contributors: areziaal
Tags: block, accessibility, a11y, content, tools
Requires at least: 6.3
Tested up to: 6.6.2
Stable tag: 1.0.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Configure a series of block checks to prevent WCAG Accessbility errors in content.

== Description ==

Accessibility is a crucial aspect of web content creation. Many organizations must adhere to strict WCAG (Web Content Accessibility Guidelines) requirements. While the Gutenberg block editor significantly enhances content management, it still allows the publication of content that may not meet basic accessibility standards. This plugin offers site owners and content editors configurable block checks. These checks can either enforce strict accessibility error notices to prevent publishing or provide warnings in the editor while still allowing publication.

The following is a list of checks that are configurable for core blocks. Each check can be set to error (default), warning or none.

* core/button: Checks for text and a link on each individual button
* core/heading: Prevents the usage of an level one heading in the content
* core/image: Checks for alternative text on an image
* core/image: Adds a toggle to confirm image use as decorative allowing for bypass accessibility check
* core/table: Checks for a table header row on each individual table block

== Installation ==
 
1. Upload the plugin folder to your /wp-content/plugins/ folder.
2. Go to the **Plugins** page and activate the plugin.

== Frequently Asked Questions ==
 
= How do I use this plugin? =
 
1. Once activated head to the "Block Checks" page under the "Settings" menu
2. Configure the checks to you liking
4. Click "Save Changes"

These options will be automatically applied to existing blocks throughout your site and are active as you build new content.
 
= How to uninstall the plugin? =
 
Simply deactivate and delete the plugin. 