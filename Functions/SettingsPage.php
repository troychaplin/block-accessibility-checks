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

use BlockAccessibility\Traits\Logger;

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

	use Logger;

	/**
	 * Heading levels that can be removed from the editor.
	 * H2, H3, and H4 are always available.
	 *
	 * @var array
	 */
	private const REMOVABLE_HEADING_LEVELS = array( 'h1', 'h5', 'h6' );

	/**
	 * Valid values for check settings.
	 *
	 * @var array
	 */
	private const VALID_CHECK_VALUES = array( 'error', 'warning', 'none' );

	/**
	 * Registry instance for accessing external blocks
	 *
	 * @var BlockChecksRegistry
	 */
	private $registry;

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

		\add_settings_field(
			'core_heading_levels',
			'Heading Block',
			array( $this, 'render_core_heading_options' ),
			'block_checks_options',
			'block_checks_options_section'
		);

		// Register external plugin settings.
		$this->register_external_plugin_settings();

		// Register meta check settings.
		$this->register_meta_check_settings();

		// Register editor check settings.
		$this->register_editor_check_settings();
	}

	/**
	 * Renders the settings page layout for core blocks.
	 *
	 * @return void
	 */
	public function settings_page_layout(): void {
		$this->render_settings_page(
			\get_admin_page_title(),
			'block_checks_settings_group',
			'',
			array( $this, 'render_core_settings_content' )
		);
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
		$options        = \get_option( 'block_checks_options' );
		$heading_levels = $options['core_heading_levels'] ?? array();

		$this->render_heading_checkboxes( $heading_levels, false );
	}

	/**
	 * Renders heading level checkboxes
	 *
	 * Shared method to render heading level checkbox options with optional description.
	 *
	 * @param array $heading_levels Currently selected heading levels.
	 * @param bool  $include_description Whether to include the description label.
	 * @return void
	 */
	private function render_heading_checkboxes( array $heading_levels, bool $include_description = false ): void {
		echo '<div class="ba11y-block-single-option" role="group" aria-labelledby="heading-levels-label">';
		echo '<div class="ba11y-field-group">';

		if ( $include_description ) {
			echo '<div class="ba11y-field-label">';
			echo '<p id="heading-levels-label">' . \esc_html__( 'Select which heading levels you want to remove from the editor. H2, H3 and H4 are always available.', 'block-accessibility-checks' ) . '</p>';
			echo '</div>';
		}

		echo '<div class="ba11y-field-controls ba11y-field-controls--checkbox">';

		// Only allow removal of H1, H5, and H6 levels.
		foreach ( self::REMOVABLE_HEADING_LEVELS as $level ) {
			$level_num = intval( substr( $level, 1 ) );
			$checked   = in_array( $level, $heading_levels, true ) ? 'checked' : '';
			echo '<div class="ba11y-checkbox-item">';
			echo '<input type="checkbox" 
						 id="' . \esc_attr( 'heading-level-' . $level_num ) . '" 
						 name="block_checks_options[core_heading_levels][]" 
						 value="' . \esc_attr( $level ) . '" 
						 ' . ( $checked ? 'checked="checked"' : '' ) . '>';
			echo '<label for="' . \esc_attr( 'heading-level-' . $level_num ) . '">' . \esc_html( strtoupper( $level ) ) . '</label>';
			echo '</div>';
		}

		echo '</div>';
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Renders the heading level options within the heading block section.
	 *
	 * This method renders the heading level checkboxes directly within the
	 * heading block options, positioned above the individual check settings.
	 *
	 * @return void
	 */
	private function render_heading_level_options(): void {
		$options        = \get_option( 'block_checks_options' );
		$heading_levels = $options['core_heading_levels'] ?? array();

		$this->render_heading_checkboxes( $heading_levels, true );
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

		$this->render_settings_page(
			$plugin_data['name'],
			$option_group,
			$plugin_data['version'] ?? '',
			array( $this, 'render_external_plugin_settings_content' ),
			array( $plugin_data, $plugin_slug )
		);
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
		$this->render_block_options( $block_type, $checks, $option_name );
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

			foreach ( $input as $key => $value ) {
				// Handle heading levels array.
				if ( 'core_heading_levels' === $key ) {
					if ( is_array( $value ) ) {
						$sanitized['core_heading_levels'] = array();

						foreach ( $value as $level ) {
							if ( in_array( $level, self::REMOVABLE_HEADING_LEVELS, true ) ) {
								$sanitized['core_heading_levels'][] = \sanitize_text_field( $level );
								$this->log_debug( "Added heading level: {$level}" );
							} else {
								$this->log_error( "Invalid heading level: {$level}. Only H1, H5, and H6 can be removed. Skipping." );
							}
						}

						$this->log_debug( 'Completed heading levels sanitization.' );
					} else {
						$this->log_error( 'Heading levels input is not an array. Skipping.' );
					}
				} elseif ( 'core_heading_levels' !== $key ) {
					// Handle individual check settings.
					if ( in_array( $value, self::VALID_CHECK_VALUES, true ) ) {
						$sanitized[ \sanitize_text_field( $key ) ] = \sanitize_text_field( $value );
						$this->log_debug( "Sanitized {$key}: {$value}" );
					} else {
						$this->log_error( "Invalid value for {$key}: {$value}. Skipping." );
					}
				}
			}

			$this->log_debug( 'Settings sanitization completed successfully.' );

			// Set success notice for core settings.
			\set_transient( 'ba11yc_core_settings_saved', true, 30 );

			return $sanitized;

		} catch ( \Exception $e ) {
			$this->log_error( 'Error during settings sanitization: ' . $e->getMessage() );
			return array();
		}
	}

	/**
	 * Sanitize external plugin options
	 *
	 * @param mixed $input The input array from the settings form.
	 * @return array The sanitized options array.
	 */
	public function sanitize_external_options( $input ): array {
		$sanitized = array();

		if ( ! is_array( $input ) ) {
			return $sanitized;
		}

		foreach ( $input as $key => $value ) {
			if ( in_array( $value, self::VALID_CHECK_VALUES, true ) ) {
				$sanitized[ \sanitize_text_field( $key ) ] = \sanitize_text_field( $value );
			}
		}

		// Set success notice for external plugin settings.
		\set_transient( 'ba11yc_external_settings_saved', true, 30 );

		return $sanitized;
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
		$all_plugin_info  = $this->registry->get_all_plugin_info();

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

			// Get plugin information from registry.
			$plugin_info = $all_plugin_info[ $block_type ] ?? array();

			// If we have plugin info from registry, use it.
			if ( ! empty( $plugin_info['name'] ) ) {
				$plugin_slug = $plugin_info['slug'] ?? \sanitize_title( $plugin_info['name'] );
			} else {
				// Fallback to namespace-based extraction using registry method.
				$plugin_info = $this->registry->extract_plugin_info_from_block_type( $block_type );
				$plugin_slug = $plugin_info['slug'];
			}

			if ( ! isset( $external_plugins[ $plugin_slug ] ) ) {
				$external_plugins[ $plugin_slug ] = array(
					'name'    => $plugin_info['name'] ?? '',
					'version' => $plugin_info['version'] ?? '',
					'file'    => $plugin_info['file'] ?? '',
					'blocks'  => array(),
				);
			}

			$external_plugins[ $plugin_slug ]['blocks'][ $block_type ] = $checks;
		}

		return $external_plugins;
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
	 * Register meta check settings for all post types
	 *
	 * @return void
	 */
	private function register_meta_check_settings(): void {
		$meta_registry   = \BlockAccessibility\MetaChecksRegistry::get_instance();
		$all_meta_checks = $meta_registry->get_all_meta_checks();

		foreach ( $all_meta_checks as $post_type => $meta_fields ) {
			$this->register_post_type_settings( $post_type );
		}
	}

	/**
	 * Register editor check settings for all post types
	 *
	 * @return void
	 */
	private function register_editor_check_settings(): void {
		$editor_registry   = \BlockAccessibility\EditorChecksRegistry::get_instance();
		$all_editor_checks = $editor_registry->get_all_editor_checks();

		foreach ( $all_editor_checks as $post_type => $checks ) {
			$this->register_post_type_settings( $post_type );
		}
	}

	/**
	 * Helper to register settings for a post type (shared by meta and editor checks)
	 *
	 * @param string $post_type The post type.
	 * @return void
	 */
	private function register_post_type_settings( string $post_type ): void {
		$option_group = 'block_checks_meta_' . $post_type . '_group';
		$option_name  = 'block_checks_meta_' . $post_type;

		\register_setting(
			$option_group,
			$option_name,
			array(
				'sanitize_callback' => array( $this, 'sanitize_meta_check_options' ),
			)
		);
	}

	/**
	 * Sanitize meta check options
	 *
	 * @param array $options The options to sanitize.
	 * @return array Sanitized options.
	 */
	public function sanitize_meta_check_options( array $options ): array {
		$sanitized = array();

		foreach ( $options as $key => $value ) {
			// Only allow valid check values.
			if ( in_array( $value, self::VALID_CHECK_VALUES, true ) ) {
				$sanitized[ $key ] = $value;
			}
		}

		return $sanitized;
	}

	/**
	 * Render core settings content
	 *
	 * @return void
	 */
	private function render_core_settings_content(): void {
		// Render core block checks with individual check settings.
		$this->render_core_block_checks();
	}

	/**
	 * Render core block checks with individual check settings
	 *
	 * Derives the list of core blocks from the registry to ensure automatic
	 * synchronization when new core blocks are added to CoreBlockChecks.
	 *
	 * @return void
	 */
	private function render_core_block_checks(): void {
		// Get all checks from registry - single source of truth.
		$all_checks = $this->registry->get_all_checks();

		foreach ( $all_checks as $block_type => $checks ) {
			// Only process core blocks.
			if ( strpos( $block_type, 'core/' ) !== 0 ) {
				continue;
			}

			if ( empty( $checks ) ) {
				continue;
			}

			$block_label = $this->get_core_block_label( $block_type );
			$block_slug  = str_replace( '/', '-', $block_type );

			echo '<article class="ba11y-block-options ba11y-block-options-' . \esc_attr( $block_slug ) . '">';
			echo '<h2>' . \esc_html( $block_label ) . '</h2>';

			// Special handling for heading block - render heading level options first.
			if ( 'core/heading' === $block_type ) {
				$this->render_heading_level_options();
			}

			$this->render_core_block_options( $block_type, $checks );

			echo '</article>';
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
		$this->render_block_options( $block_type, $checks, 'block_checks_options' );
	}

	/**
	 * Render external plugin settings content
	 *
	 * @param array  $plugin_data Plugin data array.
	 * @param string $plugin_slug Plugin slug.
	 * @return void
	 */
	private function render_external_plugin_settings_content( array $plugin_data, string $plugin_slug ): void {

		foreach ( $plugin_data['blocks'] as $block_type => $checks ) {
			$block_name = $this->get_block_display_name( $block_type );
			$block_slug = str_replace( '/', '-', $block_type );
			echo '<article class="ba11y-block-options ba11y-block-options-' . \esc_attr( $block_slug ) . '">';
			echo '<h2>' . \esc_html( $block_name ) . '</h2>';

			$this->render_external_block_options(
				array(
					'block_type'  => $block_type,
					'plugin_slug' => $plugin_slug,
					'checks'      => $checks,
				)
			);

			echo '</article>';
		}

		// Render meta checks for this plugin if any exist.
		$this->render_meta_checks_for_plugin( $plugin_slug );

		// Render editor checks for this plugin if any exist.
		$this->render_editor_checks_for_plugin( $plugin_slug );
	}

	/**
	 * Unified settings page layout handler
	 *
	 * This method provides a single point for rendering all settings pages,
	 * reducing code duplication and making maintenance easier.
	 *
	 * @param string        $title Page title.
	 * @param string        $option_group Settings option group name.
	 * @param string        $version Optional version string.
	 * @param callable|null $content_renderer Callback function to render page content.
	 * @param array         $callback_args Optional arguments to pass to the content renderer.
	 * @return void
	 */
	private function render_settings_page( string $title, string $option_group, string $version = '', ?callable $content_renderer = null, array $callback_args = array() ): void {
		// Permission check.
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		echo '<div class="ba11y-settings">' . "\n";
		echo '<div class="ba11y-settings-container">' . "\n";

		echo '<header class="ba11y-settings-header">' . "\n";
		echo '<h1>Block Accessibility & Validation Checks</h1>' . "\n";
		echo '<p>Configure accessibility checks and validations for block attributes and meta fields</p>' . "\n";
		echo '</header>' . "\n";

		echo '<section class="ba11y-settings-section">' . "\n";
		echo '<form class="ba11y-settings-form" action="options.php" method="post">' . "\n";
		echo '<div class="ba11y-settings-plugin-header">' . "\n";
		echo '<h2>' . \esc_html( $title ) . '</h2>' . "\n";
		// Display plugin version if available.
		if ( ! empty( $version ) ) {
			echo '<p class="plugin-version">' . \esc_html__( 'Version:', 'block-accessibility-checks' ) . ' ' . \esc_html( $version ) . '</p>' . "\n";
		}
		echo '</div>' . "\n";

		// Display success notices after plugin header.
		$this->display_settings_notices();

		\settings_fields( $option_group );

		// Render page-specific content.
		if ( is_callable( $content_renderer ) ) {
			if ( ! empty( $callback_args ) ) {
				call_user_func_array( $content_renderer, $callback_args );
			} else {
				call_user_func( $content_renderer );
			}
		}

		echo '<div class="ba11y-settings-submit">' . "\n";
		\submit_button();
		echo '</div>' . "\n";

		echo '</form>' . "\n";
		echo '</section>' . "\n";
		echo '</div>' . "\n";
		echo '</div>' . "\n";
	}

	/**
	 * Render block options with individual check settings (shared method)
	 *
	 * @param string $block_type The block type.
	 * @param array  $checks     The checks for this block.
	 * @param string $option_name The option name to get/set values.
	 * @return void
	 */
	private function render_block_options( string $block_type, array $checks, string $option_name ): void {
		$options = \get_option( $option_name, array() );

		foreach ( $checks as $check_name => $check_config ) {
			// Only show checks that are using settings (not forced).
			if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
				continue;
			}

			$field_name = $block_type . '_' . $check_name;
			$value      = $options[ $field_name ] ?? 'error';

			// Generate a user-friendly label for the check.
			$desc     = $check_config['description'];
			$label_id = \sanitize_title( $field_name ) . '-label';

			echo '<div class="ba11y-block-single-option" role="group" aria-labelledby="' . \esc_attr( $label_id ) . '">';
			echo '<div class="ba11y-field-group">';
			echo '<div class="ba11y-field-label">';
			echo '<p id="' . \esc_attr( $label_id ) . '">' . \esc_html( $desc ) . '</p>';
			echo '</div>';
			echo '<div class="ba11y-field-controls ba11y-field-controls--radio">';

			// Error option.
			$error_id = \esc_attr( $field_name . '_error' );
			echo '<input type="radio" id="' . \esc_attr( $error_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="error" ' . \checked( $value, 'error', false ) . '>';
			echo '<label for="' . \esc_attr( $error_id ) . '" class="ba11y-button">' . \esc_html__( 'Error', 'block-accessibility-checks' ) . '</label>';

			// Warning option.
			$warning_id = \esc_attr( $field_name . '_warning' );
			echo '<input type="radio" id="' . \esc_attr( $warning_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="warning" ' . \checked( $value, 'warning', false ) . '>';
			echo '<label for="' . \esc_attr( $warning_id ) . '" class="ba11y-button">' . \esc_html__( 'Warning', 'block-accessibility-checks' ) . '</label>';

			// None option.
			$none_id = \esc_attr( $field_name . '_none' );
			echo '<input type="radio" id="' . \esc_attr( $none_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="none" ' . \checked( $value, 'none', false ) . '>';
			echo '<label for="' . \esc_attr( $none_id ) . '" class="ba11y-button">' . \esc_html__( 'None', 'block-accessibility-checks' ) . '</label>';

			echo '</div>';
			echo '</div>';
			echo '</div>';
		}
	}

	/**
	 * Get display label for a core block type
	 *
	 * Returns a translated label for core blocks, with fallback to
	 * auto-generated label for any blocks not in the predefined list.
	 *
	 * @param string $block_type The block type.
	 * @return string The display label.
	 */
	private function get_core_block_label( string $block_type ): string {
		$labels = array(
			'core/button'  => __( 'Button Block', 'block-accessibility-checks' ),
			'core/heading' => __( 'Heading Block', 'block-accessibility-checks' ),
			'core/image'   => __( 'Image Block', 'block-accessibility-checks' ),
			'core/table'   => __( 'Table Block', 'block-accessibility-checks' ),
		);

		return $labels[ $block_type ] ?? $this->get_block_display_name( $block_type );
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
	 * Display settings notices within the settings page
	 *
	 * Shows success notices when settings are saved successfully.
	 * This method is called from within the settings page layout.
	 *
	 * @return void
	 */
	private function display_settings_notices(): void {
		// Check for core settings success notice.
		if ( \get_transient( 'ba11yc_core_settings_saved' ) ) {
			\delete_transient( 'ba11yc_core_settings_saved' );
			echo '<div class="notice notice-success is-dismissible ba11y-settings-notice">' . "\n";
			echo '<p><strong>' . \esc_html__( 'Settings saved successfully!', 'block-accessibility-checks' ) . '</strong></p>' . "\n";
			echo '</div>' . "\n";
		}

		// Check for external plugin settings success notice.
		if ( \get_transient( 'ba11yc_external_settings_saved' ) ) {
			\delete_transient( 'ba11yc_external_settings_saved' );
			echo '<div class="notice notice-success is-dismissible ba11y-settings-notice">' . "\n";
			echo '<p><strong>' . \esc_html__( 'Settings saved successfully!', 'block-accessibility-checks' ) . '</strong></p>' . "\n";
			echo '</div>' . "\n";
		}
	}

	/**
	 * Render meta checks for a specific plugin
	 *
	 * This method renders all meta checks associated with a plugin's post types.
	 * Meta checks are grouped by post type and meta key.
	 *
	 * @param string $plugin_slug The plugin slug.
	 * @return void
	 */
	private function render_meta_checks_for_plugin( string $plugin_slug ): void {
		$meta_registry   = \BlockAccessibility\MetaChecksRegistry::get_instance();
		$all_meta_checks = $meta_registry->get_all_meta_checks();

		if ( empty( $all_meta_checks ) ) {
			return;
		}

		// Render meta checks for each post type.
		foreach ( $all_meta_checks as $post_type => $meta_fields ) {
			if ( empty( $meta_fields ) ) {
				continue;
			}

			$this->render_meta_checks_for_post_type( $post_type, $meta_fields, $plugin_slug );
		}
	}

	/**
	 * Render meta checks for a specific post type
	 *
	 * @param string $post_type   The post type.
	 * @param array  $meta_fields The meta fields with checks.
	 * @param string $plugin_slug The plugin slug.
	 * @return void
	 */
	private function render_meta_checks_for_post_type( string $post_type, array $meta_fields, string $plugin_slug ): void {
		$post_type_label = $this->get_post_type_label( $post_type );

		echo '<div class="ba11y-settings-plugin-header">' . "\n";
		echo '<h2>' . \esc_html__( 'Post Meta Validation', 'block-accessibility-checks' ) . '</h2>';
		echo '</div>' . "\n";

		echo '<article class="ba11y-block-options ba11y-meta-options ba11y-meta-options-' . \esc_attr( $post_type ) . '">';
		echo '<h2>' . \esc_html( $post_type_label ) . ' ' . \esc_html__( 'Post Type', 'block-accessibility-checks' ) . '</h2>';

		foreach ( $meta_fields as $meta_key => $checks ) {
			$this->render_meta_field_checks( $post_type, $meta_key, $checks, $plugin_slug );
		}

		echo '</article>';
	}

	/**
	 * Render editor checks for a specific plugin
	 *
	 * @param string $plugin_slug The plugin slug.
	 * @return void
	 */
	private function render_editor_checks_for_plugin( string $plugin_slug ): void {
		$editor_registry   = \BlockAccessibility\EditorChecksRegistry::get_instance();
		$all_editor_checks = $editor_registry->get_all_editor_checks();

		if ( empty( $all_editor_checks ) ) {
			return;
		}

		// Render editor checks for each post type.
		foreach ( $all_editor_checks as $post_type => $checks ) {
			if ( empty( $checks ) ) {
				continue;
			}

			$this->render_editor_checks_for_post_type( $post_type, $checks, $plugin_slug );
		}
	}

	/**
	 * Render editor checks for a specific post type
	 *
	 * @param string $post_type   The post type.
	 * @param array  $checks      The checks.
	 * @param string $plugin_slug The plugin slug.
	 * @return void
	 */
	private function render_editor_checks_for_post_type( string $post_type, array $checks, string $plugin_slug ): void {
		$post_type_label = $this->get_post_type_label( $post_type );

		echo '<div class="ba11y-settings-plugin-header">' . "\n";
		echo '<h2>' . \esc_html__( 'Editor Validation', 'block-accessibility-checks' ) . '</h2>';
		echo '</div>' . "\n";

		echo '<article class="ba11y-block-options ba11y-editor-options ba11y-editor-options-' . \esc_attr( $post_type ) . '">';
		echo '<h2>' . \esc_html( $post_type_label ) . ' ' . \esc_html__( 'Post Type', 'block-accessibility-checks' ) . '</h2>';

		// Use external plugin option name if provided, otherwise use post type option.
		if ( ! empty( $plugin_slug ) ) {
			$option_name = 'block_checks_external_' . $plugin_slug;
		} else {
			$option_name = 'block_checks_meta_' . $post_type;
		}

		foreach ( $checks as $check_name => $check ) {
			// Only render settings-based checks.
			if ( 'settings' !== $check['type'] ) {
				continue;
			}

			$field_name  = 'editor_' . $check_name;
			$description = $check['description'] ?? $check['error_msg'];

			// Prepend context.
			$description = '<strong>' . \esc_html__( 'Editor Check', 'block-accessibility-checks' ) . ':</strong> ' . $description;

			$this->render_check_setting( $field_name, $description, $check, $option_name );
		}

		echo '</article>';
	}

	/**
	 * Render checks for a specific meta field
	 *
	 * @param string $post_type   The post type.
	 * @param string $meta_key    The meta key.
	 * @param array  $checks      The checks for this meta field.
	 * @param string $plugin_slug Optional plugin slug for external plugins.
	 * @return void
	 */
	private function render_meta_field_checks( string $post_type, string $meta_key, array $checks, string $plugin_slug = '' ): void {
		$meta_label = $this->format_meta_key_label( $meta_key );

		// Use external plugin option name if provided, otherwise use post type option.
		if ( ! empty( $plugin_slug ) ) {
			$option_name = 'block_checks_external_' . $plugin_slug;
		} else {
			$option_name = 'block_checks_meta_' . $post_type;
		}

		echo '<div class="ba11y-meta-field">';

		foreach ( $checks as $check_name => $check ) {
			// Only render settings-based checks (not forced error/warning).
			if ( 'settings' !== $check['type'] ) {
				continue;
			}

			$field_name  = $meta_key . '_' . $check_name;
			$description = $check['description'] ?? $check['error_msg'];

			// Prepend meta label to description with strong tag.
			$description = '<strong>' . $meta_label . ':</strong> ' . $description;

			$this->render_check_setting( $field_name, $description, $check, $option_name );
		}

		echo '</div>';
	}

	/**
	 * Render a single check setting field
	 *
	 * @param string $field_name  The field name.
	 * @param string $description The check description.
	 * @param array  $check       The check configuration.
	 * @param string $option_name The option name for this group.
	 * @return void
	 */
	private function render_check_setting( string $field_name, string $description, array $check, string $option_name ): void {
		$options  = \get_option( $option_name, array() );
		$value    = $options[ $field_name ] ?? 'error';
		$label_id = \sanitize_title( $field_name ) . '-label';

		echo '<div class="ba11y-block-single-option" role="group" aria-labelledby="' . \esc_attr( $label_id ) . '">';
		echo '<div class="ba11y-field-group">';
		echo '<div class="ba11y-field-label">';
		echo '<p id="' . \esc_attr( $label_id ) . '">' . \wp_kses(
			$description,
			array(
				'strong' => array(),
				'em'     => array(),
			)
		) . '</p>';
		echo '</div>';
		echo '<div class="ba11y-field-controls ba11y-field-controls--radio">';

		// Error option.
		$error_id = \esc_attr( $field_name . '_error' );
		echo '<input type="radio" id="' . \esc_attr( $error_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="error" ' . \checked( $value, 'error', false ) . '>';
		echo '<label for="' . \esc_attr( $error_id ) . '" class="ba11y-button">' . \esc_html__( 'Error', 'block-accessibility-checks' ) . '</label>';

		// Warning option.
		$warning_id = \esc_attr( $field_name . '_warning' );
		echo '<input type="radio" id="' . \esc_attr( $warning_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="warning" ' . \checked( $value, 'warning', false ) . '>';
		echo '<label for="' . \esc_attr( $warning_id ) . '" class="ba11y-button">' . \esc_html__( 'Warning', 'block-accessibility-checks' ) . '</label>';

		// None option.
		$none_id = \esc_attr( $field_name . '_none' );
		echo '<input type="radio" id="' . \esc_attr( $none_id ) . '" name="' . \esc_attr( $option_name ) . '[' . \esc_attr( $field_name ) . ']" value="none" ' . \checked( $value, 'none', false ) . '>';
		echo '<label for="' . \esc_attr( $none_id ) . '" class="ba11y-button">' . \esc_html__( 'None', 'block-accessibility-checks' ) . '</label>';

		echo '</div>';
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Get display label for a post type
	 *
	 * @param string $post_type The post type.
	 * @return string The display label.
	 */
	private function get_post_type_label( string $post_type ): string {
		$post_type_object = \get_post_type_object( $post_type );

		if ( $post_type_object && ! empty( $post_type_object->labels->singular_name ) ) {
			return $post_type_object->labels->singular_name;
		}

		return ucwords( str_replace( array( '-', '_' ), ' ', $post_type ) );
	}

	/**
	 * Format meta key into a readable label
	 *
	 * @param string $meta_key The meta key.
	 * @return string The formatted label.
	 */
	private function format_meta_key_label( string $meta_key ): string {
		// Remove common prefixes.
		$label = preg_replace( '/^(post_|meta_|custom_)/', '', $meta_key );

		// Convert underscores and hyphens to spaces and capitalize.
		$label = ucwords( str_replace( array( '_', '-' ), ' ', $label ) );

		return $label;
	}
}
