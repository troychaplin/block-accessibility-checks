<?php
/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       Add plugin that add errors and warnings to core blocks to meet WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.7
 * Requires PHP:      7.0
 * Version:           1.2.1
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
define( 'BA11YC_VERSION', '1.2.1' );

// This file is responsible for including the necessary autoload file.
require_once __DIR__ . '/vendor/autoload.php';

// Imports the necessary classes for the plugin.
use BlockAccessibility\BlockConfig;
use BlockAccessibility\HeadingLevels;
use BlockAccessibility\PluginInitializer;
use BlockAccessibility\ScriptsStyles;
use BlockAccessibility\SettingsPage;
use BlockAccessibility\Translations;

// Initialize heading levels immediately - before init hook.
$ba11yc_heading_levels_early = new HeadingLevels();

// Global variables for the plugin.
$ba11yc_plugin_file        = __FILE__;
$ba11yc_text_domain        = 'block-accessibility-checks';
$ba11yc_plugin_initializer = null;

/**
 * Initializes the Block Accessibility Checks plugin.
 *
 * This function sets up the necessary hooks, filters, and functionality
 * required for the plugin to operate using the PluginInitializer class.
 *
 * @return void
 */
function ba11yc_init_plugin() {
	global $ba11yc_plugin_file, $ba11yc_text_domain, $ba11yc_plugin_initializer;

	// Initialize the plugin using the new initializer.
	$ba11yc_plugin_initializer = new PluginInitializer( $ba11yc_plugin_file, $ba11yc_text_domain );
	$ba11yc_plugin_initializer->init();
}
add_action( 'init', 'ba11yc_init_plugin' );
