<?php
/**
 * Plugin Name:       Block Accessibility Checks
 * Plugin URI:        https://example.com/block-accessibility-checks
 * Description:       This plugin helps ensure your content meets WCAG (Web Content Accessibility Guidelines) requirements.
 * Version:           0.1.0
 * Requires at least: WordPress 6.3
 * Requires PHP:      7.0
 * Author:            Troy Chaplin
 * Author URI:        https://example.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-accessibility-checks
 * Domain Path:       /languages
 *
 * @package           block-accessibility-checks
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    die;
}

// Setup autoloading
require_once __DIR__ . '/vendor/autoload.php';

// Define constants
if (!defined('BLOCK_ACCESSIBILITY_MODE')) {
    define('BLOCK_ACCESSIBILITY_MODE', 'DENY'); // Default value, can be overridden in wp-config.php
}

// Include dependencies
use BlockAccessibility\ScriptsAndStyles;
use BlockAccessibility\Translations;

// Define plugin file and Text Domain
$pluginFile = __FILE__;
$textDomain = 'block-accessibility-checks';

// Translation setup
$translations = new Translations($pluginFile, $textDomain);
add_action('plugins_loaded', [$translations, 'loadTextDomain']);

// Enqueue block editor assets
$scriptsStyles = new ScriptsAndStyles($pluginFile, $translations);
add_action('enqueue_block_editor_assets', [$scriptsStyles, 'enqueueAssets']);
