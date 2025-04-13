=== Block Accessibility Checks ===

Contributors: areziaal, mikecorkum
Tags: block, accessibility, a11y, content, tools
Requires at least: 6.3
Tested up to: 6.8
Stable tag: 1.1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Configure a series of block checks to prevent WCAG Accessbility errors in content.

== Description ==

Accessibility is a crucial aspect of web content creation. Many organizations must adhere to strict WCAG (Web Content Accessibility Guidelines) requirements. While the Gutenberg block editor significantly enhances content management, it still allows the publication of content that may not meet basic accessibility standards. This plugin offers site owners and content editors configurable block checks. These checks can either enforce strict accessibility error notices to prevent publishing or provide warnings in the editor while still allowing publication.

The following is a list of checks that are configurable for core blocks. Each check can be set to error (default), warning or none.

* core/button: Checks for text and link on each button
* core/heading: Prevents the usage of an level one heading in the content
* core/gallery: Checks for alternative text on an image
* core/image: Checks for alternative text on an image
* core/image: Adds a toggle to confirm image use as decorative allowing for bypass accessibility check
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
= 1.1.0 =
#### Changed

* Redesigned editor notice be less obtrusive, added icon to left of block
* Moved error message to InspectorControls
* Removed individual SCSS files
* Updated README and Changelog
* Updated dependencies
* Replaced heading level validation with direct heading level restrictions in the editor
* Updated settings page to allow selection of which heading levels to remove from the editor

#### Fixed

* Added timeout to image alt check to prevent change of focus

= 1.0.3 =

#### Changed

* Updated dependencies

= 1.0.2 =

#### Added

* Icon and banner image for public release
* Mike Corkum as contributor

= 1.0.1 =

#### Added

* Add check for core/button text and link

#### Changed

* Updated both readme files

= 1.0 =

* Plugin released.