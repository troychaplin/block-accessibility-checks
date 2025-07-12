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
	 * Initializes the class and sets up any necessary properties or functionality.
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
	private function get_options() {
		if ( null === $this->cached_options ) {
			$this->cached_options = get_option( 'block_checks_options', array() );
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
	public function modify_heading_levels_globally( $args, $block_type ) {
		// Only proceed if the current block is a Heading block.
		if ( 'core/heading' !== $block_type ) {
			return $args;
		}

		$options           = $this->get_options();
		$restricted_levels = isset( $options['core_heading_levels'] ) ? $options['core_heading_levels'] : array();

		// If no restrictions, return original args.
		if ( empty( $restricted_levels ) ) {
			return $args;
		}

		// Create array of available levels (1-6).
		$available_levels = range( 1, 6 );

		// Remove restricted levels.
		foreach ( $restricted_levels as $level ) {
			// Validate that the level is in the expected format (h1, h2, etc.).
			if ( ! is_string( $level ) || ! preg_match( '/^h[1-6]$/', $level ) ) {
				continue; // Skip invalid levels.
			}

			$level_num = intval( substr( $level, 1 ) );
			$key       = array_search( $level_num, $available_levels, true );
			if ( false !== $key ) {
				unset( $available_levels[ $key ] );
			}
		}

		// Reindex the array and ensure we have at least one level.
		$available_levels = array_values( $available_levels );
		if ( empty( $available_levels ) ) {
			$available_levels = array( 2 ); // Default to H2 if all levels are restricted.
		}

		// Set the available levels using the levelOptions attribute - exactly as per WordPress docs.
		$args['attributes']['levelOptions']['default'] = $available_levels;

		return $args;
	}
}
