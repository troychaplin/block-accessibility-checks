<?php
/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       This plugin helps ensure your content meets WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.3
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Troy Chaplin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-accessibility-checks
 *
 * @package           block-accessibility-checks
 */

// Setup autoloading
require_once __DIR__ . '/vendor/autoload.php';

// Include dependencies
use BlockAccessibility\AssetEnqueuer;

// Enqueue block editor assets
$assetEnqueuer = new AssetEnqueuer(__FILE__);
add_action('enqueue_block_editor_assets', [$assetEnqueuer, 'enqueueAssets']);
