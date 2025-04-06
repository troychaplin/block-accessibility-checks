<?php
/**
 * Namespace declaration for the Block Accessibility plugin.
 *
 * This namespace is used to encapsulate all functionality related to
 * the Block Accessibility Checks plugin, ensuring that classes, functions,
 * and constants do not conflict with other plugins or themes.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility;

/**
 * Class Translations
 *
 * This class is responsible for handling translation-related functionality
 * within the Block Accessibility Checks plugin. It provides methods and
 * utilities to manage and process translations for accessibility checks.
 *
 * @package BlockAccessibilityChecks
 */
class Translations {

	/**
	 * The path to the plugin file.
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * The text domain for translations.
	 *
	 * @var string
	 */
	private $text_domain;

	/**
	 * Constructs a new instance of the Translations class.
	 *
	 * @param string $plugin_file The path to the plugin file.
	 * @param string $text_domain The text domain for translations.
	 */
	public function __construct( $plugin_file, $text_domain ) {
		$this->plugin_file = $plugin_file;
		$this->text_domain = $text_domain;
	}

	/**
	 * Loads the text domain for the plugin.
	 *
	 * This function loads the translation files for the plugin's text domain.
	 * It uses the WordPress function `load_plugin_textdomain()` to load the translation files.
	 *
	 * @return void
	 */
	public function load_text_domain() {
		load_plugin_textdomain( $this->text_domain, false, dirname( plugin_basename( $this->plugin_file ) ) . '/languages/' );
	}

	/**
	 * Sets up translations for a script.
	 *
	 * This method sets up translations for a given script handle by calling the `wp_set_script_translations()` function.
	 * It takes the script handle, text domain, and the path to the languages directory as parameters.
	 *
	 * @param string $script_handle The handle of the script to set up translations for.
	 * @return void
	 */
	public function setup_script_translations( $script_handle ) {
		wp_set_script_translations(
			$script_handle,
			$this->text_domain,
			plugin_dir_path( $this->plugin_file ) . 'languages'
		);
	}
}
