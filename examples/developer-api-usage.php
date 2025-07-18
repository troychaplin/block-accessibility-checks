<?php
// phpcs:ignoreFile
/**
 * Block Accessibility Checks - Developer API Usage Examples
 *
 * This file demonstrates how to use the Block Accessibility Checks plugin API
 * to register custom accessibility checks or modify existing ones.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Example 1: Register a custom accessibility check
 *
 * This example shows how to register a new check for the heading block
 * to ensure it has a proper heading level structure.
 */
add_action( 'ba11yc_register_checks', 'example_register_heading_check' );

function example_register_heading_check( $registry ) {
	$registry->register_check(
		'core/heading',
		'heading_length',
		array(
			'callback'    => 'example_check_heading_length',
			'message'     => __( 'Heading text should be concise (under 60 characters)', 'your-plugin-textdomain' ),
			'type'        => 'warning',
			'priority'    => 10,
			'description' => __( 'Short headings are easier to scan and navigate with screen readers', 'your-plugin-textdomain' ),
		)
	);
}

/**
 * Check if heading text is too long
 *
 * @param array  $attributes Block attributes.
 * @param string $content Block content.
 * @param array  $config Check configuration.
 * @return bool True if check fails.
 */
function example_check_heading_length( $attributes, $content, $config ) {
	if ( ! isset( $attributes['content'] ) ) {
		return false;
	}

	$heading_text = trim( wp_strip_all_tags( $attributes['content'] ) );
	return strlen( $heading_text ) > 60;
}

/**
 * Example 2: Disable a default check
 *
 * This example shows how to disable the default alt text length check
 * for images if you want to implement your own logic.
 */
add_action( 'ba11yc_ready', 'example_disable_default_check' );

function example_disable_default_check( $registry ) {
	// Disable the default alt text length check.
	$registry->set_check_enabled( 'core/image', 'alt_text_length', false );
}

/**
 * Example 3: Filter check results to modify messages
 *
 * This example shows how to customize the message for a specific check
 * based on context or user preferences.
 */
add_filter( 'ba11yc_final_check_result', 'example_customize_check_message', 10, 7 );

function example_customize_check_message( $result, $check_name, $block_type, $attributes, $content, $check_config ) {
	// Customize the alt text length message for images.
	if ( $block_type === 'core/image' && $check_name === 'alt_text_length' ) {
		$alt_length        = isset( $attributes['alt'] ) ? strlen( $attributes['alt'] ) : 0;
		$result['message'] = sprintf(
			__( 'Alternative text is %d characters. Consider keeping it under 125 characters for better accessibility.', 'your-plugin-textdomain' ),
			$alt_length
		);
	}

	return $result;
}

/**
 * Example 4: Add context-specific checks
 *
 * This example shows how to add different checks based on the context
 * where the block is being used.
 */
add_filter( 'ba11yc_block_checks', 'example_context_specific_checks', 10, 4 );

function example_context_specific_checks( $checks, $block_type, $attributes, $content ) {
	// Add stricter checks for headings in the main content area.
	if ( $block_type === 'core/heading' && is_main_query() ) {
		// You could add additional checks here or modify existing ones.
		// For example, require heading IDs for better anchor navigation.
	}

	return $checks;
}

/**
 * Example 5: Log accessibility check results
 *
 * This example shows how to log or store accessibility check results
 * for analytics or reporting purposes.
 */
add_action( 'ba11yc_check_registered', 'example_log_check_registration', 10, 3 );

function example_log_check_registration( $block_type, $check_name, $check_args ) {
	// Log when new checks are registered (useful for debugging).
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log(
			sprintf(
				'Block Accessibility Check registered: %s/%s - %s',
				$block_type,
				$check_name,
				$check_args['message']
			)
		);
	}
}

/**
 * Example 6: Prevent default checks from loading
 *
 * This example shows how to prevent all default checks from being registered
 * if you want to implement completely custom logic.
 */
// add_filter( 'ba11yc_register_default_checks', '__return_false' );

/**
 * Example 7: Access the plugin initializer for advanced integration
 *
 * This example shows how to access the full plugin initializer
 * for more advanced integrations.
 */
add_action( 'ba11yc_plugin_initialized', 'example_advanced_integration' );

function example_advanced_integration( $plugin_initializer ) {
	// Access any service from the plugin.
	$settings_page = $plugin_initializer->get_service( 'settings_page' );
	$block_config  = $plugin_initializer->get_service( 'block_config' );

	// You can now integrate with other plugin components.
	// For example, add your own settings or modify block configurations.
}

/**
 * Available Hooks and Filters:
 *
 * Actions:
 * - ba11yc_plugin_initialized: Fired when the plugin is fully initialized
 * - ba11yc_ready: Fired when the plugin is ready, passes registry and initializer
 * - ba11yc_register_checks: Fired during check registration, passes registry
 * - ba11yc_check_registered: Fired when a check is registered
 * - ba11yc_check_unregistered: Fired when a check is unregistered
 * - ba11yc_check_toggled: Fired when a check is enabled/disabled
 *
 * Filters:
 * - ba11yc_register_default_checks: Filter whether default checks should be registered
 * - ba11yc_should_register_check: Filter whether a specific check should be registered
 * - ba11yc_check_args: Filter check arguments before registration
 * - ba11yc_block_checks: Filter which checks run for a specific block
 * - ba11yc_block_attributes: Filter block attributes before checks run
 * - ba11yc_before_check: Filter check configuration before it runs
 * - ba11yc_check_result: Filter the result of a single check
 * - ba11yc_final_check_result: Filter the final result object for a check
 * - ba11yc_block_check_results: Filter all results for a block
 */
