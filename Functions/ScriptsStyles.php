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
	public function __construct( $plugin_file, Translations $translations ) {
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
		$script_handle = 'block-accessibility-script';
		if ( $this->translations ) {
			$this->translations->setup_script_translations( $script_handle );
		}

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
		if ( $this->translations ) {
			$this->translations->setup_script_translations( $script_handle );
		}

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
			array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ),
			BA11YC_VERSION,
			true
		);

		/**
		 * Retrieves the block checks options from the database.
		 *
		 * @return array The block checks options.
		 */
		$block_checks_options = get_option( 'block_checks_options', array() );

		wp_localize_script(
			$script_handle,
			'BlockAccessibilityChecks',
			array(
				'blockChecksOptions' => $block_checks_options,
				'blocks'             => BlockConfig::get_instance()->get_block_config(),
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
}
