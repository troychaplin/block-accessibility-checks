<?php
/**
 * Meta Validation Functions
 *
 * Provides validation callback functions for post meta fields.
 *
 * @package BlockAccessibilityChecks
 * @since 1.4.0
 */

namespace BlockAccessibility;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create a required field validator for post meta
 *
 * This function registers the check upfront AND returns a validation callback.
 *
 * Usage:
 * register_post_meta('band', 'band_origin', [
 *     'validate_callback' => ba11yc_required('band', 'band_origin', [
 *         'error_msg' => 'Field is required',
 *         'type' => 'settings',
 *     ]),
 * ]);
 *
 * @param string $post_type Post type (e.g., 'band', 'post').
 * @param string $meta_key  Meta key being validated.
 * @param array  $args      Configuration arguments.
 * @return callable The validation callback.
 */
function ba11yc_required( string $post_type, string $meta_key, array $args = array() ): callable {
	$defaults = array(
		'error_msg'   => 'This field is required.',
		'warning_msg' => 'This field is recommended.',
		'type'        => 'settings',
		'category'    => 'validation',
		'check_name'  => 'required',
		'description' => '',
	);

	$config = \wp_parse_args( $args, $defaults );

	// Register the check immediately (not lazy).
	$registry = MetaChecksRegistry::get_instance();
	$registry->register_meta_check(
		$post_type,
		$meta_key,
		$config['check_name'],
		$config
	);

	// Return the validation callback.
	return function ( $value ) use ( $post_type, $meta_key, $config ) {
		// Get the effective validation level (respects admin settings).
		$registry = MetaChecksRegistry::get_instance();
		$level    = $registry->get_effective_meta_check_level(
			$post_type,
			$meta_key,
			$config['check_name']
		);

		if ( 'none' === $level ) {
			return true; // Check disabled in settings.
		}

		// Run validation through filter system.
		$is_valid = \apply_filters(
			'ba11yc.validateMeta',
			true,
			$value,
			$post_type,
			$meta_key,
			$config['check_name'],
			$config
		);

		// Default validation logic for 'required' check.
		if ( $is_valid && 'required' === $config['check_name'] ) {
			$is_valid = ! empty( $value ) && trim( (string) $value ) !== '';
		}

		// Return error only if validation fails and level is "error".
		if ( ! $is_valid && 'error' === $level ) {
			return new \WP_Error(
				'ba11yc_validation_failed',
				$config['error_msg'],
				array( 'status' => 400 )
			);
		}

		// For warnings, allow save (client-side will show warning).
		return true;
	};
}

/**
 * Detect post type from current context
 *
 * Attempts to determine the post type being edited from various sources:
 * - REST API request
 * - Admin screen
 * - Global $post
 * - Request parameters
 *
 * @return string|false Post type or false if not detected.
 */
function ba11yc_detect_post_type_from_context() {
	// Method 1: Check REST request.
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		$route = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		// Match patterns like /wp/v2/{post_type}/{id}.
		if ( preg_match( '#/wp/v2/([^/]+)/(\d+)#', $route, $matches ) ) {
			$post_type = $matches[1];

			// Get the actual post type from the post ID.
			$post_id = absint( $matches[2] );
			if ( $post_id ) {
				$actual_post_type = \get_post_type( $post_id );
				if ( $actual_post_type ) {
					return $actual_post_type;
				}
			}

			// Fallback: Handle plural to singular conversion.
			// Common patterns: posts -> post, pages -> page.
			$singular_map = array(
				'posts' => 'post',
				'pages' => 'page',
			);

			if ( isset( $singular_map[ $post_type ] ) ) {
				return $singular_map[ $post_type ];
			}

			// For custom post types, try removing trailing 's'.
			return rtrim( $post_type, 's' );
		}
	}

	// Method 2: Check current admin screen.
	if ( function_exists( 'get_current_screen' ) ) {
		$screen = \get_current_screen();
		if ( $screen && ! empty( $screen->post_type ) ) {
			return $screen->post_type;
		}
	}

	// Method 3: Check global $post.
	global $post;
	if ( $post && ! empty( $post->post_type ) ) {
		return $post->post_type;
	}

	// Method 4: Check $_REQUEST parameters.
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Reading context, not processing form submission.
	if ( ! empty( $_REQUEST['post_type'] ) ) {
		return \sanitize_key( wp_unslash( $_REQUEST['post_type'] ) );
	}

	if ( ! empty( $_REQUEST['post'] ) ) {
		$post_id = \absint( $_REQUEST['post'] );
		// phpcs:enable WordPress.Security.NonceVerification.Recommended
		$post_type = \get_post_type( $post_id );
		if ( $post_type ) {
			return $post_type;
		}
	}

	return false;
}
