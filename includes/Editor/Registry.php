<?php
/**
 * Editor Checks Registry
 *
 * Central registry for managing general editor (document-level) validation checks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.4.0
 */

namespace BlockAccessibility\Editor;

use BlockAccessibility\AbstractRegistry;

/**
 * Editor Checks Registry Class
 *
 * Manages registration and execution of validation checks for the general editor
 * state (e.g. document structure, post title).
 */
class Registry extends AbstractRegistry {

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
	private function __construct() {}

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
			if ( empty( $post_type ) ) {
				$this->log_error( "Invalid post type provided: {$post_type}" );
				return false;
			}

			if ( empty( $check_name ) ) {
				$this->log_error( "Invalid check name provided: {$check_name}" );
				return false;
			}

			$context_label = "{$post_type}/{$check_name}";
			$check_args    = $this->normalize_args( $check_args, $context_label );

			if ( false === $check_args ) {
				return false;
			}

			// Allow developers to filter check arguments before registration.
			$check_args = \apply_filters( 'ba11yc_editor_check_args', $check_args, $post_type, $check_name );

			// Allow developers to prevent specific checks from being registered.
			if ( ! \apply_filters( 'ba11yc_should_register_editor_check', true, $post_type, $check_name, $check_args ) ) {
				$this->log_debug( "Editor check registration prevented by filter: {$context_label}" );
				return false;
			}

			if ( ! isset( $this->editor_checks[ $post_type ] ) ) {
				$this->editor_checks[ $post_type ] = array();
			}

			$check_args = $this->stamp_namespace( $check_args );

			$this->editor_checks[ $post_type ][ $check_name ] = $check_args;

			$this->sort_by_priority( $this->editor_checks[ $post_type ] );

			\do_action( 'ba11yc_editor_check_registered', $post_type, $check_name, $check_args );

			$this->log_debug( "Successfully registered editor check: {$context_label}" );
			return true;

		} catch ( \Exception $e ) {
			$this->log_error( "Error registering editor check {$post_type}/{$check_name}: " . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Register an editor check for multiple post types
	 *
	 * @param array  $post_types Array of post types.
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return array Results keyed by post type.
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
	 * @param string $post_type  The post type.
	 * @param string $check_name The check name.
	 * @return string The effective check level ('error', 'warning', 'none').
	 */
	public function get_effective_editor_check_level( string $post_type, string $check_name ): string {
		$editor_checks = $this->get_editor_checks( $post_type );

		if ( ! isset( $editor_checks[ $check_name ] ) ) {
			return 'none';
		}

		$registered_level = $editor_checks[ $check_name ]['level'] ?? 'error';

		return $this->apply_level_filter(
			$registered_level,
			array(
				'scope'      => 'editor',
				'post_type'  => $post_type,
				'check_name' => $check_name,
			)
		);
	}
}
