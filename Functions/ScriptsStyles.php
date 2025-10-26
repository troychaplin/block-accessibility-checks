<?php
/**
 * Namespace declaration for the BlockAccessibility plugin.
 *
 * This namespace is used to encapsulate all functionality related to
 * the Block Accessibility Checks plugin, ensuring that classes, functions,
 * and constants do not conflict with other plugins or themes.
 *
 * @package BlockAccessibility
 */

namespace BlockAccessibility;

/**
 * Class ScriptsStyles
 *
 * This class is responsible for managing the registration and enqueueing
 * of scripts and styles within the Block Accessibility Checks plugin.
 *
 * @package BlockAccessibilityChecks
 */
class ScriptsStyles {
	/**
	 * The path to the plugin file.
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * The translations object.
	 *
	 * @var Translations
	 */
	private $translations;

	/**
	 * Constructs a new instance of the ScriptsStyles class.
	 *
	 * @param string       $plugin_file The path to the plugin file.
	 * @param Translations $translations The translations object.
	 */
	public function __construct( string $plugin_file, Translations $translations ) {
		$this->plugin_file  = $plugin_file;
		$this->translations = $translations;
	}

	/**
	 * Enqueues the assets for the block.
	 *
	 * This method is responsible for enqueueing the necessary scripts and styles for the block.
	 * It sets up script translations and then calls the methods to enqueue the block scripts and styles.
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		// Only run in post editor, not site editor.
		// Check if we're in the site editor by checking the current screen.
		$current_screen = \get_current_screen();
		if ( $current_screen && 'appearance_page_gutenberg-edit-site' === $current_screen->id ) {
			return;
		}

		$script_handle = 'block-accessibility-script';
		$this->translations->setup_script_translations( $script_handle );

		$this->enqueue_block_scripts();
		$this->enqueue_block_styles();
	}

	/**
	 * Enqueues the admin assets.
	 *
	 * This method is responsible for enqueueing the necessary scripts and styles for the admin area.
	 * It sets up script translations and enqueues admin styles.
	 *
	 * @return void
	 */
	public function enqueue_admin_assets() {
		$script_handle = 'block-accessibility-script';
		$this->translations->setup_script_translations( $script_handle );

		$this->enqueue_admin_styles();
	}

	/**
	 * Enqueues the block scripts for the plugin.
	 *
	 * This function is responsible for enqueueing the necessary JavaScript scripts for the plugin's blocks.
	 * It registers the script handle, script path, dependencies, version, and localization data.
	 *
	 * @access private
	 * @return void
	 */
	private function enqueue_block_scripts() {
		$script_path   = 'build/block-checks.js';
		$script_handle = 'block-accessibility-script';

		wp_enqueue_script(
			$script_handle,
			plugins_url( $script_path, $this->plugin_file ),
			array( 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-data', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins' ),
			BA11YC_VERSION,
			true
		);

		/**
		 * Retrieves the block checks options from the database.
		 *
		 * @return array The block checks options.
		 */
		$block_checks_options = get_option( 'block_checks_options', array() );

		// Get the block checks registry to expose validation rules to JavaScript.
		$registry         = \BlockAccessibility\BlockChecksRegistry::get_instance();
		$validation_rules = $this->prepare_validation_rules_for_js( $registry );

		\wp_localize_script(
			$script_handle,
			'BlockAccessibilityChecks',
			array(
				'blockChecksOptions' => $block_checks_options,
				'validationRules'    => $validation_rules,
			)
		);
	}

	/**
	 * Enqueues the block styles.
	 *
	 * This function is responsible for enqueueing the block styles for the plugin.
	 * It uses the `wp_enqueue_style` function to enqueue the styles.
	 *
	 * @access private
	 * @return void
	 */
	private function enqueue_block_styles() {
		$style_path = 'build/block-checks.css';

		// Enqueue the main stylesheet.
		wp_enqueue_style(
			'block-checks-style',
			plugins_url( $style_path, $this->plugin_file ),
			array(),
			BA11YC_VERSION
		);

		// Dynamically generate the SVG URLs.
		$warning_icon_url = plugins_url( 'src/assets/universal-access-warning.svg', $this->plugin_file );
		$error_icon_url   = plugins_url( 'src/assets/universal-access-error.svg', $this->plugin_file );

		// Add the SVG URLs as CSS variables for warning and error icons.
		$inline_css = "
			:root {
				--a11y-warning-icon: url('{$warning_icon_url}');
				--a11y-error-icon: url('{$error_icon_url}');
			}
		";

		wp_add_inline_style( 'block-checks-style', $inline_css );
	}

	/**
	 * Enqueues the admin styles for the block accessibility checks.
	 *
	 * This function is responsible for enqueueing the admin styles for the block accessibility checks.
	 * It uses the `wp_enqueue_style` function to enqueue the 'block-checks-admin' style.
	 *
	 * @access private
	 */
	private function enqueue_admin_styles() {
		$style_path = 'build/block-admin.css';
		wp_enqueue_style(
			'block-checks-admin',
			plugins_url( $style_path, $this->plugin_file ),
			array(),
			BA11YC_VERSION
		);
	}

	/**
	 * Prepare validation rules from PHP registry for JavaScript consumption
	 *
	 * Converts the PHP BlockChecksRegistry data into a format that JavaScript
	 * can use for client-side validation, excluding server-side callbacks.
	 *
	 * @param BlockChecksRegistry $registry The block checks registry instance.
	 * @return array Prepared validation rules for JavaScript.
	 */
	private function prepare_validation_rules_for_js( BlockChecksRegistry $registry ): array {
		$all_checks = $registry->get_all_checks();
		$js_rules   = array();

		foreach ( $all_checks as $block_type => $checks ) {
			$js_rules[ $block_type ] = array();

			foreach ( $checks as $check_name => $check_config ) {
				// Get the effective check level (considering settings).
				$effective_type = $registry->get_effective_check_level( $block_type, $check_name );

				// Skip checks set to 'none'.
				if ( 'none' === $effective_type ) {
					continue;
				}

				// Only include configuration that JavaScript needs.
				$js_rules[ $block_type ][ $check_name ] = array(
					'error_msg'   => $check_config['error_msg'],
					'warning_msg' => $check_config['warning_msg'],
					'type'        => $effective_type, // Use effective type instead of config type.
					'category'    => $check_config['category'] ?? 'accessibility', // Include category field.
					'priority'    => $check_config['priority'],
					'enabled'     => $check_config['enabled'],
					'description' => $check_config['description'],
				);
			}
		}

		return $js_rules;
	}
}
