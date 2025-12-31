<?php
/**
 * Editor Checks Registry
 *
 * Central registry for managing general editor validation checks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.4.0
 */

namespace BlockAccessibility\Editor;

use BlockAccessibility\Core\Traits\Logger;

/**
 * Editor Checks Registry Class
 *
 * Manages registration and execution of validation checks for the general editor state (e.g. block order).
 */
class Registry {

	use Logger;

	/**
	 * Registered editor checks
	 *
	 * @var array
	 */
	private $editor_checks = array();

	/**
	 * Registry instance
	 *
	 * @var Registry|null
	 */
	private static $instance = null;

	/**
	 * Get registry instance
	 *
	 * @return Registry The registry singleton instance.
	 */
	public static function get_instance(): Registry {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		// Private constructor for singleton pattern.
	}

	/**
	 * Sort checks by priority
	 *
	 * @param array $a First check.
	 * @param array $b Second check.
	 * @return int Comparison result.
	 */
	private function sort_checks_by_priority( $a, $b ) {
		return $a['priority'] - $b['priority'];
	}

	/**
	 * Register an editor check
	 *
	 * @param string $post_type  Post type (e.g., 'post', 'page').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_editor_check( string $post_type, string $check_name, array $check_args ): bool {
		try {
			// Validate input parameters.
			if ( empty( $post_type ) || ! is_string( $post_type ) ) {
				$this->log_error( "Invalid post type provided: {$post_type}" );
				return false;
			}

			if ( empty( $check_name ) || ! is_string( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			if ( ! is_array( $check_args ) ) {
				$this->log_error( "Check arguments must be an array for {$post_type}/{$check_name}" );
				return false;
			}

			$defaults = array(
				'error_msg'   => '',
				'warning_msg' => '',
				'type'        => 'settings',
				'priority'    => 10,
				'enabled'     => true,
				'description' => '',
			);

			$check_args = \wp_parse_args( $check_args, $defaults );

			// Validate required parameters.
			if ( empty( $check_args['error_msg'] ) ) {
				$this->log_error( "error_msg is required for {$post_type}/{$check_name}" );
				return false;
			}

			// Fallback for warning_msg to error_msg.
			if ( empty( $check_args['warning_msg'] ) ) {
				$check_args['warning_msg'] = $check_args['error_msg'];
			}

			// Validate type parameter.
			$valid_types = array( 'error', 'warning', 'settings', 'none' );
			if ( ! in_array( $check_args['type'], $valid_types, true ) ) {
				$this->log_error( "Invalid type '{$check_args['type']}' for {$post_type}/{$check_name}. Using 'settings'." );
				$check_args['type'] = 'settings';
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'ba11yc_editor_check_args', $check_args, $post_type, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'ba11yc_should_register_editor_check', true, $post_type, $check_name, $check_args ) ) {
				$this->log_debug( "Editor check registration prevented by filter: {$post_type}/{$check_name}" );
				return false;
			}

			// Initialize post type array if needed.
			if ( ! isset( $this->editor_checks[ $post_type ] ) ) {
				$this->editor_checks[ $post_type ] = array();
			}

			// Store the check.
			$this->editor_checks[ $post_type ][ $check_name ] = $check_args;

			// Sort checks by priority.
			\uasort( $this->editor_checks[ $post_type ], array( $this, 'sort_checks_by_priority' ) );

			// Action hook for developers to know when a check is registered.
			\do_action( 'ba11yc_editor_check_registered', $post_type, $check_name, $check_args );

			$this->log_debug( "Successfully registered editor check: {$post_type}/{$check_name}" );
			return true;

		} catch ( \Exception $e ) {
			$this->log_error( "Error registering editor check {$post_type}/{$check_name}: " . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Register an editor check for multiple post types
	 *
	 * Convenience method to register the same check configuration for multiple post types.
	 *
	 * @param array  $post_types Array of post types (e.g., ['post', 'page', 'custom_type']).
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return array Array of results, keyed by post type. Each value is true on success, false on failure.
	 */
	public function register_editor_check_for_post_types( array $post_types, string $check_name, array $check_args ): array {
		$results = array();

		foreach ( $post_types as $post_type ) {
			$results[ $post_type ] = $this->register_editor_check( $post_type, $check_name, $check_args );
		}

		return $results;
	}

	/**
	 * Get editor checks for a specific post type
	 *
	 * @param string $post_type Post type.
	 * @return array Array of editor checks for the post type.
	 */
	public function get_editor_checks( string $post_type ): array {
		return isset( $this->editor_checks[ $post_type ] ) ? $this->editor_checks[ $post_type ] : array();
	}

	/**
	 * Get all registered editor checks
	 *
	 * @return array All registered editor checks.
	 */
	public function get_all_editor_checks(): array {
		return $this->editor_checks;
	}

	/**
	 * Get configuration for a specific editor check
	 *
	 * @param string $post_type  Post type.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_editor_check_config( string $post_type, string $check_name ): ?array {
		if ( ! isset( $this->editor_checks[ $post_type ][ $check_name ] ) ) {
			return null;
		}

		return $this->editor_checks[ $post_type ][ $check_name ];
	}

	/**
	 * Get the effective check level for a specific editor check
	 *
	 * This method determines the actual check level by considering both
	 * the check configuration and user settings.
	 *
	 * @param string $post_type  The post type.
	 * @param string $check_name The check name.
	 * @return string The effective check level ('error', 'warning', 'none').
	 */
	public function get_effective_editor_check_level( string $post_type, string $check_name ): string {
		$editor_checks = $this->get_editor_checks( $post_type );

		if ( ! isset( $editor_checks[ $check_name ] ) ) {
			return 'none';
		}

		$check      = $editor_checks[ $check_name ];
		$check_type = $check['type'] ?? 'settings';

		// If the check has a forced type (not 'settings'), use it directly.
		if ( 'settings' !== $check_type ) {
			return $check_type;
		}

		// For settings-based checks, get the user's preference.
		return $this->get_editor_check_level_from_settings( $post_type, $check_name );
	}

	/**
	 * Get editor check level from user settings
	 *
	 * @param string $post_type  The post type.
	 * @param string $check_name The check name.
	 * @return string The check level from settings.
	 */
	private function get_editor_check_level_from_settings( string $post_type, string $check_name ): string {
		// Field name format: editor_{post_type}_{check_name} for external plugins
		// Field name format: editor_check_name for core post types.
		$external_field_name = 'editor_' . $post_type . '_' . $check_name;
		$core_field_name     = 'editor_' . $check_name;

		// Try to find this in external plugin settings first
		// by checking all external plugin options.
		$all_options = \wp_load_alloptions();
		foreach ( $all_options as $option_name => $option_value ) {
			if ( strpos( $option_name, 'block_checks_external_' ) === 0 ) {
				$options = \get_option( $option_name, array() );
				// Check with external field name format first.
				if ( isset( $options[ $external_field_name ] ) ) {
					return $options[ $external_field_name ];
				}
			}
		}

		// Fallback to post-type-specific option (using same option as meta for simplicity/grouping).
		$option_name = 'block_checks_meta_' . $post_type;
		$options     = \get_option( $option_name, array() );

		return $options[ $core_field_name ] ?? 'error';
	}
}
