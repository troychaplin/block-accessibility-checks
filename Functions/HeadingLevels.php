<?php

namespace BlockAccessibility;

class HeadingLevels {

	public function __construct() {
		add_filter( 'register_block_type_args', array( $this, 'modifyCoreHeadingLevels' ), 10, 2 );
	}

	public function modifyCoreHeadingLevels( $args, $block_type ) {
		if ( 'core/heading' !== $block_type ) {
			return $args;
		}

		$options           = get_option( 'block_checks_options' );
		$restricted_levels = isset( $options['coreHeadingLevels'] ) ? $options['coreHeadingLevels'] : array( 'h1' );

		// Create array of available levels (1-6)
		$available_levels = range( 1, 6 );

		// Remove restricted levels
		foreach ( $restricted_levels as $level ) {
			$level_num = intval( substr( $level, 1 ) );
			$key       = array_search( $level_num, $available_levels );
			if ( $key !== false ) {
				unset( $available_levels[ $key ] );
			}
		}

		// Reindex array
		$available_levels = array_values( $available_levels );

		// Set the available levels
		$args['attributes']['level']['default'] = reset( $available_levels ) ?: 2; // Default to h2 if all levels are restricted
		$args['attributes']['levelOptions']     = array( 'default' => $available_levels );

		return $args;
	}
}
