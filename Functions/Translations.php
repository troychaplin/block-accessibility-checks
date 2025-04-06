<?php

/**
 * Class Translations
 *
 * This class handles the translations for the BlockAccessibility plugin.
 *
 * @package BlockAccessibility
 */

namespace BlockAccessibility;

class Translations {

	private $pluginFile;
	private $textDomain;

	/**
	 * Constructs a new instance of the Translations class.
	 *
	 * @param string $pluginFile The path to the plugin file.
	 * @param string $textDomain The text domain for translations.
	 */
	public function __construct( $pluginFile, $textDomain ) {
		$this->pluginFile = $pluginFile;
		$this->textDomain = $textDomain;
	}

	/**
	 * Loads the text domain for the plugin.
	 *
	 * This function loads the translation files for the plugin's text domain.
	 * It uses the WordPress function `load_plugin_textdomain()` to load the translation files.
	 *
	 * @return void
	 */
	public function loadTextDomain() {
		load_plugin_textdomain( $this->textDomain, false, dirname( plugin_basename( $this->pluginFile ) ) . '/languages/' );
	}

	/**
	 * Sets up translations for a script.
	 *
	 * This method sets up translations for a given script handle by calling the `wp_set_script_translations()` function.
	 * It takes the script handle, text domain, and the path to the languages directory as parameters.
	 *
	 * @param string $scriptHandle The handle of the script to set up translations for.
	 * @return void
	 */
	public function setupScriptTranslations( $scriptHandle ) {
		wp_set_script_translations(
			$scriptHandle,
			$this->textDomain,
			plugin_dir_path( $this->pluginFile ) . 'languages'
		);
	}
}
