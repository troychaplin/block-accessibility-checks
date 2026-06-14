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

use BlockAccessibility\AbstractRegistry;

/**
 * Meta Checks Registry Class
 *
 * Manages registration and execution of validation checks for post meta fields.
 */
class Registry extends AbstractRegistry {

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
	private function __construct() {}

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
			if ( empty( $post_type ) ) {
				$this->log_error( "Invalid post type provided: {$post_type}" );
				return false;
			}

			if ( empty( $meta_key ) ) {
				$this->log_error( "Invalid meta key provided: {$meta_key}" );
				return false;
			}

			if ( empty( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			$context_label = "{$post_type}/{$meta_key}/{$check_name}";
			$check_args    = $this->normalize_args( $check_args, $context_label );

			if ( false === $check_args ) {
				return false;
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'ba11yc_meta_check_args', $check_args, $post_type, $meta_key, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'ba11yc_should_register_meta_check', true, $post_type, $meta_key, $check_name, $check_args ) ) {
				$this->log_debug( "Meta check registration prevented by filter: {$context_label}" );
				return false;
			}

			if ( ! isset( $this->meta_checks[ $post_type ] ) ) {
				$this->meta_checks[ $post_type ] = array();
			}

			if ( ! isset( $this->meta_checks[ $post_type ][ $meta_key ] ) ) {
				$this->meta_checks[ $post_type ][ $meta_key ] = array();
			}

			$check_args = $this->stamp_namespace( $check_args );

			$this->meta_checks[ $post_type ][ $meta_key ][ $check_name ] = $check_args;

			$this->sort_by_priority( $this->meta_checks[ $post_type ][ $meta_key ] );

			\do_action( 'ba11yc_meta_check_registered', $post_type, $meta_key, $check_name, $check_args );

			$this->log_debug( "Successfully registered meta check: {$context_label}" );
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

		$registered_level = $meta_checks[ $meta_key ][ $check_name ]['level'] ?? 'error';

		return $this->apply_level_filter(
			$registered_level,
			array(
				'scope'      => 'meta',
				'post_type'  => $post_type,
				'meta_key'   => $meta_key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- not a DB query, this is filter context data.
				'check_name' => $check_name,
			)
		);
	}
}
