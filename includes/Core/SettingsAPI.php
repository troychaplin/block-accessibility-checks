<?php
/**
 * Settings REST API
 *
 * Provides REST API endpoints for the React-based settings pages.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility\Core;

use BlockAccessibility\Block\Registry as BlockChecksRegistry;

/**
 * Class SettingsAPI
 *
 * Handles REST API endpoints for settings pages.
 */
class SettingsAPI {

	/**
	 * Registry instance for accessing block checks
	 *
	 * @var BlockChecksRegistry
	 */
	private $registry;

	/**
	 * Heading levels that can be removed from the editor.
	 * H2, H3, and H4 are always available.
	 *
	 * @var array
	 */
	private const REMOVABLE_HEADING_LEVELS = array( 'h1', 'h5', 'h6' );

	/**
	 * Valid values for check settings.
	 *
	 * @var array
	 */
	private const VALID_CHECK_VALUES = array( 'error', 'warning', 'none' );

	/**
	 * SettingsAPI constructor.
	 */
	public function __construct() {
		$this->registry = BlockChecksRegistry::get_instance();
		\add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register REST API routes
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		// Core block settings endpoints.
		\register_rest_route(
			'block-accessibility/v1',
			'/core-block-settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_core_block_settings' ),
					'permission_callback' => function () {
						return \current_user_can( 'manage_options' );
					},
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_core_block_settings' ),
					'permission_callback' => function () {
						return \current_user_can( 'manage_options' );
					},
					'args'                => array(
						'settings'      => array(
							'required'          => true,
							'type'              => 'object',
							'validate_callback' => array( $this, 'validate_settings_object' ),
						),
						'headingLevels' => array(
							'required'          => true,
							'type'              => 'array',
							'validate_callback' => array( $this, 'validate_heading_levels' ),
						),
					),
				),
			)
		);

		// Editor validation settings endpoints.
		\register_rest_route(
			'block-accessibility/v1',
			'/editor-validation-settings',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_editor_validation_settings' ),
					'permission_callback' => function () {
						return \current_user_can( 'manage_options' );
					},
					'args'                => array(
						'settings' => array(
							'required'          => true,
							'type'              => 'object',
							'validate_callback' => array( $this, 'validate_settings_object' ),
						),
					),
				),
			)
		);

		// External plugin settings endpoints.
		\register_rest_route(
			'block-accessibility/v1',
			'/external-plugin-settings/(?P<plugin_slug>[a-z0-9\-]+)',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_external_plugin_settings' ),
					'permission_callback' => function () {
						return \current_user_can( 'manage_options' );
					},
					'args'                => array(
						'plugin_slug' => array(
							'required' => true,
							'type'     => 'string',
						),
						'settings'    => array(
							'required'          => true,
							'type'              => 'object',
							'validate_callback' => array( $this, 'validate_settings_object' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Get core block settings
	 *
	 * Returns the current settings for all core blocks, formatted for the React app.
	 *
	 * @return \WP_REST_Response Response object.
	 */
	public function get_core_block_settings(): \WP_REST_Response {
		$all_checks = $this->registry->get_all_checks();
		$options    = \get_option( 'block_checks_options', array() );
		$blocks     = array();

		foreach ( $all_checks as $block_type => $checks ) {
			// Only process core blocks.
			if ( strpos( $block_type, 'core/' ) !== 0 ) {
				continue;
			}

			if ( empty( $checks ) ) {
				continue;
			}

			$block_label  = $this->get_core_block_label( $block_type );
			$block_checks = array();

			foreach ( $checks as $check_name => $check_config ) {
				// Only include checks that are using settings (not forced).
				if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
					continue;
				}

				$field_name = $block_type . '_' . $check_name;
				$value      = $options[ $field_name ] ?? 'error';

				$block_checks[] = array(
					'name'        => $check_name,
					'fieldName'   => $field_name,
					'description' => $check_config['description'],
					'category'    => $check_config['category'] ?? 'accessibility',
					'value'       => $value,
				);
			}

			$blocks[] = array(
				'blockType' => $block_type,
				'label'     => $block_label,
				'checks'    => $block_checks,
			);
		}

		// Get heading levels.
		$heading_levels = $options['core_heading_levels'] ?? array();

		return new \WP_REST_Response(
			array(
				'success'  => true,
				'settings' => array(
					'blocks'        => $blocks,
					'headingLevels' => $heading_levels,
				),
			),
			200
		);
	}

	/**
	 * Save core block settings
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function save_core_block_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$settings       = $request->get_param( 'settings' );
		$heading_levels = $request->get_param( 'headingLevels' );

		// Get existing options to preserve other settings.
		$existing_options = \get_option( 'block_checks_options', array() );

		// Update check settings.
		foreach ( $settings as $field_name => $value ) {
			if ( in_array( $value, self::VALID_CHECK_VALUES, true ) ) {
				$existing_options[ $field_name ] = $value;
			}
		}

		// Update heading levels.
		$sanitized_levels = array();
		if ( is_array( $heading_levels ) ) {
			foreach ( $heading_levels as $level ) {
				if ( in_array( $level, self::REMOVABLE_HEADING_LEVELS, true ) ) {
					$sanitized_levels[] = $level;
				}
			}
		}
		$existing_options['core_heading_levels'] = $sanitized_levels;

		// Save options.
		\update_option( 'block_checks_options', $existing_options );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => \__( 'Settings saved successfully!', 'block-accessibility-checks' ),
			),
			200
		);
	}

	/**
	 * Validate settings object
	 *
	 * @param mixed            $value   The value to validate.
	 * @param \WP_REST_Request $request The request object.
	 * @param string           $param   The parameter name.
	 * @return bool True if valid, false otherwise.
	 */
	public function validate_settings_object( $value, \WP_REST_Request $request, string $param ): bool { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $field_name => $field_value ) {
			if ( ! is_string( $field_name ) || ! in_array( $field_value, self::VALID_CHECK_VALUES, true ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Validate heading levels array
	 *
	 * @param mixed            $value   The value to validate.
	 * @param \WP_REST_Request $request The request object.
	 * @param string           $param   The parameter name.
	 * @return bool True if valid, false otherwise.
	 */
	public function validate_heading_levels( $value, \WP_REST_Request $request, string $param ): bool { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $level ) {
			if ( ! in_array( $level, self::REMOVABLE_HEADING_LEVELS, true ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Save editor validation settings
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function save_editor_validation_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$settings = $request->get_param( 'settings' );

		// Save to the meta options for post and page.
		foreach ( $settings as $key => $value ) {
			if ( ! in_array( $value, self::VALID_CHECK_VALUES, true ) ) {
				continue;
			}

			// Parse the key format: "postType:fieldName".
			$parts = explode( ':', $key, 2 );
			if ( count( $parts ) !== 2 ) {
				continue;
			}

			list( $post_type, $field_name ) = $parts;

			// Validate post type and field name.
			if ( ! in_array( $post_type, array( 'post', 'page' ), true ) ) {
				continue;
			}

			if ( strpos( $field_name, 'editor_' ) !== 0 ) {
				continue;
			}

			// Update the specific post type option.
			$this->update_meta_option( $post_type, $field_name, $value );
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => \__( 'Settings saved successfully!', 'block-accessibility-checks' ),
			),
			200
		);
	}

	/**
	 * Save external plugin settings
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function save_external_plugin_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$plugin_slug = $request->get_param( 'plugin_slug' );
		$settings    = $request->get_param( 'settings' );

		$option_name      = 'block_checks_external_' . $plugin_slug;
		$existing_options = \get_option( $option_name, array() );

		// Update settings.
		foreach ( $settings as $field_name => $value ) {
			if ( in_array( $value, self::VALID_CHECK_VALUES, true ) ) {
				$existing_options[ $field_name ] = $value;
			}
		}

		// Save options.
		\update_option( $option_name, $existing_options );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'message' => \__( 'Settings saved successfully!', 'block-accessibility-checks' ),
			),
			200
		);
	}

	/**
	 * Helper to update meta option for a post type
	 *
	 * @param string $post_type  The post type.
	 * @param string $field_name The field name.
	 * @param string $value      The value.
	 * @return void
	 */
	private function update_meta_option( string $post_type, string $field_name, string $value ): void {
		$option_name                     = 'block_checks_meta_' . $post_type;
		$existing_options                = \get_option( $option_name, array() );
		$existing_options[ $field_name ] = $value;
		\update_option( $option_name, $existing_options );
	}

	/**
	 * Get display label for a core block type
	 *
	 * Returns a translated label for core blocks, with fallback to
	 * auto-generated label for any blocks not in the predefined list.
	 *
	 * @param string $block_type The block type.
	 * @return string The display label.
	 */
	private function get_core_block_label( string $block_type ): string {
		$labels = array(
			'core/button'  => \__( 'Button Block', 'block-accessibility-checks' ),
			'core/heading' => \__( 'Heading Block', 'block-accessibility-checks' ),
			'core/image'   => \__( 'Image Block', 'block-accessibility-checks' ),
			'core/table'   => \__( 'Table Block', 'block-accessibility-checks' ),
		);

		if ( isset( $labels[ $block_type ] ) ) {
			return $labels[ $block_type ];
		}

		// Fallback: Convert block type to display name.
		$parts      = explode( '/', $block_type );
		$block_name = $parts[1] ?? $block_type;
		return ucwords( str_replace( array( '-', '_' ), ' ', $block_name ) );
	}
}
