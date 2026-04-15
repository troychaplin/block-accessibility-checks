<?php
/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       Add plugin that add errors and warnings to core blocks to meet WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.7
 * Requires PHP:      7.0
 * Version:           3.0.1
 * Author:            Troy Chaplin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-accessibility-checks
 * Domain Path:       /languages
 *
 * @package           block-accessibility-checks
 */

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Defines the version of the Block Accessibility Checks plugin.
define( 'BA11YC_VERSION', '3.0.1' );

// This file is responsible for including the necessary autoload file.
require_once __DIR__ . '/vendor/autoload.php';

// Imports the necessary classes for the plugin.
use BlockAccessibility\Core\Plugin;

/**
 * Returns the shared Plugin instance, constructing it on first call.
 *
 * Using a static singleton avoids relying on a file-scope variable, which
 * breaks under WP-CLI because plugin files are included from inside a method
 * (WP_CLI\Runner::load_wordpress) rather than true global scope.
 *
 * @return Plugin
 */
function ba11yc_plugin() {
	static $plugin = null;

	if ( null === $plugin ) {
		$plugin = new Plugin( __FILE__, 'block-accessibility-checks' );
	}

	return $plugin;
}

/**
 * Initializes the Block Accessibility Checks plugin services.
 *
 * This function is called on the 'init' hook to complete plugin initialization
 * after HeadingLevels has been set up in the Plugin constructor.
 *
 * @return void
 */
function ba11yc_init_plugin() {
	// Complete plugin initialization (HeadingLevels already initialized in constructor).
	ba11yc_plugin()->init();
}

// Construct the Plugin immediately (before 'init' hook).
// This is required for HeadingLevels to register its filter early enough.
ba11yc_plugin();
add_action( 'init', 'ba11yc_init_plugin' );
