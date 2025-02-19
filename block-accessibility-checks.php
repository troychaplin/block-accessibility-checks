<?php

/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       Add errors and warnings to core blocks to meet WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.3
 * Requires PHP:      7.0
 * Version:           1.0.3
 * Author:            Troy Chaplin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-accessibility-checks
 * Domain Path:       /languages
 *
 * @package           block-accessibility-checks
 */

// Prevent direct access to the file.
if (! defined('ABSPATH')) exit;

// Defines the version of the Block Accessibility Checks plugin.
define('BLOCK_ACCESSIBILITY_VERSION', '1.0.3');

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
 * It defines the variables $pluginFile and $textDomain.
 *
 * @var string $pluginFile The path of the current plugin file.
 * @var string $textDomain The text domain for translation.
 */
$pluginFile = __FILE__;
$textDomain = 'block-accessibility-checks';

/**
 * Initialize translations first since other classes might need it
 */
$translations = new Translations($pluginFile, $textDomain);
add_action('plugins_loaded', [$translations, 'loadTextDomain']);

/**
 * Retrieves the block configuration instance and gets the block configuration.
 */
$blockConfig = BlockConfig::getInstance()->getBlockConfig();

/**
 * Initialize heading levels restrictions
 */
$headingLevels = new HeadingLevels();

/**
 * Enqueues block and admin assets for the accessibility checks plugin.
 */
$scriptsStyles = new ScriptsStyles($pluginFile, $translations);
add_action('enqueue_block_editor_assets', [$scriptsStyles, 'enqueueBlockAssets']);
add_action('admin_enqueue_scripts', [$scriptsStyles, 'enqueueAdminAssets']);

/**
 * Initialize settings page
 */
$settingsPage = new SettingsPage();
