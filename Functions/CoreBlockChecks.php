<?php
/**
 * Core Block Checks
 *
 * Manages accessibility checks for WordPress core blocks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Core Block Checks Class
 *
 * Handles registration and configuration of accessibility checks for WordPress core blocks.
 */
class CoreBlockChecks {

	/**
	 * Registry instance
	 *
	 * @var BlockChecksRegistry
	 */
	private $registry;

	/**
	 * Cached core block check definitions
	 *
	 * @var array|null
	 */
	private $definitions_cache = null;

	/**
	 * Constructor
	 *
	 * @param BlockChecksRegistry $registry The registry instance.
	 */
	public function __construct( BlockChecksRegistry $registry ) {
		$this->registry = $registry;
	}

	/**
	 * Register default accessibility checks
	 *
	 * Sets up the default accessibility checks for various core blocks
	 * including image alt text validation and button text quality checks.
	 *
	 * @return void
	 */
	public function register_default_checks(): void {
		// Allow developers to prevent default checks from being registered.
		if ( ! \apply_filters( 'ba11yc_register_default_checks', true ) ) {
			return;
		}

		// Get core block check configurations and register them.
		$core_checks = $this->get_core_block_check_definitions();

		foreach ( $core_checks as $block_type => $checks ) {
			foreach ( $checks as $check_name => $check_config ) {
				$this->registry->register_check( $block_type, $check_name, $check_config );
			}
		}

		// Hook for developers to register additional checks.
		\do_action( 'ba11yc_register_checks', $this->registry );
	}

	/**
	 * Get core block check definitions
	 *
	 * Private method containing the actual check definitions.
	 * This is the single source of truth for all core block checks.
	 * Results are cached after first call for performance.
	 *
	 * @return array Array of core block check configurations.
	 */
	private function get_core_block_check_definitions(): array {
		// Return cached definitions if available.
		if ( null !== $this->definitions_cache ) {
			return $this->definitions_cache;
		}

		// Build and cache the definitions array.
		$this->definitions_cache = array(
			'core/button'  => array(
				'check_button_link' => array(
					'error_msg'   => \__( 'Buttons are required to have a valid link', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Adding a link to a button is highly recommended', 'block-accessibility-checks' ),
					'description' => \__( 'Buttons require a link', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 5,
				),
				'check_button_text' => array(
					'error_msg'   => \__( 'Button text is required and should be descriptive and meaningful', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Adding text to a button is highly recommended', 'block-accessibility-checks' ),
					'description' => \__( 'Buttons require descriptive text', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 10,
				),
			),
			'core/image'   => array(
				'check_image_alt_text'          => array(
					'error_msg'   => \__( 'Images are required to have alternative text', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Using alt text is highly recommended', 'block-accessibility-checks' ),
					'description' => \__( 'Images require alternative text', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 5,
				),
				'check_image_alt_text_length'   => array(
					'error_msg'   => \__( 'Image alt text cannot be longer than 125 characters', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Image alt text is recommended to be less than 125 characters', 'block-accessibility-checks' ),
					'description' => \__( 'Length of alt text should not exceed 125 characters', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 10,
				),
				'check_image_alt_caption_match' => array(
					'error_msg'   => \__( 'Image caption cannot be the same as the alternative text', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Using different alt and caption text is highly recommended', 'block-accessibility-checks' ),
					'description' => \__( 'Alt text and caption text must not match', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 10,
				),
				'check_image_alt_text_patterns' => array(
					'error_msg'   => \__( 'Alt text contains non-descriptive single words or patterns like "image of", "picture of", or "photo of"', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Consider using more descriptive alt text instead of generic terms', 'block-accessibility-checks' ),
					'description' => \__( 'Alt text should avoid generic patterns and be descriptive', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 15,
				),
			),
			'core/table'   => array(
				'check_table_headers' => array(
					'error_msg'   => \__( 'Tables are required to use a header row', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Using headers in tables is highly recommended', 'block-accessibility-checks' ),
					'description' => \__( 'Tables are required to use a header row', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 5,
				),
			),
			'core/heading' => array(
				'check_heading_first_level' => array(
					'error_msg'   => \__( 'The first heading should either be H1 or H2, depending on the available heading levels', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Using H1 or H2 as the first heading improves document structure', 'block-accessibility-checks' ),
					'description' => \__( 'First heading should be H1 or H2, depending on the available heading levels', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 5,
				),
				'check_heading_rank'        => array(
					'error_msg'   => \__( 'Heading levels should not skip ranks (e.g., H2 followed by H4)', 'block-accessibility-checks' ),
					'warning_msg' => \__( 'Maintaining proper heading hierarchy improves document structure', 'block-accessibility-checks' ),
					'description' => \__( 'Headings should follow a logical hierarchy without skipping levels', 'block-accessibility-checks' ),
					'type'        => 'settings',
					'category'    => 'accessibility',
					'priority'    => 10,
				),
			),
		);

		return $this->definitions_cache;
	}

	/**
	 * Get supported core block types
	 *
	 * Returns an array of core block types that have accessibility checks.
	 * Derived dynamically from the check definitions for single source of truth.
	 *
	 * @return array Array of supported core block types.
	 */
	public function get_supported_core_block_types(): array {
		return \array_keys( $this->get_core_block_check_definitions() );
	}

	/**
	 * Check if a block type is a supported core block
	 *
	 * @param string $block_type The block type to check.
	 * @return bool True if it's a supported core block, false otherwise.
	 */
	public function is_supported_core_block( string $block_type ): bool {
		return in_array( $block_type, $this->get_supported_core_block_types(), true );
	}

	/**
	 * Get check configuration for a specific core block check
	 *
	 * @param string $block_type The block type.
	 * @param string $check_name The check name.
	 * @return array|null The check configuration or null if not found.
	 */
	public function get_core_block_check_config( string $block_type, string $check_name ): ?array {
		$definitions = $this->get_core_block_check_definitions();

		return $definitions[ $block_type ][ $check_name ] ?? null;
	}

	/**
	 * Get all checks for a specific core block type
	 *
	 * @param string $block_type The block type.
	 * @return array Array of checks for the block type or empty array if not found.
	 */
	public function get_core_block_checks( string $block_type ): array {
		$definitions = $this->get_core_block_check_definitions();

		return $definitions[ $block_type ] ?? array();
	}
}
