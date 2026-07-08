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

use BlockAccessibility\AbstractRegistry;

/**
 * Block Checks Registry Class
 *
 * Manages registration and execution of accessibility checks for different block types.
 * Delegates core block check registration to CoreChecks for separation of concerns.
 */
class Registry extends AbstractRegistry {

	/**
	 * Registered checks
	 *
	 * @var array
	 */
	private $checks = array();

	/**
	 * Registry instance
	 *
	 * @var Registry|null
	 */
	private static $instance = null;

	/**
	 * Core block checks instance
	 *
	 * @var CoreChecks|null
	 */
	private $core_block_checks = null;

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
		$this->init_core_block_checks();
	}

	/**
	 * Initialize core block checks
	 *
	 * @return void
	 */
	private function init_core_block_checks(): void {
		// Allow developers to prevent default checks from being registered.
		if ( ! \apply_filters( 'ba11yc_register_default_checks', true ) ) {
			return;
		}

		$this->core_block_checks = new CoreChecks( $this );
		$this->core_block_checks->register_default_checks();
	}

	/**
	 * Register a new accessibility check
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration. Recognized keys: namespace, error_msg,
	 *                           warning_msg, level (error|warning|none), category, priority,
	 *                           enabled, description, configurable.
	 * @return bool True on success, false on failure.
	 */
	public function register_check( string $block_type, string $check_name, array $check_args ): bool {
		try {
			if ( empty( $block_type ) ) {
				$this->log_error( "Invalid block type provided: {$block_type}" );
				return false;
			}

			if ( empty( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			$context_label = "{$block_type}/{$check_name}";
			$check_args    = $this->normalize_args( $check_args, $context_label );

			if ( false === $check_args ) {
				return false;
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'ba11yc_check_args', $check_args, $block_type, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'ba11yc_should_register_check', true, $block_type, $check_name, $check_args ) ) {
				$this->log_debug( "Check registration prevented by filter: {$context_label}" );
				return false;
			}

			if ( isset( $this->checks[ $block_type ][ $check_name ] ) ) {
				$this->log_debug( "Overriding existing check: {$context_label}" );
			}

			if ( ! isset( $this->checks[ $block_type ] ) ) {
				$this->checks[ $block_type ] = array();
			}

			$check_args = $this->stamp_namespace( $check_args );

			$this->checks[ $block_type ][ $check_name ] = $check_args;

			$this->sort_by_priority( $this->checks[ $block_type ] );

			// Action hook for developers to know when a check is registered.
			\do_action( 'ba11yc_check_registered', $block_type, $check_name, $check_args );

			$this->log_debug( "Successfully registered check: {$context_label}" );
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

		if ( empty( $this->checks[ $block_type ] ) ) {
			unset( $this->checks[ $block_type ] );
		}

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
	 * Get the effective check level for a specific check
	 *
	 * Passes the registered level through the ba11yc_check_level filter, allowing
	 * the settings layer (Filter\LevelOverride) to override the level at runtime.
	 * Checks set to 'none' are skipped without firing the filter.
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

		$registered_level = $checks[ $check_name ]['level'] ?? 'error';

		return $this->apply_level_filter(
			$registered_level,
			array(
				'scope'      => 'block',
				'block_type' => $block_type,
				'check_name' => $check_name,
			)
		);
	}
}
