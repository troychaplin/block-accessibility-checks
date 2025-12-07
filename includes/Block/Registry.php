<?php
/**
 * Block Checks Registry
 *
 * Central registry for managing block accessibility checks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility\Block;

use BlockAccessibility\Core\Traits\Logger;

/**
 * Block Checks Registry Class
 *
 * Manages registration and execution of accessibility checks for different block types.
 * Delegates core block check registration to CoreBlockChecks class for better separation of concerns.
 */
class Registry {

	use Logger;

	/**
	 * Registered checks
	 *
	 * @var array
	 */
	private $checks = array();

	/**
	 * Plugin information for each block type
	 *
	 * @var array
	 */
	private $plugin_info = array();

	/**
	 * Plugin information cache to avoid re-detection
	 *
	 * @var array
	 */
	private $plugin_info_cache = array();

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
	 * Core block checks instance
	 *
	 * @var CoreChecks|null
	 */
	private $core_block_checks = null;

	/**
	 * Constructor
	 */
	private function __construct() {
		// Initialize core block checks.
		$this->init_core_block_checks();
	}

	/**
	 * Initialize core block checks
	 *
	 * Creates and initializes the CoreBlockChecks instance to register
	 * default accessibility checks for WordPress core blocks.
	 *
	 * @return void
	 */
	private function init_core_block_checks(): void {
		// Allow developers to prevent default checks from being registered.
		if ( ! \apply_filters( 'ba11yc_register_default_checks', true ) ) {
			return;
		}

		// Create core block checks instance.
		$this->core_block_checks = new CoreChecks( $this );

		// Register default checks.
		$this->core_block_checks->register_default_checks();
	}

	/**
	 * Register a new accessibility check
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @param array  $plugin_info Optional plugin information (e.g., ['name' => 'Plugin Name', 'slug' => 'plugin-slug']).
	 * @return bool True on success, false on failure.
	 */
	public function register_check( string $block_type, string $check_name, array $check_args, array $plugin_info = array() ): bool {
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

			if ( ! is_array( $plugin_info ) ) {
				$this->log_error( "Plugin info must be an array for {$block_type}/{$check_name}" );
				return false;
			}

			$defaults = array(
				'error_msg'   => '',
				'warning_msg' => '',
				'type'        => 'settings',
				'category'    => 'accessibility',
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

			// Validate type parameter (optional, defaults to 'settings').
			$valid_types = array( 'error', 'warning', 'settings', 'none' );
			if ( ! in_array( $check_args['type'], $valid_types, true ) ) {
				$this->log_error( "Invalid type '{$check_args['type']}' for {$block_type}/{$check_name}. Using 'settings'." );
				$check_args['type'] = 'settings';
			}

			// Validate category parameter (optional, defaults to 'accessibility').
			$valid_categories = array( 'accessibility', 'validation' );
			if ( ! in_array( $check_args['category'], $valid_categories, true ) ) {
				$this->log_error( "Invalid category '{$check_args['category']}' for {$block_type}/{$check_name}. Using 'accessibility'." );
				$check_args['category'] = 'accessibility';
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

			// Store plugin info.
			$this->plugin_info[ $block_type ] = $plugin_info;

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

		// Only remove plugin info if no more checks exist for this block type.
		if ( empty( $this->checks[ $block_type ] ) ) {
			unset( $this->checks[ $block_type ] );
			unset( $this->plugin_info[ $block_type ] );
		}

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
	public function is_check_registered( string $block_type, string $check_name ): bool {
		return isset( $this->checks[ $block_type ][ $check_name ] );
	}

	/**
	 * Get configuration for a specific check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_check_config( string $block_type, string $check_name ): ?array {
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
	public function get_registered_block_types(): array {
		return \array_keys( $this->checks );
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

		// If the setting exists in options, return it (including 'none').
		// Only default to 'error' if the setting has never been configured.
		if ( isset( $options[ $field_name ] ) ) {
			$value = $options[ $field_name ];
			// Validate that the stored value is one of the valid options.
			if ( in_array( $value, array( 'error', 'warning', 'none' ), true ) ) {
				return $value;
			}
		}

		// Default to 'error' only for unconfigured checks.
		return 'error';
	}

	/**
	 * Get setting for external blocks
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return string The check level.
	 */
	private function get_external_block_setting( string $block_type, string $check_name ): string {
		// Use stored plugin info if available, fallback to extraction from block type.
		$plugin_info = $this->plugin_info[ $block_type ] ?? array();

		if ( empty( $plugin_info['slug'] ) ) {
			$plugin_info = $this->extract_plugin_info_from_block_type( $block_type );
		}

		$plugin_slug = $plugin_info['slug'];
		$option_name = 'block_checks_external_' . $plugin_slug;
		$options     = \get_option( $option_name, array() );

		$field_name = $block_type . '_' . $check_name;

		// If the setting exists in options, return it (including 'none').
		// Only default to 'error' if the setting has never been configured.
		if ( isset( $options[ $field_name ] ) ) {
			$value = $options[ $field_name ];
			// Validate that the stored value is one of the valid options.
			if ( in_array( $value, array( 'error', 'warning', 'none' ), true ) ) {
				return $value;
			}
		}

		// Default to 'error' only for unconfigured checks.
		return 'error';
	}

	/**
	 * Get all plugin information
	 *
	 * @return array All plugin information indexed by block type.
	 */
	public function get_all_plugin_info(): array {
		return $this->plugin_info;
	}

	/**
	 * Register a check with automatic plugin detection
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_check_with_plugin_detection( string $block_type, string $check_name, array $check_args ): bool {
		// Automatically detect plugin information.
		$plugin_info = $this->detect_plugin_info();

		return $this->register_check( $block_type, $check_name, $check_args, $plugin_info );
	}

	/**
	 * Detect plugin information from the current context
	 *
	 * @return array Plugin information array.
	 */
	private function detect_plugin_info(): array {
		// Get the calling file to determine which plugin is registering the check.
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
		$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 10 );

		foreach ( $backtrace as $trace ) {
			if ( isset( $trace['file'] ) && strpos( $trace['file'], WP_PLUGIN_DIR ) === 0 ) {
				$plugin_file = $trace['file'];

				// Skip if this is the Block Accessibility Checks plugin itself.
				if ( strpos( $plugin_file, 'block-accessibility-checks' ) !== false ) {
					continue;
				}

				// Find the main plugin file.
				$plugin_file = $this->find_main_plugin_file( $plugin_file );

				if ( $plugin_file ) {
					// Check if we already have this plugin info cached.
					if ( isset( $this->plugin_info_cache[ $plugin_file ] ) ) {
						return $this->plugin_info_cache[ $plugin_file ];
					}

					// Get plugin data and cache it.
					if ( $this->ensure_plugin_data_function() ) {
						$plugin_data = \get_plugin_data( $plugin_file );

						$plugin_info = array(
							'name'    => $plugin_data['Name'] ?? '',
							'version' => $plugin_data['Version'] ?? '',
							'file'    => $plugin_file,
							'slug'    => \sanitize_title( $plugin_data['Name'] ?? '' ),
						);

						// Cache the plugin info.
						$this->plugin_info_cache[ $plugin_file ] = $plugin_info;

						return $plugin_info;
					}
				}
			}
		}

		// Return empty plugin info if detection fails.
		return array(
			'name'    => '',
			'version' => '',
			'file'    => '',
			'slug'    => '',
		);
	}

	/**
	 * Ensure get_plugin_data function is available
	 *
	 * Loads the required WordPress file if the function doesn't exist.
	 *
	 * @return bool True if function is available, false otherwise.
	 */
	private function ensure_plugin_data_function(): bool {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			if ( defined( 'ABSPATH' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}
		}
		return function_exists( 'get_plugin_data' );
	}

	/**
	 * Find a plugin file in a specific directory
	 *
	 * Searches for PHP files with valid plugin headers in the given directory.
	 *
	 * @param string $dir The directory to search in.
	 * @return string|false The plugin file path or false if not found.
	 */
	private function find_plugin_file_in_directory( string $dir ): string|false {
		if ( ! $this->ensure_plugin_data_function() ) {
			return false;
		}

		$plugin_files = glob( $dir . '/*.php' );
		if ( false === $plugin_files ) {
			return false;
		}

		foreach ( $plugin_files as $plugin_file ) {
			$plugin_data = \get_plugin_data( $plugin_file );
			if ( ! empty( $plugin_data['Name'] ) ) {
				return $plugin_file;
			}
		}

		return false;
	}

	/**
	 * Find the main plugin file from a given file path
	 *
	 * @param string $file_path The file path to start from.
	 * @return string|false The main plugin file path or false if not found.
	 */
	private function find_main_plugin_file( string $file_path ): string|false {
		$dir = dirname( $file_path );

		// Look for plugin files in the current directory.
		$plugin_file = $this->find_plugin_file_in_directory( $dir );
		if ( false !== $plugin_file ) {
			return $plugin_file;
		}

		// If not found in current directory, try parent directory.
		$parent_dir = dirname( $dir );
		if ( $parent_dir !== $dir && strpos( $parent_dir, WP_PLUGIN_DIR ) === 0 ) {
			$plugin_file = $this->find_plugin_file_in_directory( $parent_dir );
			if ( false !== $plugin_file ) {
				return $plugin_file;
			}
		}

		// If still not found, try searching up the directory tree until we reach WP_PLUGIN_DIR.
		$current_dir = $dir;
		while ( WP_PLUGIN_DIR !== $current_dir && strpos( $current_dir, WP_PLUGIN_DIR ) === 0 ) {
			$current_dir = dirname( $current_dir );

			$plugin_file = $this->find_plugin_file_in_directory( $current_dir );
			if ( false !== $plugin_file ) {
				return $plugin_file;
			}
		}

		return false;
	}

	/**
	 * Extract plugin information from block type
	 *
	 * Derives plugin name and slug from the block type namespace.
	 * This ensures all blocks from the same plugin share the same slug
	 * and are properly grouped together in settings and menus.
	 *
	 * @param string $block_type The block type (e.g., 'myplugin/my-block').
	 * @return array Plugin information with 'name' and 'slug' keys.
	 */
	public function extract_plugin_info_from_block_type( string $block_type ): array {
		$parts     = explode( '/', $block_type );
		$namespace = $parts[0] ?? '';

		// Convert namespace to readable name.
		$plugin_name = ucwords( str_replace( array( '-', '_' ), ' ', $namespace ) );

		// Create a slug for the plugin using only the namespace.
		// This ensures all blocks from the same plugin share the same slug.
		$plugin_slug = \sanitize_title( $namespace );

		return array(
			'name' => $plugin_name,
			'slug' => $plugin_slug,
		);
	}
}
