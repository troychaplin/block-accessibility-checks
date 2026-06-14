<?php
/**
 * Level Override Filter
 *
 * Applies saved severity-level overrides to validation checks via the
 * ba11yc_check_level filter hook.
 *
 * @package BlockAccessibilityChecks
 * @since   4.0.0
 */

namespace BlockAccessibility\Filter;

use BlockAccessibility\Rest\SettingsController;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Applies saved severity-level overrides from the ba11yc_settings option.
 */
class LevelOverride {

	/**
	 * Cached settings from wp_options, loaded lazily.
	 *
	 * @var array|null
	 */
	private $options = null;

	/**
	 * Register the filter hook.
	 *
	 * @return void
	 */
	public function register(): void {
		add_filter( 'ba11yc_check_level', array( $this, 'apply_override' ), 10, 2 );
	}

	/**
	 * Apply saved level overrides from wp_options.
	 *
	 * @param string $level   The current (registered) check level.
	 * @param array  $context The check context with scope-specific keys.
	 * @return string The overridden level, or the original if no override exists.
	 */
	public function apply_override( $level, $context ) {
		if ( null === $this->options ) {
			$this->options = get_option( SettingsController::OPTION_KEY, array() );
		}

		$options  = $this->options;
		$scope    = $context['scope'] ?? '';
		$override = null;

		switch ( $scope ) {
			case 'block':
				$override = $options['block'][ $context['block_type'] ][ $context['check_name'] ] ?? null;
				break;

			case 'meta':
				$override = $options['meta'][ $context['post_type'] ][ $context['meta_key'] ][ $context['check_name'] ] ?? null;
				break;

			case 'editor':
				$override = $options['editor'][ $context['post_type'] ][ $context['check_name'] ] ?? null;
				break;
		}

		return $override ?? $level;
	}
}
