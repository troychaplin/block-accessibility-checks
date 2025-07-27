<?php
/**
 * Namespace declaration for the BlockAccessibility plugin.
 *
 * This namespace is used to encapsulate all the classes and functions
 * related to the Block Accessibility Checks plugin, ensuring that there
 * are no naming conflicts with other plugins or core WordPress functionality.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility;

/**
 * Class SettingsPage
 *
 * This class is responsible for managing the settings page functionality
 * within the Block Accessibility Checks plugin. It provides methods and
 * properties to handle the configuration and display of the settings page.
 *
 * @package BlockAccessibilityChecks\Functions
 */
class SettingsPage {

	/**
	 * Registry instance for accessing external blocks
	 *
	 * @var BlockChecksRegistry
	 */
	private $registry;

	/**
	 * Holds the block settings configuration.
	 *
	 * @var array
	 */
	private $block_settings = array(
		array(
			'option_name'   => 'core_heading_levels',
			'block_label'   => 'Heading Block',
			'description'   => 'Select which heading levels you want to remove from the editor. Checked levels will not be available.',
			'function_name' => 'render_core_heading_options',
		),
	);

	/**
	 * SettingsPage constructor.
	 *
	 * This constructor initializes the settings page by adding the necessary
	 * actions to the WordPress admin menu and initializing the settings.
	 *
	 * @return void
	 */
	public function __construct() {
		$this->registry = BlockChecksRegistry::get_instance();
		\add_action( 'admin_menu', array( $this, 'block_check_admin_menu' ) );
		\add_action( 'admin_init', array( $this, 'init_settings' ) );
	}

	/**
	 * Adds the settings page to the WordPress admin menu.
	 *
	 * This method is responsible for adding the top-level menu and submenus for
	 * block accessibility checks. It creates a main menu item and separate
	 * submenus for core blocks and external plugins.
	 *
	 * @return void
	 */
	public function block_check_admin_menu(): void {
		// Add top-level menu.
		\add_menu_page(
			\esc_html__( 'Block Checks', 'block-accessibility-checks' ),
			\esc_html__( 'Block Checks', 'block-accessibility-checks' ),
			'manage_options',
			'block-a11y-checks',
			array( $this, 'settings_page_layout' ),
			'dashicons-universal-access',
			81
		);

		// Add Core Block Checks submenu.
		\add_submenu_page(
			'block-a11y-checks',
			\esc_html__( 'Core Block Checks', 'block-accessibility-checks' ),
			\esc_html__( 'Core Block Checks', 'block-accessibility-checks' ),
			'manage_options',
			'block-a11y-checks',
			array( $this, 'settings_page_layout' )
		);

		// Add external plugin submenus.
		$this->add_external_plugin_menus();
	}

	/**
	 * Add submenu pages for external plugins that have registered blocks
	 *
	 * @return void
	 */
	private function add_external_plugin_menus(): void {
		$external_plugins = $this->get_external_plugins_with_settings();

		foreach ( $external_plugins as $plugin_slug => $plugin_data ) {
			\add_submenu_page(
				'block-a11y-checks',
				$plugin_data['name'],
				$plugin_data['name'],
				'manage_options',
				'block-a11y-checks-' . $plugin_slug,
				array( $this, 'external_plugin_settings_page' )
			);
		}
	}

	/**
	 * Get external plugins that have blocks using settings-based checks
	 *
	 * @return array Array of external plugins with their block data
	 */
	public function get_external_plugins_with_settings(): array {
		$external_plugins = array();
		$all_checks       = $this->registry->get_all_checks();

		foreach ( $all_checks as $block_type => $checks ) {
			// Skip core blocks.
			if ( strpos( $block_type, 'core/' ) === 0 ) {
				continue;
			}

			// Check if any checks for this block are using settings.
			$has_settings_checks = false;
			foreach ( $checks as $check ) {
				if ( ! isset( $check['type'] ) || 'settings' === $check['type'] ) {
					$has_settings_checks = true;
					break;
				}
			}

			if ( ! $has_settings_checks ) {
				continue;
			}

			// Extract plugin info from block type.
			$plugin_info = $this->extract_plugin_info_from_block_type( $block_type );
			$plugin_slug = $plugin_info['slug'];

			if ( ! isset( $external_plugins[ $plugin_slug ] ) ) {
				$external_plugins[ $plugin_slug ] = array(
					'name'   => $plugin_info['name'],
					'blocks' => array(),
				);
			}

			$external_plugins[ $plugin_slug ]['blocks'][ $block_type ] = $checks;
		}

		return $external_plugins;
	}

	/**
	 * Extract plugin information from block type
	 *
	 * @param string $block_type The block type (e.g., 'create-block/my-testimonial-block').
	 * @return array Plugin information with name and slug
	 */
	private function extract_plugin_info_from_block_type( string $block_type ): array {
		$parts      = explode( '/', $block_type );
		$namespace  = $parts[0] ?? '';
		$block_name = $parts[1] ?? '';

		// Convert namespace to readable name.
		$plugin_name = ucwords( str_replace( array( '-', '_' ), ' ', $namespace ) );

		// Create a slug for the plugin.
		$plugin_slug = sanitize_title( $namespace );

		return array(
			'name' => $plugin_name,
			'slug' => $plugin_slug,
		);
	}

	/**
	 * Initializes the settings for the plugin.
	 *
	 * This method is responsible for registering the settings and adding
	 * the settings section and fields to the WordPress admin.
	 *
	 * @return void
	 */
	public function init_settings(): void {
		// Register core block settings.
		\register_setting(
			'block_checks_settings_group',
			'block_checks_options',
			array(
				'sanitize_callback' => array( $this, 'sanitize_options' ),
			)
		);

		\add_settings_section(
			'block_checks_options_section',
			'',
			false,
			'block_checks_options'
		);

		foreach ( $this->block_settings as $block ) {
			\add_settings_field(
				$block['option_name'],
				$block['block_label'],
				array( $this, $block['function_name'] ),
				'block_checks_options',
				'block_checks_options_section'
			);
		}

		// Register external plugin settings.
		$this->register_external_plugin_settings();
	}

	/**
	 * Register settings for external plugins
	 *
	 * @return void
	 */
	private function register_external_plugin_settings(): void {
		$external_plugins = $this->get_external_plugins_with_settings();

		foreach ( $external_plugins as $plugin_slug => $plugin_data ) {
			$option_group = 'block_checks_external_' . $plugin_slug . '_group';
			$option_name  = 'block_checks_external_' . $plugin_slug;

			\register_setting(
				$option_group,
				$option_name,
				array(
					'sanitize_callback' => array( $this, 'sanitize_external_options' ),
				)
			);

			\add_settings_section(
				$option_name . '_section',
				'',
				false,
				$option_name
			);

			foreach ( $plugin_data['blocks'] as $block_type => $checks ) {
				$block_name = $this->get_block_display_name( $block_type );

				\add_settings_field(
					str_replace( array( '/', '-' ), '_', $block_type ),
					$block_name,
					array( $this, 'render_external_block_options' ),
					$option_name,
					$option_name . '_section',
					array(
						'block_type'  => $block_type,
						'plugin_slug' => $plugin_slug,
						'checks'      => $checks,
					)
				);
			}
		}
	}

	/**
	 * Renders the settings page layout.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the settings page for the plugin.
	 *
	 * @return void
	 */
	public function settings_page_layout() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		echo '<div class="block-a11y-checks-settings">' . "\n";
		echo '<h1>' . esc_html( get_admin_page_title() ) . '</h1>' . "\n";
		echo '<form class="block-a11y-checks-settings-form" action="options.php" method="post">' . "\n";
		echo '<div class="block-a11y-checks-settings-grid">';

		settings_fields( 'block_checks_settings_group' );

		// Render core block checks with individual check settings.
		$this->render_core_block_checks();

		// Render heading levels (special case).
		foreach ( $this->block_settings as $block ) {
			echo '<div class="block-a11y-checks-settings-field">';
			echo '<h2>' . esc_html( $block['block_label'] ) . '</h2>';
			echo '<p>' . esc_html( $block['description'] ) . '</p>';
			call_user_func( array( $this, $block['function_name'] ) );
			echo '</div>';
		}

		echo '</div>';
		submit_button();
		echo '</form>' . "\n";
		echo '</div>' . "\n";
	}

	/**
	 * Render core block checks with individual check settings
	 *
	 * @return void
	 */
	private function render_core_block_checks(): void {
		$core_blocks = array(
			'core/button' => __( 'Button Block', 'block-accessibility-checks' ),
			'core/image'  => __( 'Image Block', 'block-accessibility-checks' ),
			'core/table'  => __( 'Table Block', 'block-accessibility-checks' ),
		);

		foreach ( $core_blocks as $block_type => $block_label ) {
			$checks = $this->registry->get_checks( $block_type );

			if ( empty( $checks ) ) {
				continue;
			}

			echo '<div class="block-a11y-checks-settings-field">';
			echo '<h2>' . esc_html( $block_label ) . '</h2>';
			echo '<p>' . esc_html__( 'Configure accessibility check levels for this block.', 'block-accessibility-checks' ) . '</p>';

			$this->render_core_block_options( $block_type, $checks );

			echo '</div>';
		}
	}

	/**
	 * Render core block options with individual check settings
	 *
	 * @param string $block_type The block type.
	 * @param array  $checks     The checks for this block.
	 * @return void
	 */
	private function render_core_block_options( string $block_type, array $checks ): void {
		$options = \get_option( 'block_checks_options', array() );

		foreach ( $checks as $check_name => $check_config ) {
			// Only show checks that are using settings (not forced).
			if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
				continue;
			}

			$field_name = $block_type . '_' . $check_name;
			$value      = $options[ $field_name ] ?? 'error';

			// Use description if set, otherwise fallback to message.
			$desc = ! empty( $check_config['description'] ) ? $check_config['description'] : ( $check_config['error_msg'] ?? $check_name );

			echo '<div class="block-check-item">';
			echo '<fieldset>';
			echo '<legend><strong>' . \esc_html( $desc ) . '</strong></legend>';

			echo '<ul class="block-check-radio-options">';

			// Error option.
			$error_id = \esc_attr( $field_name . '_error' );
			echo '<li>';
			echo '<input type="radio" id="' . \esc_attr( $error_id ) . '" name="block_checks_options[' . \esc_attr( $field_name ) . ']" value="error" ' . \checked( $value, 'error', false ) . '>';
			echo '<label for="' . \esc_attr( $error_id ) . '">' . \esc_html__( 'Error', 'block-accessibility-checks' ) . '</label>';
			echo '</li>';

			// Warning option.
			$warning_id = \esc_attr( $field_name . '_warning' );
			echo '<li>';
			echo '<input type="radio" id="' . \esc_attr( $warning_id ) . '" name="block_checks_options[' . \esc_attr( $field_name ) . ']" value="warning" ' . \checked( $value, 'warning', false ) . '>';
			echo '<label for="' . \esc_attr( $warning_id ) . '">' . \esc_html__( 'Warning', 'block-accessibility-checks' ) . '</label>';
			echo '</li>';

			// None option.
			$none_id = \esc_attr( $field_name . '_none' );
			echo '<li>';
			echo '<input type="radio" id="' . \esc_attr( $none_id ) . '" name="block_checks_options[' . \esc_attr( $field_name ) . ']" value="none" ' . \checked( $value, 'none', false ) . '>';
			echo '<label for="' . \esc_attr( $none_id ) . '">' . \esc_html__( 'None', 'block-accessibility-checks' ) . '</label>';
			echo '</li>';

			echo '</ul>';
			echo '</fieldset>';
			echo '</div>';
		}
	}

	/**
	 * Renders the core heading options for the settings page.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the core heading options in the plugin's settings page.
	 *
	 * @return void
	 */
	public function render_core_heading_options() {
		$options        = get_option( 'block_checks_options' );
		$heading_levels = isset( $options['core_heading_levels'] ) ? $options['core_heading_levels'] : array();

		echo '<ul class="block-check-checkbox-options">';
		for ( $i = 1; $i <= 6; $i++ ) {
			$level   = 'h' . $i;
			$checked = in_array( $level, $heading_levels, true ) ? 'checked' : '';
			echo '<li>';
			echo '<input type="checkbox" 
						 id="' . esc_attr( 'heading-level-' . $i ) . '" 
						 name="block_checks_options[core_heading_levels][]" 
						 value="' . esc_attr( $level ) . '" 
						 ' . esc_attr( $checked ) . '>';
			echo '<label for="' . esc_attr( 'heading-level-' . $i ) . '">' . esc_html( strtoupper( $level ) ) . '</label>';
			echo '</li>';
		}
		echo '</ul>';
	}

	/**
	 * Sanitizes the plugin options before saving to the database.
	 *
	 * This method validates and sanitizes all incoming option data to prevent
	 * XSS attacks and ensure data integrity.
	 *
	 * @param mixed $input The input array from the settings form.
	 *
	 * @return array The sanitized options array.
	 */
	public function sanitize_options( $input ): array {
		try {
			$sanitized = array();

			if ( ! is_array( $input ) ) {
				$this->log_error( 'Settings input is not an array. Returning empty array.' );
				return $sanitized;
			}

			$this->log_debug( 'Starting sanitization of plugin options.' );

			// Sanitize individual core block check options (error, warning, none).
			$valid_check_values = array( 'error', 'warning', 'none' );

			foreach ( $input as $key => $value ) {
				// Handle heading levels array.
				if ( 'core_heading_levels' === $key ) {
					if ( is_array( $value ) ) {
						$sanitized['core_heading_levels'] = array();
						$valid_levels                     = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );

						foreach ( $value as $level ) {
							if ( in_array( $level, $valid_levels, true ) ) {
								$sanitized['core_heading_levels'][] = \sanitize_text_field( $level );
								$this->log_debug( "Added heading level: {$level}" );
							} else {
								$this->log_error( "Invalid heading level: {$level}. Skipping." );
							}
						}

						$this->log_debug( 'Completed heading levels sanitization.' );
					} else {
						$this->log_error( 'Heading levels input is not an array. Skipping.' );
					}
				} elseif ( 'core_heading_levels' !== $key ) {
					// Handle individual check settings.
					if ( in_array( $value, $valid_check_values, true ) ) {
						$sanitized[ \sanitize_text_field( $key ) ] = \sanitize_text_field( $value );
						$this->log_debug( "Sanitized {$key}: {$value}" );
					} else {
						$this->log_error( "Invalid value for {$key}: {$value}. Skipping." );
					}
				}
			}

			$this->log_debug( 'Settings sanitization completed successfully.' );
			return $sanitized;

		} catch ( \Exception $e ) {
			$this->log_error( 'Error during settings sanitization: ' . $e->getMessage() );
			return array();
		}
	}

	/**
	 * Log error messages when WP_DEBUG is enabled
	 *
	 * @param string $message Error message to log.
	 * @return void
	 */
	private function log_error( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( 'Block Accessibility Checks - SettingsPage: ' . $message );
		}
	}

	/**
	 * Log debug messages when WP_DEBUG is enabled
	 *
	 * @param string $message Debug message to log.
	 * @return void
	 */
	private function log_debug( string $message ): void {
		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) && defined( 'WP_DEBUG_LOG' ) && constant( 'WP_DEBUG_LOG' ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			\error_log( 'Block Accessibility Checks - SettingsPage DEBUG: ' . $message );
		}
	}

	/**
	 * Get display name for a block type
	 *
	 * @param string $block_type The block type.
	 * @return string The display name.
	 */
	private function get_block_display_name( string $block_type ): string {
		$parts      = explode( '/', $block_type );
		$block_name = $parts[1] ?? $block_type;

		// Convert kebab-case to title case.
		return ucwords( str_replace( array( '-', '_' ), ' ', $block_name ) );
	}

	/**
	 * Render external plugin settings page
	 *
	 * @return void
	 */
	public function external_plugin_settings_page(): void {
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		// Get current page slug to determine which plugin.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- This is an admin page callback, nonce verification not required for page parameter.
		$current_page = \sanitize_text_field( \wp_unslash( $_GET['page'] ?? '' ) );
		$plugin_slug  = str_replace( 'block-a11y-checks-', '', $current_page );

		$external_plugins = $this->get_external_plugins_with_settings();
		$plugin_data      = $external_plugins[ $plugin_slug ] ?? null;

		if ( ! $plugin_data ) {
			\wp_die( \esc_html__( 'Plugin settings not found.', 'block-accessibility-checks' ) );
		}

		$option_group = 'block_checks_external_' . $plugin_slug . '_group';
		$option_name  = 'block_checks_external_' . $plugin_slug;

		echo '<div class="block-a11y-checks-settings">' . "\n";
		echo '<h1>' . \esc_html( $plugin_data['name'] ) . '</h1>' . "\n";
		echo '<form class="block-a11y-checks-settings-form" action="options.php" method="post">' . "\n";
		echo '<div class="block-a11y-checks-settings-grid">';

		\settings_fields( $option_group );

		foreach ( $plugin_data['blocks'] as $block_type => $checks ) {
			$block_name = $this->get_block_display_name( $block_type );
			echo '<div class="block-a11y-checks-settings-field">';
			echo '<h2>' . \esc_html( $block_name ) . '</h2>';
			echo '<p>' . \esc_html__( 'Configure accessibility check levels for this block.', 'block-accessibility-checks' ) . '</p>';

			$this->render_external_block_options(
				array(
					'block_type'  => $block_type,
					'plugin_slug' => $plugin_slug,
					'checks'      => $checks,
				)
			);

			echo '</div>';
		}

		echo '</div>';
		\submit_button();
		echo '</form>' . "\n";
		echo '</div>' . "\n";
	}

	/**
	 * Render external block options
	 *
	 * @param array $args Arguments containing block_type, plugin_slug, and checks.
	 * @return void
	 */
	public function render_external_block_options( array $args ): void {
		$block_type  = $args['block_type'] ?? '';
		$plugin_slug = $args['plugin_slug'] ?? '';
		$checks      = $args['checks'] ?? array();

		$option_name = 'block_checks_external_' . $plugin_slug;
		$options     = \get_option( $option_name, array() );

		foreach ( $checks as $check_name => $check_config ) {
			// Only show checks that are using settings (not forced).
			if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
				continue;
			}

			$field_name = $block_type . '_' . $check_name;
			$value      = $options[ $field_name ] ?? 'error';

			// Use description if set, otherwise fallback to message.
			$desc = ! empty( $check_config['description'] ) ? $check_config['description'] : ( $check_config['error_msg'] ?? $check_name );

			echo '<div class="block-check-item">';
			echo '<fieldset>';
			echo '<legend><strong>' . \esc_html( $desc ) . '</strong></legend>';

			echo '<ul class="block-check-radio-options">';

			// Error option.
			$error_id = \esc_attr( $field_name . '_error' );
			echo '<li>';
			echo '<input type="radio" id="' . \esc_attr( $error_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="error" ' . \checked( $value, 'error', false ) . '>';
			echo '<label for="' . \esc_attr( $error_id ) . '">' . \esc_html__( 'Error', 'block-accessibility-checks' ) . '</label>';
			echo '</li>';

			// Warning option.
			$warning_id = \esc_attr( $field_name . '_warning' );
			echo '<li>';
			echo '<input type="radio" id="' . \esc_attr( $warning_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="warning" ' . \checked( $value, 'warning', false ) . '>';
			echo '<label for="' . \esc_attr( $warning_id ) . '">' . \esc_html__( 'Warning', 'block-accessibility-checks' ) . '</label>';
			echo '</li>';

			// None option.
			$none_id = \esc_attr( $field_name . '_none' );
			echo '<li>';
			echo '<input type="radio" id="' . \esc_attr( $none_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="none" ' . \checked( $value, 'none', false ) . '>';
			echo '<label for="' . \esc_attr( $none_id ) . '">' . \esc_html__( 'None', 'block-accessibility-checks' ) . '</label>';
			echo '</li>';

			echo '</ul>';
			echo '</fieldset>';
			echo '</div>';
		}
	}

	/**
	 * Sanitize external plugin options
	 *
	 * @param mixed $input The input array from the settings form.
	 * @return array The sanitized options array.
	 */
	public function sanitize_external_options( $input ): array {
		$sanitized    = array();
		$valid_values = array( 'error', 'warning', 'none' );

		if ( ! is_array( $input ) ) {
			return $sanitized;
		}

		foreach ( $input as $key => $value ) {
			if ( in_array( $value, $valid_values, true ) ) {
				$sanitized[ \sanitize_text_field( $key ) ] = \sanitize_text_field( $value );
			}
		}

		return $sanitized;
	}
}
