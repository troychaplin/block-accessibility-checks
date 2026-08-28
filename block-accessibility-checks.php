<?php
/**
 * Plugin Name:       Block Accessibility Checks
 * Description:       Add plugin that add errors and warnings to core blocks to meet WCAG (Web Content Accessibility Guidelines) requirements.
 * Requires at least: 6.7
 * Requires PHP:      7.0
 * Version:           4.2.0
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
define( 'BA11YC_VERSION', '4.2.0' );

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

/**
 * Declare the display name for a check namespace.
 *
 * Call this once and every check registered under the namespace is credited to
 * it in the settings UI. Without it, checks fall back to the plugin name looked
 * up from the namespace slug. Order does not matter — this may run before or
 * after the checks themselves.
 *
 * @param string $namespace_slug Namespace slug used by this plugin's checks.
 * @param array  $args           Accepts a 'title' key.
 * @return bool True on success, false on failure.
 */
function ba11yc_register_namespace( string $namespace_slug, array $args ): bool {
	if ( empty( $namespace_slug ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'A namespace slug is required.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	if ( empty( $args['title'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "title" key.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	return \BlockAccessibility\AbstractRegistry::register_namespace( $namespace_slug, $args );
}

/**
 * Register a validation check for a block type.
 *
 * Public registration API. Extracts 'name' from $args and delegates to the
 * Block Registry singleton. A 'namespace' field is required for plugin attribution.
 *
 * @param string $block_type Block type name (e.g., 'core/image').
 * @param array  $args       Check configuration. Required keys: 'namespace', 'name', 'error_msg'.
 *                           Optional: 'title' (human-readable label shown in the settings
 *                           table; defaults to 'name'), 'warning_msg', 'level'
 *                           (error|warning|none), 'category', 'priority', 'enabled',
 *                           'description', 'configurable'.
 * @return bool True on success, false on failure.
 */
function ba11yc_register_block_check( string $block_type, array $args ): bool {
	if ( empty( $args['namespace'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "namespace" key for plugin attribution.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	if ( empty( $args['name'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "name" key.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	$check_name = $args['name'];
	unset( $args['name'] );

	return \BlockAccessibility\Block\Registry::get_instance()->register_check( $block_type, $check_name, $args );
}

/**
 * Register a validation check for a post meta field.
 *
 * @param string $post_type Post type (e.g., 'post', 'page').
 * @param array  $args      Check configuration. Required keys: 'namespace', 'name', 'meta_key', 'error_msg'.
 *                          Optional: 'title' (human-readable label; defaults to 'name'),
 *                          plus the same optional keys as ba11yc_register_block_check().
 * @return bool True on success, false on failure.
 */
function ba11yc_register_meta_check( string $post_type, array $args ): bool {
	if ( empty( $args['namespace'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "namespace" key for plugin attribution.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	if ( empty( $args['name'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "name" key.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	if ( empty( $args['meta_key'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "meta_key" key.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	$check_name = $args['name'];
	$meta_key   = $args['meta_key'];
	unset( $args['name'], $args['meta_key'] );

	return \BlockAccessibility\Meta\Registry::get_instance()->register_meta_check( $post_type, $meta_key, $check_name, $args );
}

/**
 * Register a validation check for the editor (document-level).
 *
 * @param string $post_type Post type (e.g., 'post', 'page').
 * @param array  $args      Check configuration. Required keys: 'namespace', 'name', 'error_msg'.
 *                          Optional: 'title' (human-readable label; defaults to 'name'),
 *                          plus the same optional keys as ba11yc_register_block_check().
 * @return bool True on success, false on failure.
 */
function ba11yc_register_editor_check( string $post_type, array $args ): bool {
	if ( empty( $args['namespace'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "namespace" key for plugin attribution.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	if ( empty( $args['name'] ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'The $args array must include a "name" key.', 'block-accessibility-checks' ), '4.1.0' );
		return false;
	}

	$check_name = $args['name'];
	unset( $args['name'] );

	return \BlockAccessibility\Editor\Registry::get_instance()->register_editor_check( $post_type, $check_name, $args );
}

/**
 * Declare that a block type renders a heading.
 *
 * Lets the heading order check see headings that are not core/heading blocks.
 * Core blocks, and any block using a numeric `level` attribute, are recognized
 * without this; use it for blocks that do something else, including ones whose
 * block.json you do not control.
 *
 * The spec is data rather than a callback because the check runs live in the
 * editor, in JavaScript. For a level that cannot be expressed this way, use the
 * `ba11yc.blockHeadingLevels` JavaScript filter instead.
 *
 *     // A fixed level.
 *     ba11yc_register_heading_source( 'acme/section', array( 'level' => 2 ) );
 *
 *     // The level is chosen by the user and stored in an attribute.
 *     ba11yc_register_heading_source( 'acme/hero', array(
 *         'attribute' => 'headingLevel',
 *         'level'     => 2,
 *     ) );
 *
 *     // The attribute holds a token rather than a number.
 *     ba11yc_register_heading_source( 'acme/callout', array(
 *         'attribute' => 'size',
 *         'map'       => array( 'large' => 2, 'medium' => 3 ),
 *         'level'     => 3,
 *     ) );
 *
 *     // The heading only exists when an optional field has content.
 *     ba11yc_register_heading_source( 'acme/panel', array(
 *         'level'    => 2,
 *         'requires' => 'title',
 *     ) );
 *
 * @since 4.2.0
 *
 * @param string $block_type Block type name (e.g. 'acme/section').
 * @param array  $args       Heading spec. Optional keys: 'level' (0-6, where 0
 *                           means the block renders no heading), 'attribute'
 *                           (attribute holding the level), 'map' (translates
 *                           attribute values to levels), 'requires' (attribute
 *                           that must have content for the heading to exist).
 *                           Pass a list under 'headings' for a block that
 *                           renders more than one.
 * @return bool True on success, false on failure.
 */
function ba11yc_register_heading_source( string $block_type, array $args ): bool {
	if ( empty( $block_type ) ) {
		\_doing_it_wrong( __FUNCTION__, \esc_html__( 'A block type is required.', 'block-accessibility-checks' ), '4.2.0' );
		return false;
	}

	return \BlockAccessibility\Block\HeadingSources::get_instance()->register_source( $block_type, $args );
}
