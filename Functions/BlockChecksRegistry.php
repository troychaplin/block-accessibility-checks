<?php
/**
 * Block Checks Registry
 *
 * Central registry for managing block accessibility checks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility;

/**
 * Block Checks Registry Class
 *
 * Manages registration and execution of accessibility checks for different block types.
 */
class BlockChecksRegistry {

	/**
	 * Registered checks
	 *
	 * @var array
	 */
	private $checks = array();

	/**
	 * Registry instance
	 *
	 * @var BlockChecksRegistry|null
	 */
	private static $instance = null;

	/**
	 * Get registry instance
	 *
	 * @return BlockChecksRegistry The registry singleton instance.
	 */
	public static function get_instance(): BlockChecksRegistry {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		$this->register_default_checks();
	}

	/**
	 * Register default accessibility checks
	 *
	 * Sets up the default accessibility checks for various core blocks
	 * including image alt text validation and button text quality checks.
	 *
	 * @return void
	 */
	private function register_default_checks(): void {
		// Allow developers to prevent default checks from being registered.
		if ( ! \apply_filters( 'ba11yc_register_default_checks', true ) ) {
			return;
		}

		// Button text check.
		$this->register_check(
			'core/button',
			'check_button_text',
			array(
				'error_msg'   => \__( 'Button text is required and should be descriptive and meaningful', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Adding text to a button is highly recommended', 'block-accessibility-checks' ),
				'description' => \__( 'Button text validation', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 10,
			)
		);

		// Button link check.
		$this->register_check(
			'core/button',
			'check_button_link',
			array(
				'error_msg'   => \__( 'Buttons are required to have a link', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Adding a link to a button is highly recommended', 'block-accessibility-checks' ),
				'description' => \__( 'Button link validation', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 5,
			)
		);

		// Image block checks.
		$this->register_check(
			'core/image',
			'check_image_alt_text',
			array(
				'error_msg'   => \__( 'Images are required to have alternative text', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Using alt text is highly recommended', 'block-accessibility-checks' ),
				'description' => \__( 'Alternative text validation', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 5,
			)
		);

		// Image alt text length check.
		$this->register_check(
			'core/image',
			'check_image_alt_text_length',
			array(
				'error_msg'   => \__( 'Image alt text cannot be longer than 125 characters', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Image alt text is recommended to be less than 125 characters', 'block-accessibility-checks' ),
				'description' => \__( 'Alternative text length validation', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 10,
			)
		);

		// Image alt text match check.
		$this->register_check(
			'core/image',
			'check_image_alt_caption_match',
			array(
				'error_msg'   => \__( 'Image caption cannot be the same as the alternative text', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Using different alt and caption text is highly recommended', 'block-accessibility-checks' ),
				'description' => \__( 'Alternative and caption text match validation', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 10,
			)
		);

		// Table headers check.
		$this->register_check(
			'core/table',
			'check_table_headers',
			array(
				'error_msg'   => \__( 'Tables are required to have headers', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Using headers in tables is highly recommended', 'block-accessibility-checks' ),
				'description' => \__( 'Table headers validation', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 5,
			)
		);

		// Hook for developers to register additional checks.
		\do_action( 'ba11yc_register_checks', $this );
	}

	/**
	 * Register a new accessibility check
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_check( string $block_type, string $check_name, array $check_args ): bool {
		try {
			// Validate input parameters.
			if ( empty( $block_type ) || ! is_string( $block_type ) ) {
				$this->log_error( "Invalid block type provided: {$block_type}" );
				return false;
			}

			if ( empty( $check_name ) || ! is_string( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			if ( ! is_array( $check_args ) ) {
				$this->log_error( "Check arguments must be an array for {$block_type}/{$check_name}" );
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
				$this->log_error( "error_msg is required for {$block_type}/{$check_name}" );
				return false;
			}

			// Fallback for warning_msg to error_msg.
			if ( empty( $check_args['warning_msg'] ) ) {
				$check_args['warning_msg'] = $check_args['error_msg'];
			}

			// Validate type parameter.
			$valid_types = array( 'error', 'warning', 'settings', 'none' );
			if ( ! in_array( $check_args['type'], $valid_types, true ) ) {
				$this->log_error( "Invalid type '{$check_args['type']}' for {$block_type}/{$check_name}. Using 'settings'." );
				$check_args['type'] = 'settings';
			}

			// Validate priority parameter.
			if ( ! is_numeric( $check_args['priority'] ) ) {
				$this->log_error( "Invalid priority '{$check_args['priority']}' for {$block_type}/{$check_name}. Using 10." );
				$check_args['priority'] = 10;
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'ba11yc_check_args', $check_args, $block_type, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'ba11yc_should_register_check', true, $block_type, $check_name, $check_args ) ) {
				$this->log_debug( "Check registration prevented by filter: {$block_type}/{$check_name}" );
				return false;
			}

			// Check if check already exists.
			if ( isset( $this->checks[ $block_type ][ $check_name ] ) ) {
				$this->log_debug( "Overriding existing check: {$block_type}/{$check_name}" );
			}

			// Initialize block type array if needed.
			if ( ! isset( $this->checks[ $block_type ] ) ) {
				$this->checks[ $block_type ] = array();
			}

			// Store the check.
			$this->checks[ $block_type ][ $check_name ] = $check_args;

			// Sort checks by priority.
			\uasort( $this->checks[ $block_type ], array( $this, 'sort_checks_by_priority' ) );

			// Action hook for developers to know when a check is registered.
			\do_action( 'ba11yc_check_registered', $block_type, $check_name, $check_args );

			$this->log_debug( "Successfully registered check: {$block_type}/{$check_name}" );
			return true;

		} catch ( \Exception $e ) {
			$this->log_error( "Error registering check {$block_type}/{$check_name}: " . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Unregister an accessibility check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return bool True on success, false if check not found.
	 */
	public function unregister_check( string $block_type, string $check_name ): bool {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return false;
		}

		unset( $this->checks[ $block_type ][ $check_name ] );

		// Action hook for developers to know when a check is unregistered.
		\do_action( 'ba11yc_check_unregistered', $block_type, $check_name );

		return true;
	}

	/**
	 * Enable or disable a specific check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @param bool   $enabled Whether to enable or disable the check.
	 * @return bool True on success, false if check not found.
	 */
	public function set_check_enabled( string $block_type, string $check_name, bool $enabled ): bool {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return false;
		}

		$this->checks[ $block_type ][ $check_name ]['enabled'] = (bool) $enabled;

		// Action hook for developers to know when a check is enabled/disabled.
		\do_action( 'ba11yc_check_toggled', $block_type, $check_name, $enabled );

		return true;
	}

	/**
	 * Get checks for a specific block type
	 *
	 * @param string $block_type Block type.
	 * @return array Array of checks for the block type.
	 */
	public function get_checks( string $block_type ): array {
		return isset( $this->checks[ $block_type ] ) ? $this->checks[ $block_type ] : array();
	}

	/**
	 * Get all registered checks
	 *
	 * @return array All registered checks.
	 */
	public function get_all_checks(): array {
		return $this->checks;
	}

	/**
	 * Check if a specific check is registered
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return bool True if registered, false otherwise.
	 */
	public function is_check_registered( $block_type, $check_name ) {
		return isset( $this->checks[ $block_type ][ $check_name ] );
	}

	/**
	 * Get configuration for a specific check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_check_config( $block_type, $check_name ) {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return null;
		}

		return $this->checks[ $block_type ][ $check_name ];
	}

	/**
	 * Get all registered block types
	 *
	 * @return array Array of block types that have checks registered.
	 */
	public function get_registered_block_types() {
		return \array_keys( $this->checks );
	}

	/**
	 * Run checks for a block
	 *
	 * @param string $block_type Block type.
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @return array Array of check results.
	 */
	public function run_checks( $block_type, $attributes, $content = '' ) {
		try {
			// Validate input parameters.
			if ( empty( $block_type ) || ! is_string( $block_type ) ) {
				$this->log_error( "Invalid block type provided to run_checks: {$block_type}" );
				return array();
			}

			if ( ! is_array( $attributes ) ) {
				$this->log_error( "Invalid attributes provided to run_checks for {$block_type}" );
				return array();
			}

			$results = array();
			$checks  = $this->get_checks( $block_type );

			if ( empty( $checks ) ) {
				$this->log_debug( "No checks registered for block type: {$block_type}" );
				return array();
			}

			// Allow developers to filter which checks run for a block.
			$checks = \apply_filters( 'ba11yc_block_checks', $checks, $block_type, $attributes, $content );

			// Allow developers to completely filter the attributes before checks run.
			$attributes = \apply_filters( 'ba11yc_block_attributes', $attributes, $block_type, $content );

			foreach ( $checks as $check_name => $check_config ) {
				try {
					if ( ! $check_config['enabled'] ) {
						$this->log_debug( "Check disabled, skipping: {$block_type}/{$check_name}" );
						continue;
					}

					// Skip PHP validation - all validation now handled in JavaScript.
					$this->log_debug( "PHP validation disabled, all validation handled in JavaScript: {$block_type}/{$check_name}" );
					continue;

				} catch ( \Exception $e ) {
					$this->log_error( "Error processing check {$block_type}/{$check_name}: " . $e->getMessage() );
					// Continue with other checks even if one fails.
					continue;
				}
			}

			// Allow developers to filter all results for a block.
			$results = \apply_filters( 'ba11yc_block_check_results', $results, $block_type, $attributes, $content );

			return $results;

		} catch ( \Exception $e ) {
			$this->log_error( "Error in run_checks for {$block_type}: " . $e->getMessage() );
			return array();
		}
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
	 * Check image alt text length
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content (unused but required by interface).
	 * @param array  $config Check configuration (unused but required by interface).
	 * @return bool True if check fails.
	/**
	 * PHP validation callbacks removed - all validation now handled in JavaScript.
	 * See src/scripts/blockChecks/coreBlockValidation.js for the JavaScript validation logic.
	 */

	/**
	 * Get the effective check level for a specific check
	 *
	 * This method determines the actual check level by considering both
	 * the check configuration and user settings.
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return string The effective check level ('error', 'warning', 'none').
	 */
	public function get_effective_check_level( string $block_type, string $check_name ): string {
		$checks = $this->get_checks( $block_type );

		if ( ! isset( $checks[ $check_name ] ) ) {
			return 'none';
		}

		$check      = $checks[ $check_name ];
		$check_type = $check['type'] ?? 'settings';

		// If the check has a forced type (not 'settings'), use it directly.
		if ( 'settings' !== $check_type ) {
			return $check_type;
		}

		// For settings-based checks, get the user's preference.
		return $this->get_check_level_from_settings( $block_type, $check_name );
	}

	/**
	 * Get check level from user settings
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return string The check level from settings.
	 */
	private function get_check_level_from_settings( string $block_type, string $check_name ): string {
		// Handle core blocks.
		if ( strpos( $block_type, 'core/' ) === 0 ) {
			return $this->get_core_block_setting( $block_type, $check_name );
		}

		// Handle external blocks.
		return $this->get_external_block_setting( $block_type, $check_name );
	}

	/**
	 * Get setting for core blocks
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return string The check level.
	 */
	private function get_core_block_setting( string $block_type, string $check_name ): string {
		$options = \get_option( 'block_checks_options', array() );

		// For individual check settings, use the format: block_type_check_name.
		$field_name = $block_type . '_' . $check_name;

		return $options[ $field_name ] ?? 'error';
	}

	/**
	 * Get setting for external blocks
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return string The check level.
	 */
	private function get_external_block_setting( string $block_type, string $check_name ): string {
		// Extract plugin slug from block type.
		$plugin_info = $this->extract_plugin_info_from_block_type( $block_type );
		$plugin_slug = $plugin_info['slug'];

		$option_name = 'block_checks_external_' . $plugin_slug;
		$options     = \get_option( $option_name, array() );

		$field_name = $block_type . '_' . $check_name;

		return $options[ $field_name ] ?? 'error';
	}

	/**
	 * Extract plugin information from block type
	 *
	 * @param string $block_type The block type.
	 * @return array Plugin information.
	 */
	private function extract_plugin_info_from_block_type( string $block_type ): array {
		$parts     = explode( '/', $block_type );
		$namespace = $parts[0] ?? '';

		// Convert namespace to readable name.
		$plugin_name = ucwords( str_replace( array( '-', '_' ), ' ', $namespace ) );

		// Create a slug for the plugin.
		$plugin_slug = \sanitize_title( $namespace );

		return array(
			'name' => $plugin_name,
			'slug' => $plugin_slug,
		);
	}

	/**
	 * Log error messages when WP_DEBUG is enabled
	 *
	 * @param string $message Error message to log.
	 * @return void
	 */
	private function log_error( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( 'Block Accessibility Checks - BlockChecksRegistry: ' . $message );
		}
	}

	/**
	 * Log debug messages when WP_DEBUG is enabled
	 *
	 * @param string $message Debug message to log.
	 * @return void
	 */
	private function log_debug( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) && defined( 'WP_DEBUG_LOG' ) && constant( 'WP_DEBUG_LOG' ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( 'Block Accessibility Checks - BlockChecksRegistry DEBUG: ' . $message );
		}
	}
}
