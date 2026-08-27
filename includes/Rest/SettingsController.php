<?php
/**
 * REST API: Settings Controller
 *
 * Reads and writes per-check severity-level overrides, per-check site-editor
 * flags, and general (non-check) settings via the REST API.
 *
 * @package BlockAccessibilityChecks
 * @since   4.0.0
 */

namespace BlockAccessibility\Rest;

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Response;
use WP_Error;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles reading and updating the consolidated ba11yc_settings option.
 */
class SettingsController extends WP_REST_Controller {

	/**
	 * The REST namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'block-accessibility-checks/v1';

	/**
	 * The REST base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

	/**
	 * The option key for storing settings.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'ba11yc_settings';

	/**
	 * Valid level values.
	 *
	 * @var array
	 */
	const VALID_LEVELS = array( 'error', 'warning', 'none' );

	/**
	 * Heading levels that may be removed from the editor.
	 *
	 * @var array
	 */
	const REMOVABLE_HEADING_LEVELS = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );

	/**
	 * Heading levels restricted when an admin has not saved a choice.
	 *
	 * H1 is reserved for the post title in most themes, so it is off by
	 * default; an admin can re-enable it in settings.
	 *
	 * @var array
	 */
	const DEFAULT_HEADING_LEVELS = array( 'h1' );

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * Permission check for reading/updating settings.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return true|WP_Error
	 */
	public function permissions_check( $request ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to manage these settings.', 'block-accessibility-checks' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * Get current settings.
	 *
	 * General settings that have never been saved are filled in with their
	 * defaults, so the settings UI shows what PHP will actually enforce
	 * rather than an empty option that reads as "nothing restricted".
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		$settings = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		if ( ! isset( $settings['general']['headingLevels'] ) ) {
			$settings['general']['headingLevels'] = self::DEFAULT_HEADING_LEVELS;
		}

		return new WP_REST_Response( $settings, 200 );
	}

	/**
	 * Update settings.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_items( $request ) {
		$settings = $request->get_json_params();

		if ( ! is_array( $settings ) ) {
			return new WP_Error(
				'invalid_settings',
				__( 'Settings must be a JSON object.', 'block-accessibility-checks' ),
				array( 'status' => 400 )
			);
		}

		$sanitized = $this->sanitize_settings( $settings );

		update_option( self::OPTION_KEY, $sanitized, true );

		return new WP_REST_Response( $sanitized, 200 );
	}

	/**
	 * Sanitize and validate settings.
	 *
	 * Keeps only valid scope keys, level values, boolean site-editor flags,
	 * and the recognized general settings.
	 *
	 * @param array $settings Raw settings input.
	 * @return array Sanitized settings.
	 */
	private function sanitize_settings( array $settings ): array {
		$sanitized = array();

		// Level overrides: block.
		$sanitized = $this->sanitize_level_scope( $settings, $sanitized, 'block', 2 );

		// Level overrides: meta (deeper by one level).
		if ( isset( $settings['meta'] ) && is_array( $settings['meta'] ) ) {
			foreach ( $settings['meta'] as $post_type => $meta_keys ) {
				if ( ! is_array( $meta_keys ) ) {
					continue;
				}
				foreach ( $meta_keys as $meta_key => $checks ) {
					if ( ! is_array( $checks ) ) {
						continue;
					}
					foreach ( $checks as $check_name => $level ) {
						if ( in_array( $level, self::VALID_LEVELS, true ) ) {
							$sanitized['meta'][ sanitize_text_field( $post_type ) ][ sanitize_text_field( $meta_key ) ][ sanitize_text_field( $check_name ) ] = $level;
						}
					}
				}
			}
		}

		// Level overrides: editor.
		$sanitized = $this->sanitize_level_scope( $settings, $sanitized, 'editor', 2 );

		// Per-check site-editor flags.
		if ( isset( $settings['siteEditor'] ) && is_array( $settings['siteEditor'] ) ) {
			$sanitized['siteEditor'] = $this->sanitize_site_editor_flags( $settings['siteEditor'] );
		}

		// General (non-check) settings.
		if ( isset( $settings['general'] ) && is_array( $settings['general'] ) ) {
			$sanitized['general'] = $this->sanitize_general( $settings['general'] );
		}

		return $sanitized;
	}

	/**
	 * Sanitize a two-level level-override scope (block or editor).
	 *
	 * @param array  $settings  The raw settings.
	 * @param array  $sanitized The accumulator.
	 * @param string $scope     The scope key ('block' or 'editor').
	 * @param int    $depth     Unused depth hint (kept for clarity).
	 * @return array The accumulator with the scope added.
	 */
	private function sanitize_level_scope( array $settings, array $sanitized, string $scope, int $depth ): array {
		if ( isset( $settings[ $scope ] ) && is_array( $settings[ $scope ] ) ) {
			foreach ( $settings[ $scope ] as $key => $checks ) {
				if ( ! is_array( $checks ) ) {
					continue;
				}
				foreach ( $checks as $check_name => $level ) {
					if ( in_array( $level, self::VALID_LEVELS, true ) ) {
						$sanitized[ $scope ][ sanitize_text_field( $key ) ][ sanitize_text_field( $check_name ) ] = $level;
					}
				}
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize the per-check site-editor flags structure.
	 *
	 * Mirrors the level-override scope shapes but stores booleans.
	 *
	 * @param array $flags Raw siteEditor flags.
	 * @return array Sanitized flags.
	 */
	private function sanitize_site_editor_flags( array $flags ): array {
		$result = array();

		foreach ( array( 'block', 'editor' ) as $scope ) {
			if ( isset( $flags[ $scope ] ) && is_array( $flags[ $scope ] ) ) {
				foreach ( $flags[ $scope ] as $key => $checks ) {
					if ( ! is_array( $checks ) ) {
						continue;
					}
					foreach ( $checks as $check_name => $enabled ) {
						$result[ $scope ][ sanitize_text_field( $key ) ][ sanitize_text_field( $check_name ) ] = (bool) $enabled;
					}
				}
			}
		}

		if ( isset( $flags['meta'] ) && is_array( $flags['meta'] ) ) {
			foreach ( $flags['meta'] as $post_type => $meta_keys ) {
				if ( ! is_array( $meta_keys ) ) {
					continue;
				}
				foreach ( $meta_keys as $meta_key => $checks ) {
					if ( ! is_array( $checks ) ) {
						continue;
					}
					foreach ( $checks as $check_name => $enabled ) {
						$result['meta'][ sanitize_text_field( $post_type ) ][ sanitize_text_field( $meta_key ) ][ sanitize_text_field( $check_name ) ] = (bool) $enabled;
					}
				}
			}
		}

		return $result;
	}

	/**
	 * Sanitize the general (non-check) settings.
	 *
	 * @param array $general Raw general settings.
	 * @return array Sanitized general settings.
	 */
	private function sanitize_general( array $general ): array {
		$result = array();

		if ( isset( $general['headingLevels'] ) && is_array( $general['headingLevels'] ) ) {
			$result['headingLevels'] = array();
			foreach ( $general['headingLevels'] as $level ) {
				$level = sanitize_text_field( $level );
				if ( in_array( $level, self::REMOVABLE_HEADING_LEVELS, true ) ) {
					$result['headingLevels'][] = $level;
				}
			}
		}

		return $result;
	}
}
