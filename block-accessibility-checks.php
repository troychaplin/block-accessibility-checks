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

// Global variables for the plugin.
$ba11yc_plugin_file = __FILE__;
$ba11yc_text_domain = 'block-accessibility-checks';

// Initialize the Plugin immediately (before 'init' hook).
// This is required for HeadingLevels to register its filter early enough.
$ba11yc_plugin_initializer = new Plugin( $ba11yc_plugin_file, $ba11yc_text_domain );

/**
 * Initializes the Block Accessibility Checks plugin services.
 *
 * This function is called on the 'init' hook to complete plugin initialization
 * after HeadingLevels has been set up in the Plugin constructor.
 *
 * @return void
 */
function ba11yc_init_plugin() {
	global $ba11yc_plugin_initializer;

	// Complete plugin initialization (HeadingLevels already initialized in constructor).
	$ba11yc_plugin_initializer->init();
}
add_action( 'init', 'ba11yc_init_plugin' );
