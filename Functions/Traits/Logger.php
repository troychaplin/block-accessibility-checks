<?php
/**
 * Logger Trait
 *
 * Provides shared logging functionality for debug and error messages
 * when WP_DEBUG is enabled.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility\Traits;

/**
 * Logger Trait
 *
 * Shared logging methods for classes that need to log debug and error messages.
 * Automatically includes the class name in log messages.
 */
trait Logger {

	/**
	 * Log error messages when WP_DEBUG is enabled
	 *
	 * @param string $message Error message to log.
	 * @return void
	 */
	private function log_error( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) ) {
			$class_name = basename( str_replace( '\\', '/', static::class ) );
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( "Block Accessibility Checks - {$class_name}: {$message}" );
		}
	}

	/**
	 * Log debug messages when WP_DEBUG and WP_DEBUG_LOG are enabled
	 *
	 * @param string $message Debug message to log.
	 * @return void
	 */
	private function log_debug( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) && defined( 'WP_DEBUG_LOG' ) && constant( 'WP_DEBUG_LOG' ) ) {
			$class_name = basename( str_replace( '\\', '/', static::class ) );
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( "Block Accessibility Checks - {$class_name} DEBUG: {$message}" );
		}
	}
}
