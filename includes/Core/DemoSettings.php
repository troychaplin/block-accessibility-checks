<?php
/**
 * Demo Settings Page
 *
 * Proof-of-concept React-based settings page to test new UI approach.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility\Core;

use BlockAccessibility\Block\Registry as BlockChecksRegistry;

/**
 * Demo Settings Class
 *
 * This class provides a demo/proof-of-concept settings page using React
 * and WordPress components to test the new UI before full migration.
 */
class DemoSettings {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_demo_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_demo_assets' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Add demo submenu page
	 *
	 * @return void
	 */
	public function add_demo_menu(): void {
		add_submenu_page(
			'block-a11y-checks',
			__( 'Demo Settings (React POC)', 'block-accessibility-checks' ),
			__( 'Demo Settings', 'block-accessibility-checks' ),
			'manage_options',
			'block-a11y-checks-demo',
			array( $this, 'render_demo_page' )
		);
	}

	/**
	 * Render demo page
	 *
	 * @return void
	 */
	public function render_demo_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		echo '<div id="ba11y-demo-settings-root"></div>';
	}

	/**
	 * Enqueue demo assets
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public function enqueue_demo_assets( string $hook ): void {
		// Only load on our demo page.
		if ( 'accessibility-validation_page_block-a11y-checks-demo' !== $hook ) {
			return;
		}

		$asset_file = include plugin_dir_path( dirname( __DIR__ ) ) . 'build/settings-demo.asset.php';

		wp_enqueue_script(
			'ba11y-settings-demo',
			plugins_url( 'build/settings-demo.js', dirname( __DIR__ ) ),
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_enqueue_style(
			'ba11y-settings-demo',
			plugins_url( 'build/settings-demo.css', dirname( __DIR__ ) ),
			array( 'wp-components' ),
			$asset_file['version']
		);

		// Pass initial data to React.
		wp_localize_script(
			'ba11y-settings-demo',
			'ba11yDemoSettings',
			array(
				'restUrl'  => rest_url( 'block-accessibility/v1' ),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'settings' => $this->get_demo_settings_data(),
			)
		);
	}

	/**
	 * Register REST API routes
	 *
	 * @return void
	 */
	public function register_rest_routes(): void {
		// GET demo settings.
		register_rest_route(
			'block-accessibility/v1',
			'/demo-settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_demo_settings' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);

		// POST demo settings (save).
		register_rest_route(
			'block-accessibility/v1',
			'/demo-settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_demo_settings' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'settings' => array(
						'required'          => true,
						'type'              => 'object',
						'sanitize_callback' => array( $this, 'sanitize_demo_settings' ),
					),
				),
			)
		);
	}

	/**
	 * Get demo settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_demo_settings(): \WP_REST_Response {
		$data = $this->get_demo_settings_data();

		return new \WP_REST_Response( $data, 200 );
	}

	/**
	 * Save demo settings
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function save_demo_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$settings = $request->get_param( 'settings' );

		// For demo purposes, we'll use a separate option.
		$updated = update_option( 'block_checks_demo_options', $settings );

		if ( $updated ) {
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => __( 'Settings saved successfully!', 'block-accessibility-checks' ),
				),
				200
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Failed to save settings.', 'block-accessibility-checks' ),
			),
			500
		);
	}

	/**
	 * Sanitize demo settings
	 *
	 * @param array $settings Settings to sanitize.
	 * @return array Sanitized settings.
	 */
	public function sanitize_demo_settings( array $settings ): array {
		$sanitized    = array();
		$valid_values = array( 'error', 'warning', 'none' );

		foreach ( $settings as $key => $value ) {
			if ( in_array( $value, $valid_values, true ) ) {
				$sanitized[ sanitize_text_field( $key ) ] = sanitize_text_field( $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Get demo settings data
	 *
	 * Retrieves settings for core blocks to use in the demo.
	 *
	 * @return array Settings data structure.
	 */
	private function get_demo_settings_data(): array {
		$registry           = BlockChecksRegistry::get_instance();
		$all_checks         = $registry->get_all_checks();
		$current_options    = get_option( 'block_checks_demo_options', array() );
		$production_options = get_option( 'block_checks_options', array() );

		// If demo options don't exist, use production options as starting point.
		if ( empty( $current_options ) ) {
			$current_options = $production_options;
		}

		$blocks = array();

		// Only include core blocks for demo.
		foreach ( $all_checks as $block_type => $checks ) {
			if ( strpos( $block_type, 'core/' ) !== 0 ) {
				continue;
			}

			$block_data = array(
				'blockType' => $block_type,
				'label'     => $this->get_block_label( $block_type ),
				'checks'    => array(),
			);

			foreach ( $checks as $check_name => $check_config ) {
				// Only show settings-based checks.
				if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
					continue;
				}

				$field_name    = $block_type . '_' . $check_name;
				$current_value = $current_options[ $field_name ] ?? 'error';

				$block_data['checks'][] = array(
					'name'        => $check_name,
					'fieldName'   => $field_name,
					'description' => $check_config['description'] ?? $check_config['error_msg'],
					'value'       => $current_value,
					'category'    => $check_config['category'] ?? 'accessibility',
				);
			}

			// Only include blocks that have settings-based checks.
			if ( ! empty( $block_data['checks'] ) ) {
				$blocks[] = $block_data;
			}
		}

		return array(
			'blocks'        => $blocks,
			'headingLevels' => $production_options['core_heading_levels'] ?? array(),
		);
	}

	/**
	 * Get block label
	 *
	 * @param string $block_type Block type.
	 * @return string Block label.
	 */
	private function get_block_label( string $block_type ): string {
		$labels = array(
			'core/button'  => __( 'Button Block', 'block-accessibility-checks' ),
			'core/heading' => __( 'Heading Block', 'block-accessibility-checks' ),
			'core/image'   => __( 'Image Block', 'block-accessibility-checks' ),
			'core/table'   => __( 'Table Block', 'block-accessibility-checks' ),
		);

		return $labels[ $block_type ] ?? $block_type;
	}
}
