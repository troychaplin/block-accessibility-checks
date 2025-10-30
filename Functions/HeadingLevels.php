<?php
/**
 * Namespace declaration for the Block Accessibility plugin.
 *
 * This namespace is used to encapsulate all functionality related to
 * accessibility checks for blocks within the WordPress plugin.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility;

/**
 * Class HeadingLevels
 *
 * This class is responsible for managing and validating heading levels
 * within the context of accessibility checks for WordPress blocks.
 *
 * IMPORTANT: This service must be initialized before the WordPress 'init' hook
 * to ensure the 'register_block_type_args' filter is registered early enough.
 * The PluginInitializer handles this timing automatically by initializing this
 * service in its constructor.
 *
 * @package BlockAccessibilityChecks
 */
class HeadingLevels {

	/**
	 * Cached options to avoid repeated database calls.
	 *
	 * @var array|null
	 */
	private $cached_options = null;

	/**
	 * Constructor for the HeadingLevels class.
	 *
	 * Registers the 'register_block_type_args' filter immediately to ensure it's
	 * active before blocks are registered. This constructor is called by
	 * PluginInitializer before the 'init' hook to maintain proper timing.
	 */
	public function __construct() {
		// Add the filter immediately - don't wait for any hooks.
		add_filter( 'register_block_type_args', array( $this, 'modify_heading_levels_globally' ), 10, 2 );
	}

	/**
	 * Get the cached options or retrieve them from database.
	 *
	 * @return array The plugin options.
	 */
	private function get_options(): array {
		if ( null === $this->cached_options ) {
			try {
				$this->cached_options = \get_option( 'block_checks_options', array() );

				// Validate the options structure.
				if ( ! is_array( $this->cached_options ) ) {
					$this->log_error( 'Plugin options are not in expected array format. Resetting to defaults.' );
					$this->cached_options = array();
				}
			} catch ( \Exception $e ) {
				$this->log_error( 'Failed to retrieve plugin options: ' . $e->getMessage() );
				$this->cached_options = array();
			}
		}
		return $this->cached_options;
	}

	/**
	 * Modifies the arguments for core heading blocks to adjust their levels.
	 *
	 * This function is a filter callback that allows customization of the
	 * arguments passed to core heading blocks. It can be used to enforce
	 * accessibility standards or other requirements by modifying the heading
	 * levels dynamically.
	 *
	 * @param array  $args       The arguments for the block, including attributes.
	 * @param string $block_type The block type being processed.
	 *
	 * @return array Modified arguments for the block.
	 */
	public function modify_heading_levels_globally( array $args, string $block_type ): array {
		// Early return with error handling.
		if ( 'core/heading' !== $block_type ) {
			return $args;
		}

		try {
			$options           = $this->get_options();
			$restricted_levels = isset( $options['core_heading_levels'] ) ? $options['core_heading_levels'] : array();

			// Validate restricted levels data.
			if ( ! is_array( $restricted_levels ) ) {
				$this->log_error( 'Restricted heading levels setting is not an array. Ignoring restrictions.' );
				return $args;
			}

			// If no restrictions, return original args.
			if ( empty( $restricted_levels ) ) {
				return $args;
			}

			// Create array of available levels (1-6).
			$available_levels = range( 1, 6 );

			// Remove restricted levels with validation.
			// Only allow removal of H1, H5, and H6 levels.
			$allowed_restricted_levels = array( 'h1', 'h5', 'h6' );
			foreach ( $restricted_levels as $level ) {
				if ( ! is_string( $level ) || ! preg_match( '/^h[1-6]$/', $level ) ) {
					$this->log_error( "Invalid heading level format: {$level}. Expected format: h1-h6." );
					continue;
				}

				// Only allow restriction of H1, H5, and H6.
				if ( ! in_array( $level, $allowed_restricted_levels, true ) ) {
					$this->log_debug( "Skipping restriction of {$level}. Only H1, H5, and H6 can be restricted." );
					continue;
				}

				$level_num = intval( substr( $level, 1 ) );
				$key       = array_search( $level_num, $available_levels, true );
				if ( false !== $key ) {
					unset( $available_levels[ $key ] );
				}
			}

			// Reindex and ensure we have at least one level.
			$available_levels = array_values( $available_levels );
			if ( empty( $available_levels ) ) {
				$this->log_error( 'All heading levels were restricted. Defaulting to H2 only.' );
				$available_levels = array( 2 );
			}

			// Safely set the levelOptions attribute.
			if ( ! isset( $args['attributes'] ) ) {
				$args['attributes'] = array();
			}
			if ( ! isset( $args['attributes']['levelOptions'] ) ) {
				$args['attributes']['levelOptions'] = array();
			}

			$args['attributes']['levelOptions']['default'] = $available_levels;

		} catch ( \Exception $e ) {
			$this->log_error( 'Error in modify_heading_levels_globally: ' . $e->getMessage() );
			// Return original args on error to prevent breaking the editor.
			return $args;
		}

		return $args;
	}

	/**
	 * Log error messages when WP_DEBUG is enabled.
	 *
	 * @param string $message Error message to log.
	 * @return void
	 */
	private function log_error( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( 'Block Accessibility Checks - HeadingLevels: ' . $message );
		}
	}

	/**
	 * Log debug messages when WP_DEBUG is enabled.
	 *
	 * @param string $message Debug message to log.
	 * @return void
	 */
	private function log_debug( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( 'Block Accessibility Checks - HeadingLevels DEBUG: ' . $message );
		}
	}
}
