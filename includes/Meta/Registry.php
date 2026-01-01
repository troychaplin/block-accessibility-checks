<?php
/**
 * Meta Checks Registry
 *
 * Central registry for managing post meta validation checks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.4.0
 */

namespace BlockAccessibility\Meta;

use BlockAccessibility\Core\Traits\Logger;

/**
 * Meta Checks Registry Class
 *
 * Manages registration and execution of validation checks for post meta fields.
 */
class Registry {

	use Logger;

	/**
	 * Registered meta checks
	 *
	 * @var array
	 */
	private $meta_checks = array();

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
	 * Register a meta check
	 *
	 * @param string $post_type  Post type (e.g., 'post', 'band').
	 * @param string $meta_key   Meta key being validated.
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_meta_check( string $post_type, string $meta_key, string $check_name, array $check_args ): bool {
		try {
			// Validate input parameters.
			if ( empty( $post_type ) || ! is_string( $post_type ) ) {
				$this->log_error( "Invalid post type provided: {$post_type}" );
				return false;
			}

			if ( empty( $meta_key ) || ! is_string( $meta_key ) ) {
				$this->log_error( "Invalid meta key provided: {$meta_key}" );
				return false;
			}

			if ( empty( $check_name ) || ! is_string( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			if ( ! is_array( $check_args ) ) {
				$this->log_error( "Check arguments must be an array for {$post_type}/{$meta_key}/{$check_name}" );
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
				$this->log_error( "error_msg is required for {$post_type}/{$meta_key}/{$check_name}" );
				return false;
			}

			// Fallback for warning_msg to error_msg.
			if ( empty( $check_args['warning_msg'] ) ) {
				$check_args['warning_msg'] = $check_args['error_msg'];
			}

			// Validate type parameter.
			$valid_types = array( 'error', 'warning', 'settings', 'none' );
			if ( ! in_array( $check_args['type'], $valid_types, true ) ) {
				$this->log_error( "Invalid type '{$check_args['type']}' for {$post_type}/{$meta_key}/{$check_name}. Using 'settings'." );
				$check_args['type'] = 'settings';
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'ba11yc_meta_check_args', $check_args, $post_type, $meta_key, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'ba11yc_should_register_meta_check', true, $post_type, $meta_key, $check_name, $check_args ) ) {
				$this->log_debug( "Meta check registration prevented by filter: {$post_type}/{$meta_key}/{$check_name}" );
				return false;
			}

			// Initialize post type array if needed.
			if ( ! isset( $this->meta_checks[ $post_type ] ) ) {
				$this->meta_checks[ $post_type ] = array();
			}

			// Initialize meta key array if needed.
			if ( ! isset( $this->meta_checks[ $post_type ][ $meta_key ] ) ) {
				$this->meta_checks[ $post_type ][ $meta_key ] = array();
			}

			// Store the check.
			$this->meta_checks[ $post_type ][ $meta_key ][ $check_name ] = $check_args;

			// Sort checks by priority.
			\uasort( $this->meta_checks[ $post_type ][ $meta_key ], array( $this, 'sort_checks_by_priority' ) );

			// Action hook for developers to know when a check is registered.
			\do_action( 'ba11yc_meta_check_registered', $post_type, $meta_key, $check_name, $check_args );

			$this->log_debug( "Successfully registered meta check: {$post_type}/{$meta_key}/{$check_name}" );
			return true;

		} catch ( \Exception $e ) {
			$this->log_error( "Error registering meta check {$post_type}/{$meta_key}/{$check_name}: " . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Get meta checks for a specific post type
	 *
	 * @param string $post_type Post type.
	 * @return array Array of meta checks for the post type.
	 */
	public function get_meta_checks( string $post_type ): array {
		return isset( $this->meta_checks[ $post_type ] ) ? $this->meta_checks[ $post_type ] : array();
	}

	/**
	 * Get all registered meta checks
	 *
	 * @return array All registered meta checks.
	 */
	public function get_all_meta_checks(): array {
		return $this->meta_checks;
	}

	/**
	 * Get configuration for a specific meta check
	 *
	 * @param string $post_type  Post type.
	 * @param string $meta_key   Meta key.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_meta_check_config( string $post_type, string $meta_key, string $check_name ): ?array {
		if ( ! isset( $this->meta_checks[ $post_type ][ $meta_key ][ $check_name ] ) ) {
			return null;
		}

		return $this->meta_checks[ $post_type ][ $meta_key ][ $check_name ];
	}

	/**
	 * Get the effective check level for a specific meta check
	 *
	 * This method determines the actual check level by considering both
	 * the check configuration and user settings.
	 *
	 * @param string $post_type  The post type.
	 * @param string $meta_key   The meta key.
	 * @param string $check_name The check name.
	 * @return string The effective check level ('error', 'warning', 'none').
	 */
	public function get_effective_meta_check_level( string $post_type, string $meta_key, string $check_name ): string {
		$meta_checks = $this->get_meta_checks( $post_type );

		if ( ! isset( $meta_checks[ $meta_key ][ $check_name ] ) ) {
			return 'none';
		}

		$check      = $meta_checks[ $meta_key ][ $check_name ];
		$check_type = $check['type'] ?? 'settings';

		// If the check has a forced type (not 'settings'), use it directly.
		if ( 'settings' !== $check_type ) {
			return $check_type;
		}

		// For settings-based checks, get the user's preference.
		return $this->get_meta_check_level_from_settings( $post_type, $meta_key, $check_name );
	}

	/**
	 * Get meta check level from user settings
	 *
	 * @param string $post_type  The post type.
	 * @param string $meta_key   The meta key.
	 * @param string $check_name The check name.
	 * @return string The check level from settings.
	 */
	private function get_meta_check_level_from_settings( string $post_type, string $meta_key, string $check_name ): string {
		// Field name format: meta_{post_type}_{meta_key}_{check_name} for external plugins
		// Field name format: meta_key_check_name for core post types.
		$external_field_name = 'meta_' . $post_type . '_' . $meta_key . '_' . $check_name;
		$core_field_name     = $meta_key . '_' . $check_name;

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

		// Fallback to post-type-specific option (for core post types).
		$option_name = 'block_checks_meta_' . $post_type;
		$options     = \get_option( $option_name, array() );

		return $options[ $core_field_name ] ?? 'error';
	}
}
