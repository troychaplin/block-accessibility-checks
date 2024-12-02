<?php

/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       Add errors and warnings to core blocks to meet WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.3
 * Requires PHP:      7.0
 * Version:           1.0.2
 * Author:            Troy Chaplin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-accessibility-checks
 * Domain Path:       /languages
 *
 * @package           block-accessibility-checks
 */

/**
 * Checks if the constant ABSPATH is defined and terminates the script if not.
 *
 * @return void
 */
if (! defined('ABSPATH')) exit;

/**
 * Defines the version of the block-accessibility-checks plugin.
 *
 * @var string BLOCK_ACCESSIBILITY_VERSION
 */
define('BLOCK_ACCESSIBILITY_VERSION', '1.0.2');

/**
 * This file is responsible for including the necessary autoload file.
 */
require_once __DIR__ . '/vendor/autoload.php';

use BlockAccessibility\BlockConfig;
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
 * Initializes the translations for the plugin.
 *
 * @param string $pluginFile The path to the main plugin file.
 * @param string $textDomain The text domain for the translations.
 * @return void
 */
$translations = new Translations($pluginFile, $textDomain);
add_action('plugins_loaded', [$translations, 'loadTextDomain']);

/**
 * Enqueues block and admin assets for the accessibility checks plugin.
 *
 * @param string $pluginFile The path to the main plugin file.
 * @param array $translations An array of translations for the plugin.
 * @return void
 */
$scriptsStyles = new ScriptsStyles($pluginFile, $translations);
add_action('enqueue_block_editor_assets', [$scriptsStyles, 'enqueueBlockAssets']);
add_action('admin_enqueue_scripts', [$scriptsStyles, 'enqueueAdminAssets']);

/**
 * Creates a new instance of the SettingsPage class.
 *
 * @param string $pluginFile The file path of the plugin.
 * @param array $translations An array of translations for the plugin.
 * @return SettingsPage The newly created SettingsPage object.
 */
$settingsPage = new SettingsPage($pluginFile, $translations);

/**
 * Retrieves the block configuration instance and gets the block configuration.
 *
 * @return BlockConfig The block configuration instance.
 */
$blockConfig = BlockConfig::getInstance()->getBlockConfig();
