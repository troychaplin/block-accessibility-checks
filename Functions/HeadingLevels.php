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
	 * Constructor for the HeadingLevels class.
	 *
	 * Initializes the class and sets up any necessary properties or functionality.
	 */
	public function __construct() {
		add_filter( 'register_block_type_args', array( $this, 'modify_core_heading_levels' ), 10, 2 );
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
	 * @param object $block_type The block type object being processed.
	 *
	 * @return array Modified arguments for the block.
	 */
	public function modify_core_heading_levels( $args, $block_type ) {
		if ( 'core/heading' !== $block_type ) {
			return $args;
		}

		$options           = get_option( 'block_checks_options' );
		$restricted_levels = isset( $options['core_heading_levels'] ) ? $options['core_heading_levels'] : array( 'h1' );

		// Create array of available levels (1-6).
		$available_levels = range( 1, 6 );

		// Remove restricted levels.
		foreach ( $restricted_levels as $level ) {
			$level_num = intval( substr( $level, 1 ) );
			$key       = array_search( $level_num, $available_levels, true );
			if ( false !== $key ) {
				unset( $available_levels[ $key ] );
			}
		}

		// Return the available levels as an array of strings (h1-h6).
		$available_levels = array_values( $available_levels );

		// Set the available levels.
		$args['attributes']['level']['default'] = reset( $available_levels ) ? reset( $available_levels ) : 2;
		$args['attributes']['levelOptions']     = array( 'default' => $available_levels );

		return $args;
	}
}
