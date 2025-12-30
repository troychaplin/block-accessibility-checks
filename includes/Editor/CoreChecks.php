<?php
/**
 * Core Editor Checks
 *
 * Manages editor-level validation checks for WordPress post types.
 *
 * @package BlockAccessibilityChecks
 * @since 2.4.0
 */

namespace BlockAccessibility\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Core Editor Checks Class
 *
 * Handles registration and configuration of editor-level validation checks for core post types.
 */
class CoreChecks {

	/**
	 * Registry instance
	 *
	 * @var Registry
	 */
	private $registry;

	/**
	 * Constructor
	 *
	 * @param Registry $registry The registry instance.
	 */
	public function __construct( Registry $registry ) {
		$this->registry = $registry;
	}

	/**
	 * Register default editor validation checks
	 *
	 * Sets up the default editor-level validation checks for core post types.
	 *
	 * @return void
	 */
	public function register_default_checks(): void {
		// Register post title validation for posts and pages.
		$this->register_post_title_checks();
	}

	/**
	 * Register post title validation checks
	 *
	 * Ensures that posts and pages have a title set for accessibility and SEO.
	 *
	 * @return void
	 */
	private function register_post_title_checks(): void {
		// Register for post type.
		$this->registry->register_editor_check(
			'post',
			'post_title_required',
			array(
				'error_msg'   => \__( 'A post title is required for accessibility and SEO.', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Consider adding a post title for better accessibility and SEO.', 'block-accessibility-checks' ),
				'description' => \__( 'Ensures posts have a descriptive title.', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 5,
			)
		);

		// Register for page type.
		$this->registry->register_editor_check(
			'page',
			'post_title_required',
			array(
				'error_msg'   => \__( 'A page title is required for accessibility and SEO.', 'block-accessibility-checks' ),
				'warning_msg' => \__( 'Consider adding a page title for better accessibility and SEO.', 'block-accessibility-checks' ),
				'description' => \__( 'Ensures pages have a descriptive title.', 'block-accessibility-checks' ),
				'type'        => 'settings',
				'priority'    => 5,
			)
		);
	}
}
