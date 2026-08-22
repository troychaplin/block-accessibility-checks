<?php
/**
 * Abstract Validation Registry
 *
 * Base class shared by the scope-specific registries (Block, Meta, Editor).
 * Provides shared helpers for check normalization, namespace stamping, priority
 * sorting, and application of the ba11yc_check_level filter.
 *
 * Subclasses retain their own storage shape, public registration signature,
 * and scope-specific filter/action hook names.
 *
 * @package BlockAccessibilityChecks
 * @since 4.0.0
 */

namespace BlockAccessibility;

use BlockAccessibility\Core\Traits\Logger;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Abstract Validation Registry Class
 *
 * Shared behavior for scope-specific check registries. Not a public API —
 * the concrete subclasses (Block\Registry, Meta\Registry, Editor\Registry)
 * are the public surface.
 */
abstract class AbstractRegistry {

	use Logger;

	/**
	 * Default arguments applied to every check at registration time.
	 *
	 * Declared without a visibility modifier for PHP 7.0 compatibility
	 * (constant visibility modifiers require PHP 7.1+).
	 *
	 * @var array
	 */
	const DEFAULTS = array(
		'title'        => '',
		'error_msg'    => '',
		'warning_msg'  => '',
		'level'        => 'error',
		'category'     => 'accessibility',
		'priority'     => 10,
		'enabled'      => true,
		'description'  => '',
		'configurable' => true,
	);

	/**
	 * Display names declared for check namespaces, keyed by namespace slug.
	 *
	 * Static so the three scope registries (Block, Meta, Editor) share one map:
	 * a plugin declares its name once and every check it registers is credited
	 * to it, whichever scope those checks belong to.
	 *
	 * @var array
	 */
	private static $namespace_titles = array();

	/**
	 * Declare the display name for a check namespace.
	 *
	 * Lets a plugin name itself once instead of repeating the name on every
	 * check it registers.
	 *
	 * @param string $namespace_slug Namespace slug used by the plugin's checks.
	 * @param array  $args           Accepts a 'title' key.
	 * @return bool True when a title was stored.
	 */
	public static function register_namespace( string $namespace_slug, array $args ): bool {
		if ( '' === $namespace_slug ) {
			return false;
		}

		$title = isset( $args['title'] ) ? (string) $args['title'] : '';
		if ( '' === $title ) {
			return false;
		}

		self::$namespace_titles[ $namespace_slug ] = $title;

		return true;
	}

	/**
	 * Resolve the display name for a namespace.
	 *
	 * Deliberately resolved on read rather than stamped at registration time:
	 * a plugin's namespace declaration and its checks are both registered on
	 * `ba11yc_ready`, and callers cannot be expected to order the two.
	 *
	 * @param string $namespace_slug Namespace slug.
	 * @return string The declared title, or an empty string when none was declared.
	 */
	public static function get_namespace_title( string $namespace_slug ): string {
		return self::$namespace_titles[ $namespace_slug ] ?? '';
	}

	/**
	 * Severity levels accepted by the framework.
	 *
	 * @var array
	 */
	const VALID_LEVELS = array( 'error', 'warning', 'none' );

	/**
	 * Categories accepted by the framework (label/filter only).
	 *
	 * @var array
	 */
	const VALID_CATEGORIES = array( 'accessibility', 'validation' );

	/**
	 * Normalize and validate check arguments.
	 *
	 * Applies defaults, enforces required fields (error_msg), falls back
	 * warning_msg to error_msg, validates level/category, and coerces
	 * non-numeric priority to the default.
	 *
	 * @param array  $check_args    Raw arguments passed by the caller.
	 * @param string $context_label Human-readable identifier for log messages (e.g. "core/image/alt_text").
	 * @return array|false Normalized args on success, false if required fields are missing.
	 */
	protected function normalize_args( array $check_args, string $context_label ) {
		$check_args = \wp_parse_args( $check_args, self::DEFAULTS );

		// error_msg is required.
		if ( empty( $check_args['error_msg'] ) ) {
			$this->log_error( "error_msg is required for {$context_label}" );
			return false;
		}

		// Fall back warning_msg to error_msg.
		if ( empty( $check_args['warning_msg'] ) ) {
			$check_args['warning_msg'] = $check_args['error_msg'];
		}

		// Validate level.
		if ( ! in_array( $check_args['level'], self::VALID_LEVELS, true ) ) {
			$this->log_error( "Invalid level '{$check_args['level']}' for {$context_label}. Using 'error'." );
			$check_args['level'] = 'error';
		}

		// Validate category.
		if ( ! in_array( $check_args['category'], self::VALID_CATEGORIES, true ) ) {
			$this->log_error( "Invalid category '{$check_args['category']}' for {$context_label}. Using 'accessibility'." );
			$check_args['category'] = 'accessibility';
		}

		// Coerce configurable to bool.
		$check_args['configurable'] = (bool) $check_args['configurable'];

		// Validate priority.
		if ( ! is_numeric( $check_args['priority'] ) ) {
			$this->log_error( "Invalid priority '{$check_args['priority']}' for {$context_label}. Using 10." );
			$check_args['priority'] = 10;
		}

		return $check_args;
	}

	/**
	 * Stamp the public `namespace` arg into the internal `_namespace` key.
	 *
	 * The public arg is removed so downstream consumers don't see duplicate keys.
	 *
	 * @param array $check_args The check args.
	 * @return array Modified check args.
	 */
	protected function stamp_namespace( array $check_args ): array {
		if ( ! empty( $check_args['namespace'] ) ) {
			$check_args['_namespace'] = $check_args['namespace'];
			unset( $check_args['namespace'] );
		}
		return $check_args;
	}

	/**
	 * Sort a flat check-list array in place by priority ascending.
	 *
	 * @param array $checks Reference to the associative array of checks to sort.
	 * @return void
	 */
	protected function sort_by_priority( array &$checks ): void {
		\uasort(
			$checks,
			static function ( $a, $b ) {
				return $a['priority'] - $b['priority'];
			}
		);
	}

	/**
	 * Apply the ba11yc_check_level filter with a 'none' short-circuit.
	 *
	 * Checks registered at 'none' are skipped without firing the filter.
	 * The filter lets a settings consumer (see Filter\LevelOverride) override
	 * the effective level at runtime.
	 *
	 * @param string $registered_level The level as registered.
	 * @param array  $context          Scope-specific context passed to consumers of the filter.
	 * @return string The effective level ('error', 'warning', 'none').
	 */
	protected function apply_level_filter( string $registered_level, array $context ): string {
		if ( 'none' === $registered_level ) {
			return 'none';
		}

		return \apply_filters( 'ba11yc_check_level', $registered_level, $context );
	}
}
