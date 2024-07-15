<?php

/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       This plugin helps ensures your content meets WCAG (Web Content Accessibility Guidelines) requirements.
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

add_action('enqueue_block_editor_assets', 'enqueue_block_checks');

function enqueue_block_checks()
{
    $script_path = 'build/block-checks.js';
    $style_path = 'build/block-checks.css';

    wp_enqueue_script(
        'block-checks-script',
        plugins_url($script_path, __FILE__),
        array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'),
        filemtime(plugin_dir_path(__FILE__) . $script_path),
        true
    );

    wp_enqueue_style(
        'block-checks-style',
        plugins_url($style_path, __FILE__),
        [],
    );
}
