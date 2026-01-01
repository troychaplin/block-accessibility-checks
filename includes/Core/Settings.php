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

namespace BlockAccessibility\Core;

use BlockAccessibility\Core\Traits\Logger;
use BlockAccessibility\Block\Registry as BlockChecksRegistry;
use BlockAccessibility\Meta\Registry as MetaChecksRegistry;
use BlockAccessibility\Editor\Registry as EditorChecksRegistry;

/**
 * Class Settings
 *
 * This class is responsible for managing the settings page functionality
 * within the Block Accessibility Checks plugin. It provides methods and
 * properties to handle the configuration and display of the settings page.
 *
 * @package BlockAccessibilityChecks\Functions
 */
class Settings {

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
			\esc_html__( 'Accessibility & Validation', 'block-accessibility-checks' ),
			\esc_html__( 'Accessibility & Validation', 'block-accessibility-checks' ),
			'manage_options',
			'block-a11y-checks',
			array( $this, 'settings_page_layout' ),
			'dashicons-universal-access',
			81
		);

		// Add Core Block Checks submenu.
		\add_submenu_page(
			'block-a11y-checks',
			\esc_html__( 'Core Block Validations', 'block-accessibility-checks' ),
			\esc_html__( 'Core Block Validations', 'block-accessibility-checks' ),
			'manage_options',
			'block-a11y-checks',
			array( $this, 'settings_page_layout' )
		);

		// Add Post & Page Validation submenu if there are any meta or editor checks.
		$this->add_post_page_validation_menu();

		// Add external plugin submenus.
		$this->add_external_plugin_menus();
	}

	/**
	 * Add Post & Page Validation submenu if there are checks
	 *
	 * @return void
	 */
	private function add_post_page_validation_menu(): void {
		$meta_registry   = MetaChecksRegistry::get_instance();
		$editor_registry = EditorChecksRegistry::get_instance();

		$all_meta_checks   = $meta_registry->get_all_meta_checks();
		$all_editor_checks = $editor_registry->get_all_editor_checks();

		// Check if there are any meta or editor checks for core post types (post, page).
		$core_post_types        = array( 'post', 'page' );
		$has_core_meta_checks   = false;
		$has_core_editor_checks = false;

		foreach ( $core_post_types as $post_type ) {
			if ( ! empty( $all_meta_checks[ $post_type ] ) ) {
				$has_core_meta_checks = true;
			}
			if ( ! empty( $all_editor_checks[ $post_type ] ) ) {
				$has_core_editor_checks = true;
			}
		}

		// Only add menu if there are checks to display.
		if ( $has_core_meta_checks || $has_core_editor_checks ) {
			\add_submenu_page(
				'block-a11y-checks',
				\esc_html__( 'Editor Validation', 'block-accessibility-checks' ),
				\esc_html__( 'Editor Validation', 'block-accessibility-checks' ),
				'manage_options',
				'block-a11y-checks-post-page',
				array( $this, 'post_page_validation_settings_page' )
			);
		}
	}

	/**
	 * Render Post & Page Validation settings page
	 *
	 * Uses React app instead of PHP-rendered form.
	 *
	 * @return void
	 */
	public function post_page_validation_settings_page(): void {
		// Permission check.
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		// Enqueue React app.
		$this->enqueue_react_editor_validation_app();

		// Get settings data to pass to React.
		$settings_data = $this->get_editor_validation_settings_data();

		// Render React root.
		echo '<div class="wrap">';
		echo '<div id="ba11y-editor-validation-settings-root"></div>';
		echo '</div>';

		// Pass data to JavaScript.
		\wp_add_inline_script(
			'ba11y-settings-editor-validation-script',
			'window.ba11yEditorValidationSettings = ' . \wp_json_encode( $settings_data ) . ';',
			'before'
		);
	}

	/**
	 * Renders the settings page layout for core blocks.
	 *
	 * Uses React app instead of PHP-rendered form.
	 *
	 * @return void
	 */
	public function settings_page_layout(): void {
		// Permission check.
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		// Enqueue React app.
		$this->enqueue_react_settings_app();

		// Get settings data to pass to React.
		$settings_data = $this->get_core_blocks_settings_data();

		// Render React root.
		echo '<div class="wrap">';
		echo '<div id="ba11y-core-blocks-settings-root"></div>';
		echo '</div>';

		// Pass data to JavaScript.
		\wp_add_inline_script(
			'ba11y-settings-core-blocks-script',
			'window.ba11yCoreBlockSettings = ' . \wp_json_encode( $settings_data ) . ';',
			'before'
		);
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

		// Enqueue React app.
		$this->enqueue_react_external_plugin_app();

		// Get settings data to pass to React.
		$settings_data = $this->get_external_plugin_settings_data( $plugin_slug, $plugin_data );

		// Render React root.
		echo '<div class="wrap">';
		echo '<div id="ba11y-external-plugin-settings-root"></div>';
		echo '</div>';

		// Pass data to JavaScript.
		\wp_add_inline_script(
			'ba11y-settings-external-plugins-script',
			'window.ba11yExternalPluginSettings = ' . \wp_json_encode( $settings_data ) . ';',
			'before'
		);
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
			// Get existing options to preserve values not in the current form submission.
			$existing_options = \get_option( 'block_checks_options', array() );
			$sanitized        = $existing_options;

			if ( ! is_array( $input ) ) {
				$this->log_error( 'Settings input is not an array. Returning existing options.' );
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
			// Return existing options on error to prevent data loss.
			return \get_option( 'block_checks_options', array() );
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
	 * Sanitize site editor validation options
	 *
	 * Handles sanitization of site editor-specific validation settings.
	 * Currently supports a global enabled/disabled flag. Future versions
	 * will support per-block-type validation control.
	 *
	 * @param mixed $input The input array from the settings form.
	 * @return array The sanitized options array.
	 */
	public function sanitize_site_editor_options( $input ): array {
		$sanitized = array(
			'enabled' => true,
		);

		if ( ! is_array( $input ) ) {
			return $sanitized;
		}

		// Sanitize global enabled flag.
		if ( isset( $input['enabled'] ) ) {
			$sanitized['enabled'] = (bool) $input['enabled'];
		}

		// Future: Per-block-type settings will be handled here.
		// Example structure:
		// 'block_types' => array(
		// 'core/heading' => 'error',
		// 'core/image' => 'warning',
		// 'core/button' => 'none',
		// ).
		if ( isset( $input['block_types'] ) && is_array( $input['block_types'] ) ) {
			$sanitized['block_types'] = array();
			foreach ( $input['block_types'] as $block_type => $level ) {
				if ( in_array( $level, self::VALID_CHECK_VALUES, true ) ) {
					$sanitized['block_types'][ \sanitize_text_field( $block_type ) ] = \sanitize_text_field( $level );
				}
			}
		}

		// Set success notice for site editor settings.
		\set_transient( 'ba11yc_site_editor_settings_saved', true, 30 );

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

		// Set success notice for post/page settings.
		\set_transient( 'ba11yc_post_page_settings_saved', true, 30 );

		return $sanitized;
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

	/**
	 * Enqueue React settings app
	 *
	 * @return void
	 */
	private function enqueue_react_settings_app(): void {
		$script_path  = 'build/settings-core-blocks.js';
		$style_path   = 'build/settings-core-blocks.css';
		$asset_file   = dirname( __DIR__, 2 ) . '/build/settings-core-blocks.asset.php';
		$dependencies = array();
		$version      = BA11YC_VERSION;

		if ( file_exists( $asset_file ) ) {
			$asset        = require $asset_file;
			$dependencies = $asset['dependencies'] ?? array();
			$version      = $asset['version'] ?? $version;
		}

		\wp_enqueue_script(
			'ba11y-settings-core-blocks-script',
			\plugins_url( $script_path, dirname( __DIR__, 2 ) . '/block-accessibility-checks.php' ),
			$dependencies,
			$version,
			true
		);

		\wp_enqueue_style(
			'ba11y-settings-core-blocks-style',
			\plugins_url( $style_path, dirname( __DIR__, 2 ) . '/block-accessibility-checks.php' ),
			array( 'wp-components' ),
			$version
		);
	}

	/**
	 * Get core blocks settings data for React app
	 *
	 * @return array Settings data array.
	 */
	private function get_core_blocks_settings_data(): array {
		$all_checks = $this->registry->get_all_checks();
		$options    = \get_option( 'block_checks_options', array() );
		$blocks     = array();

		foreach ( $all_checks as $block_type => $checks ) {
			// Only process core blocks.
			if ( strpos( $block_type, 'core/' ) !== 0 ) {
				continue;
			}

			if ( empty( $checks ) ) {
				continue;
			}

			$block_label  = $this->get_core_block_label( $block_type );
			$block_checks = array();

			foreach ( $checks as $check_name => $check_config ) {
				// Only include checks that are using settings (not forced).
				if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
					continue;
				}

				$field_name = $block_type . '_' . $check_name;
				$value      = $options[ $field_name ] ?? 'error';

				$block_checks[] = array(
					'name'        => $check_name,
					'fieldName'   => $field_name,
					'description' => $check_config['description'],
					'category'    => $check_config['category'] ?? 'accessibility',
					'value'       => $value,
				);
			}

			$blocks[] = array(
				'blockType' => $block_type,
				'label'     => $block_label,
				'checks'    => $block_checks,
			);
		}

		// Get heading levels.
		$heading_levels = $options['core_heading_levels'] ?? array();

		return array(
			'success'  => true,
			'settings' => array(
				'blocks'        => $blocks,
				'headingLevels' => $heading_levels,
			),
		);
	}

	/**
	 * Enqueue React editor validation app
	 *
	 * @return void
	 */
	private function enqueue_react_editor_validation_app(): void {
		$script_path  = 'build/settings-editor-validation.js';
		$style_path   = 'build/settings-editor-validation.css';
		$asset_file   = dirname( __DIR__, 2 ) . '/build/settings-editor-validation.asset.php';
		$dependencies = array();
		$version      = BA11YC_VERSION;

		if ( file_exists( $asset_file ) ) {
			$asset        = require $asset_file;
			$dependencies = $asset['dependencies'] ?? array();
			$version      = $asset['version'] ?? $version;
		}

		\wp_enqueue_script(
			'ba11y-settings-editor-validation-script',
			\plugins_url( $script_path, dirname( __DIR__, 2 ) . '/block-accessibility-checks.php' ),
			$dependencies,
			$version,
			true
		);

		\wp_enqueue_style(
			'ba11y-settings-editor-validation-style',
			\plugins_url( $style_path, dirname( __DIR__, 2 ) . '/block-accessibility-checks.php' ),
			array( 'wp-components' ),
			$version
		);
	}

	/**
	 * Get editor validation settings data for React app
	 *
	 * @return array Settings data array.
	 */
	private function get_editor_validation_settings_data(): array {
		$meta_registry   = MetaChecksRegistry::get_instance();
		$editor_registry = EditorChecksRegistry::get_instance();

		$all_meta_checks   = $meta_registry->get_all_meta_checks();
		$all_editor_checks = $editor_registry->get_all_editor_checks();

		$core_post_types = array( 'post', 'page' );
		$post_types      = array();

		foreach ( $core_post_types as $post_type ) {
			$has_meta   = ! empty( $all_meta_checks[ $post_type ] );
			$has_editor = ! empty( $all_editor_checks[ $post_type ] );

			if ( ! $has_meta && ! $has_editor ) {
				continue;
			}

			$post_type_label = $this->get_post_type_label( $post_type );
			$checks          = array();

			// Get editor checks for this post type.
			if ( $has_editor ) {
				$option_name = 'block_checks_meta_' . $post_type;
				$options     = \get_option( $option_name, array() );

				foreach ( $all_editor_checks[ $post_type ] as $check_name => $check ) {
					// Only include settings-based checks.
					if ( 'settings' !== $check['type'] ) {
						continue;
					}

					$field_name  = 'editor_' . $check_name;
					$description = $check['description'] ?? $check['error_msg'];
					$value       = $options[ $field_name ] ?? 'error';

					$checks[] = array(
						'name'        => $check_name,
						'fieldName'   => $field_name,
						'postType'    => $post_type,
						'description' => $description,
						'category'    => 'validation',
						'value'       => $value,
					);
				}
			}

			// Add post type to the array.
			$post_types[] = array(
				'postType' => $post_type,
				'label'    => $post_type_label,
				'checks'   => $checks,
			);
		}

		return array(
			'success'  => true,
			'settings' => array(
				'postTypes' => $post_types,
			),
		);
	}

	/**
	 * Enqueue React external plugin settings app
	 *
	 * @return void
	 */
	private function enqueue_react_external_plugin_app(): void {
		$asset_file = plugin_dir_path( dirname( __DIR__ ) ) . 'build/settings-external-plugins.asset.php';
		$asset      = file_exists( $asset_file ) ? require $asset_file : array(
			'dependencies' => array(),
			'version'      => '1.0.0',
		);

		\wp_enqueue_script(
			'ba11y-settings-external-plugins-script',
			plugins_url( 'build/settings-external-plugins.js', dirname( __DIR__ ) ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		\wp_enqueue_style(
			'ba11y-settings-external-plugins-style',
			plugins_url( 'build/settings-external-plugins.css', dirname( __DIR__ ) ),
			array( 'wp-components' ),
			$asset['version']
		);
	}

	/**
	 * Get external plugin settings data for React app
	 *
	 * @param string $plugin_slug Plugin slug.
	 * @param array  $plugin_data Plugin data from registry.
	 * @return array Settings data formatted for React.
	 */
	private function get_external_plugin_settings_data( string $plugin_slug, array $plugin_data ): array {
		$option_name = 'block_checks_external_' . $plugin_slug;
		$options     = \get_option( $option_name, array() );
		$blocks      = array();

		// Get block checks.
		foreach ( $plugin_data['blocks'] as $block_type => $checks ) {
			if ( empty( $checks ) ) {
				continue;
			}

			$block_label  = $this->get_block_label( $block_type );
			$block_checks = array();

			foreach ( $checks as $check_name => $check_config ) {
				// Only include checks that are using settings (not forced).
				if ( isset( $check_config['type'] ) && 'settings' !== $check_config['type'] ) {
					continue;
				}

				$field_name = $block_type . '_' . $check_name;
				$value      = $options[ $field_name ] ?? 'error';

				$block_checks[] = array(
					'name'        => $check_name,
					'fieldName'   => $field_name,
					'description' => $check_config['description'],
					'category'    => $check_config['category'] ?? 'accessibility',
					'value'       => $value,
				);
			}

			if ( ! empty( $block_checks ) ) {
				$blocks[] = array(
					'blockType' => $block_type,
					'label'     => $block_label,
					'checks'    => $block_checks,
				);
			}
		}

		// Get meta checks for non-core post types.
		$meta_registry   = MetaChecksRegistry::get_instance();
		$all_meta_checks = $meta_registry->get_all_meta_checks();
		$core_post_types = array( 'post', 'page' );

		foreach ( $all_meta_checks as $post_type => $meta_fields ) {
			// Skip core post types.
			if ( in_array( $post_type, $core_post_types, true ) ) {
				continue;
			}

			if ( empty( $meta_fields ) ) {
				continue;
			}

			$post_type_label = $this->get_post_type_label( $post_type );

			foreach ( $meta_fields as $meta_key => $checks ) {
				foreach ( $checks as $check_name => $check ) {
					// Only include settings-based checks.
					if ( 'settings' !== $check['type'] ) {
						continue;
					}

					$field_name = 'meta_' . $post_type . '_' . $meta_key . '_' . $check_name;
					$value      = $options[ $field_name ] ?? 'error';

					$block_label = ucwords( str_replace( array( '-', '_' ), ' ', $meta_key ) );

					$blocks[] = array(
						'blockType'     => 'meta_' . $post_type . '_' . $meta_key,
						'label'         => $block_label,
						'postType'      => $post_type,
						'postTypeLabel' => $post_type_label,
						'checks'        => array(
							array(
								'name'        => $check_name,
								'fieldName'   => $field_name,
								'description' => $check['description'] ?? $check['error_msg'],
								'category'    => 'validation',
								'value'       => $value,
							),
						),
					);
				}
			}
		}

		// Get editor checks for non-core post types.
		$editor_registry   = EditorChecksRegistry::get_instance();
		$all_editor_checks = $editor_registry->get_all_editor_checks();

		foreach ( $all_editor_checks as $post_type => $checks ) {
			// Skip core post types.
			if ( in_array( $post_type, $core_post_types, true ) ) {
				continue;
			}

			if ( empty( $checks ) ) {
				continue;
			}

			$post_type_label = $this->get_post_type_label( $post_type );

			foreach ( $checks as $check_name => $check ) {
				// Only include settings-based checks.
				if ( 'settings' !== $check['type'] ) {
					continue;
				}

				$field_name = 'editor_' . $post_type . '_' . $check_name;
				$value      = $options[ $field_name ] ?? 'error';

				$blocks[] = array(
					'blockType' => 'editor_' . $post_type,
					'label'     => $post_type_label,
					'checks'    => array(
						array(
							'name'        => $check_name,
							'fieldName'   => $field_name,
							'description' => $check['description'] ?? $check['error_msg'],
							'category'    => 'validation',
							'value'       => $value,
						),
					),
				);
			}
		}

		return array(
			'success'    => true,
			'pluginName' => $plugin_data['name'] ?? '',
			'pluginSlug' => $plugin_slug,
			'settings'   => array(
				'blocks' => $blocks,
			),
		);
	}

	/**
	 * Get display label for a block type
	 *
	 * @param string $block_type The block type.
	 * @return string The display label.
	 */
	private function get_block_label( string $block_type ): string {
		// Try to get the block title from WordPress.
		$block_registry = \WP_Block_Type_Registry::get_instance();
		$block          = $block_registry->get_registered( $block_type );

		if ( $block && ! empty( $block->title ) ) {
			return $block->title;
		}

		// Fallback: Convert block type to display name.
		$parts      = explode( '/', $block_type );
		$block_name = $parts[1] ?? $block_type;
		return ucwords( str_replace( array( '-', '_' ), ' ', $block_name ) );
	}
}
