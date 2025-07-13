<?php
/**
 * Block Checks Registry
 *
 * Central registry for managing block accessibility checks.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility;

/**
 * Block Checks Registry Class
 *
 * Manages registration and execution of accessibility checks for different block types.
 */
class BlockChecksRegistry {

	/**
	 * Registered checks
	 *
	 * @var array
	 */
	private $checks = array();

	/**
	 * Registry instance
	 *
	 * @var BlockChecksRegistry|null
	 */
	private static $instance = null;

	/**
	 * Get registry instance
	 *
	 * @return BlockChecksRegistry
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		$this->register_default_checks();
	}

	/**
	 * Register default accessibility checks
	 */
	private function register_default_checks() {
		// Allow developers to prevent default checks from being registered.
		if ( ! \apply_filters( 'ba11yc_register_default_checks', true ) ) {
			return;
		}

		// Image block checks.
		$this->register_check(
			'core/image',
			'alt_text_length',
			array(
				'callback'    => array( $this, 'check_image_alt_length' ),
				'message'     => \__( 'Alternative text should be less than 125 characters', 'block-accessibility-checks' ),
				'type'        => 'warning',
				'priority'    => 10,
				'description' => \__( 'Screen readers may truncate very long alt text', 'block-accessibility-checks' ),
			)
		);

		$this->register_check(
			'core/image',
			'alt_caption_match',
			array(
				'callback'    => array( $this, 'check_image_alt_caption_match' ),
				'message'     => \__( 'Alternative text should not be the same as the caption', 'block-accessibility-checks' ),
				'type'        => 'warning',
				'priority'    => 10,
				'description' => \__( 'Duplicate content provides no additional value to screen reader users', 'block-accessibility-checks' ),
			)
		);

		// Button block checks.
		$this->register_check(
			'core/button',
			'button_text_quality',
			array(
				'callback'    => array( $this, 'check_button_text' ),
				'message'     => \__( 'Button text should be descriptive and meaningful', 'block-accessibility-checks' ),
				'type'        => 'warning',
				'priority'    => 10,
				'description' => \__( 'Generic button text like "click here" is not helpful for screen reader users', 'block-accessibility-checks' ),
			)
		);

		// Table block checks.
		$this->register_check(
			'core/table',
			'table_headers',
			array(
				'callback'    => array( $this, 'check_table_headers' ),
				'message'     => \__( 'Tables should include proper headers', 'block-accessibility-checks' ),
				'type'        => 'warning',
				'priority'    => 5,
				'description' => \__( 'Table headers help screen reader users navigate table content', 'block-accessibility-checks' ),
			)
		);

		// Hook for developers to register additional checks.
		\do_action( 'ba11yc_register_checks', $this );
	}

	/**
	 * Register a new accessibility check
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_check( $block_type, $check_name, $check_args ) {
		$defaults = array(
			'callback'    => null,
			'message'     => '',
			'type'        => 'warning',
			'priority'    => 10,
			'enabled'     => true,
			'description' => '',
		);

		$check_args = \wp_parse_args( $check_args, $defaults );

		// Validate required parameters.
		if ( empty( $block_type ) || empty( $check_name ) || ! \is_callable( $check_args['callback'] ) ) {
			return false;
		}

		// Allow developers to filter check arguments before registration.
		$check_args = \apply_filters( 'ba11yc_check_args', $check_args, $block_type, $check_name );

		// Allow developers to prevent specific checks from being registered.
		if ( ! \apply_filters( 'ba11yc_should_register_check', true, $block_type, $check_name, $check_args ) ) {
			return false;
		}

		// Initialize block type array if needed.
		if ( ! isset( $this->checks[ $block_type ] ) ) {
			$this->checks[ $block_type ] = array();
		}

		// Store the check.
		$this->checks[ $block_type ][ $check_name ] = $check_args;

		// Sort checks by priority.
		\uasort( $this->checks[ $block_type ], array( $this, 'sort_checks_by_priority' ) );

		// Action hook for developers to know when a check is registered.
		\do_action( 'ba11yc_check_registered', $block_type, $check_name, $check_args );

		return true;
	}

	/**
	 * Unregister an accessibility check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return bool True on success, false if check not found.
	 */
	public function unregister_check( $block_type, $check_name ) {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return false;
		}

		unset( $this->checks[ $block_type ][ $check_name ] );

		// Action hook for developers to know when a check is unregistered.
		\do_action( 'ba11yc_check_unregistered', $block_type, $check_name );

		return true;
	}

	/**
	 * Enable or disable a specific check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @param bool   $enabled Whether to enable or disable the check.
	 * @return bool True on success, false if check not found.
	 */
	public function set_check_enabled( $block_type, $check_name, $enabled ) {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return false;
		}

		$this->checks[ $block_type ][ $check_name ]['enabled'] = (bool) $enabled;

		// Action hook for developers to know when a check is enabled/disabled.
		\do_action( 'ba11yc_check_toggled', $block_type, $check_name, $enabled );

		return true;
	}

	/**
	 * Get checks for a specific block type
	 *
	 * @param string $block_type Block type.
	 * @return array Array of checks for the block type.
	 */
	public function get_checks( $block_type ) {
		return isset( $this->checks[ $block_type ] ) ? $this->checks[ $block_type ] : array();
	}

	/**
	 * Get all registered checks
	 *
	 * @return array All registered checks.
	 */
	public function get_all_checks() {
		return $this->checks;
	}

	/**
	 * Check if a specific check is registered
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return bool True if registered, false otherwise.
	 */
	public function is_check_registered( $block_type, $check_name ) {
		return isset( $this->checks[ $block_type ][ $check_name ] );
	}

	/**
	 * Get configuration for a specific check
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return array|null Check configuration or null if not found.
	 */
	public function get_check_config( $block_type, $check_name ) {
		if ( ! isset( $this->checks[ $block_type ][ $check_name ] ) ) {
			return null;
		}

		return $this->checks[ $block_type ][ $check_name ];
	}

	/**
	 * Get all registered block types
	 *
	 * @return array Array of block types that have checks registered.
	 */
	public function get_registered_block_types() {
		return \array_keys( $this->checks );
	}

	/**
	 * Run checks for a block
	 *
	 * @param string $block_type Block type.
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @return array Array of check results.
	 */
	public function run_checks( $block_type, $attributes, $content = '' ) {
		$results = array();
		$checks  = $this->get_checks( $block_type );

		// Allow developers to filter which checks run for a block.
		$checks = \apply_filters( 'ba11yc_block_checks', $checks, $block_type, $attributes, $content );

		// Allow developers to completely filter the attributes before checks run.
		$attributes = \apply_filters( 'ba11yc_block_attributes', $attributes, $block_type, $content );

		foreach ( $checks as $check_name => $check_config ) {
			if ( ! $check_config['enabled'] || ! \is_callable( $check_config['callback'] ) ) {
				continue;
			}

			// Allow developers to filter each check config before it runs.
			$check_config = \apply_filters( 'ba11yc_before_check', $check_config, $check_name, $block_type, $attributes, $content );

			$check_result = \call_user_func(
				$check_config['callback'],
				$attributes,
				$content,
				$check_config
			);

			// Allow developers to filter the check result.
			$check_result = \apply_filters( 'ba11yc_check_result', $check_result, $check_name, $block_type, $attributes, $content, $check_config );

			if ( ! empty( $check_result ) ) {
				$result = array(
					'check_name'  => $check_name,
					'block_type'  => $block_type,
					'message'     => $check_config['message'],
					'type'        => $check_config['type'],
					'priority'    => $check_config['priority'],
					'description' => $check_config['description'],
					'result'      => $check_result,
				);

				// Allow developers to filter the final result object.
				$result = \apply_filters( 'ba11yc_final_check_result', $result, $check_name, $block_type, $attributes, $content, $check_config );

				if ( ! empty( $result ) ) {
					$results[] = $result;
				}
			}
		}

		// Allow developers to filter all results for a block.
		$results = \apply_filters( 'ba11yc_block_check_results', $results, $block_type, $attributes, $content );

		return $results;
	}

	/**
	 * Sort checks by priority
	 *
	 * @param array $a First check.
	 * @param array $b Second check.
	 * @return int Comparison result.
	 */
	private function sort_checks_by_priority( $a, $b ) {
		return $a['priority'] - $b['priority'];
	}

	/**
	 * Check image alt text length
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param array  $config Check configuration.
	 * @return bool True if check fails.
	 */
	public function check_image_alt_length( $attributes, $content, $config ) {
		if ( ! isset( $attributes['alt'] ) || empty( $attributes['alt'] ) ) {
			return false;
		}

		return strlen( $attributes['alt'] ) > 125;
	}

	/**
	 * Check if image alt text matches caption
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param array  $config Check configuration.
	 * @return bool True if check fails.
	 */
	public function check_image_alt_caption_match( $attributes, $content, $config ) {
		if ( ! isset( $attributes['alt'] ) || ! isset( $attributes['caption'] ) ) {
			return false;
		}

		$alt_text = \trim( $attributes['alt'] );
		$caption  = \trim( \wp_strip_all_tags( $attributes['caption'] ) );

		return ! empty( $alt_text ) && ! empty( $caption ) && $alt_text === $caption;
	}

	/**
	 * Check button text quality
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param array  $config Check configuration.
	 * @return bool True if check fails.
	 */
	public function check_button_text( $attributes, $content, $config ) {
		if ( ! isset( $attributes['text'] ) ) {
			return false;
		}

		$text = \trim( \wp_strip_all_tags( $attributes['text'] ) );

		// Check for generic button text.
		$generic_texts = array( 'click here', 'read more', 'learn more', 'more', 'here', 'link' );

		return \in_array( \strtolower( $text ), $generic_texts, true ) || \strlen( $text ) < 3;
	}

	/**
	 * Check table headers
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param array  $config Check configuration.
	 * @return bool True if check fails.
	 */
	public function check_table_headers( $attributes, $content, $config ) {
		// Check if table has header section defined.
		$has_header = isset( $attributes['head'] ) && ! empty( $attributes['head'] );

		// Check if table has caption.
		$has_caption = isset( $attributes['caption'] ) && ! empty( trim( $attributes['caption'] ) );

		// Table should have either headers or caption for accessibility.
		return ! ( $has_header || $has_caption );
	}
}
