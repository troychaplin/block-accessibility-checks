<?php
/**
 * Namespace declaration for the BlockAccessibility plugin.
 *
 * This namespace is used to encapsulate all the functionality
 * related to the Block Accessibility Checks plugin, ensuring
 * that class and function names do not conflict with other
 * parts of the WordPress ecosystem or other plugins.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility;

/**
 * Class BlockConfig
 *
 * This class is responsible for managing the configuration of blocks
 * within the Block Accessibility Checks plugin. It provides methods
 * and properties to handle block-specific settings and functionality.
 *
 * @package BlockAccessibilityChecks
 */
class BlockConfig {

	/**
	 * Holds the singleton instance of BlockConfig.
	 *
	 * @var BlockConfig|null
	 */
	private static $instance = null;

	/**
	 * Holds the block configuration array.
	 *
	 * @var array|null
	 */
	private $block_config = null;

	/**
	 * Private constructor to prevent multiple instances.
	 */
	private function __construct() {
		// Initialize the block configuration once.
		$this->block_config = array(
			array(
				'function_name' => 'render_core_button_options',
				'option_name'   => 'core_button_block_check',
				'block_label'   => esc_html__( 'Button', 'block-accessibility-checks' ),
			),
			array(
				'function_name' => 'render_core_heading_options',
				'option_name'   => 'core_heading_levels',
				'block_label'   => esc_html__( 'Heading', 'block-accessibility-checks' ),
			),
			array(
				'function_name' => 'render_core_image_options',
				'option_name'   => 'core_image_block_check',
				'block_label'   => esc_html__( 'Image', 'block-accessibility-checks' ),
			),
			array(
				'function_name' => 'render_core_table_options',
				'option_name'   => 'core_table_block_check',
				'block_label'   => esc_html__( 'Table', 'block-accessibility-checks' ),
			),
		);
	}

	/**
	 * Retrieves the singleton instance of the BlockConfig class.
	 *
	 * @return BlockConfig The singleton instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Retrieves the block configuration.
	 *
	 * This method returns the cached block configuration array.
	 *
	 * @return array The block configuration.
	 */
	public function get_block_config() {
		return $this->block_config;
	}
}
