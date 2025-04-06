<?php
/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       Add plugin that add errors and warnings to core blocks to meet WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.3
 * Requires PHP:      7.0
 * Version:           1.1.0
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
define( 'BA11YC_VERSION', '1.1.0' );

// This file is responsible for including the necessary autoload file.
require_once __DIR__ . '/vendor/autoload.php';

// Imports the necessary classes for the plugin.
use BlockAccessibility\BlockConfig;
use BlockAccessibility\HeadingLevels;
use BlockAccessibility\ScriptsStyles;
use BlockAccessibility\SettingsPage;
use BlockAccessibility\Translations;

/**
 * This file is located at /Users/troychaplin/Develop/wp-contribute/block-accessibility-checks/block-accessibility-checks.php.
 * It defines the variables $ba11yc_plugin_file and $ba11yc_text_domain.
 *
 * @var string $ba11yc_plugin_file The path of the current plugin file.
 * @var string $ba11yc_text_domain The text domain for translation.
 */
$ba11yc_plugin_file = __FILE__;
$ba11yc_text_domain = 'block-accessibility-checks';

/**
 * Initialize translations first since other classes might need it
 */
$ba11yc_translations = new Translations( $ba11yc_plugin_file, $ba11yc_text_domain );
add_action(
	'plugins_loaded',
	array( $ba11yc_translations, 'load_text_domain' )
);

/**
 * Retrieves the block configuration instance and gets the block configuration.
 */
$ba11yc_block_config = BlockConfig::get_instance()->get_block_config();

/**
 * Initialize heading levels restrictions
 */
$ba11yc_heading_levels = new HeadingLevels();

/**
 * Enqueues block and admin assets for the accessibility checks plugin.
 */
$ba11yc_scripts_styles = new ScriptsStyles( $ba11yc_plugin_file, $ba11yc_translations );
add_action( 'enqueue_block_editor_assets', array( $ba11yc_scripts_styles, 'enqueue_block_assets' ) );
add_action( 'admin_enqueue_scripts', array( $ba11yc_scripts_styles, 'enqueue_admin_assets' ) );

/**
 * Initialize settings page
 */
$ba11yc_settings_page = new SettingsPage();
