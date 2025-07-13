<?php
/**
 * Plugin Initializer
 *
 * Simple class to organize plugin startup logic and provide basic service location.
 *
 * @package BlockAccessibilityChecks
 * @since 1.3.0
 */

namespace BlockAccessibility;

/**
 * Plugin Initializer Class
 *
 * Handles plugin initialization in an organized way.
 */
class PluginInitializer {

	/**
	 * Plugin file path
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * Text domain
	 *
	 * @var string
	 */
	private $text_domain;

	/**
	 * Service instances
	 *
	 * @var array
	 */
	private $services = array();

	/**
	 * Constructor
	 *
	 * @param string $plugin_file Plugin file path.
	 * @param string $text_domain Text domain.
	 */
	public function __construct( $plugin_file, $text_domain ) {
		$this->plugin_file = $plugin_file;
		$this->text_domain = $text_domain;
	}

	/**
	 * Initialize the plugin
	 */
	public function init() {
		// Initialize services in the correct order.
		$this->init_translations();
		$this->init_scripts_styles();
		$this->init_settings_page();
		$this->init_block_config();
		$this->init_block_checks_registry();

		// Setup hooks.
		$this->setup_hooks();

		// Allow other plugins to hook into our initialization.
		do_action( 'ba11yc_plugin_initialized', $this );

		// Allow developers to access the registry and add custom checks.
		do_action( 'ba11yc_ready', $this->get_service( 'block_checks_registry' ), $this );
	}

	/**
	 * Initialize translations
	 */
	private function init_translations() {
		$translations = new Translations( $this->plugin_file, $this->text_domain );
		$translations->load_text_domain();
		$this->services['translations'] = $translations;
	}

	/**
	 * Initialize scripts and styles
	 */
	private function init_scripts_styles() {
		$translations                     = $this->get_service( 'translations' );
		$scripts_styles                   = new ScriptsStyles( $this->plugin_file, $translations );
		$this->services['scripts_styles'] = $scripts_styles;
	}

	/**
	 * Initialize settings page
	 */
	private function init_settings_page() {
		$settings_page                   = new SettingsPage();
		$this->services['settings_page'] = $settings_page;
	}

	/**
	 * Initialize block configuration
	 */
	private function init_block_config() {
		$block_config                   = BlockConfig::get_instance();
		$this->services['block_config'] = $block_config;
	}

	/**
	 * Initialize block checks registry
	 */
	private function init_block_checks_registry() {
		$block_checks_registry                   = BlockChecksRegistry::get_instance();
		$this->services['block_checks_registry'] = $block_checks_registry;
	}

	/**
	 * Setup WordPress hooks
	 */
	private function setup_hooks() {
		$scripts_styles = $this->get_service( 'scripts_styles' );

		if ( $scripts_styles ) {
			add_action( 'enqueue_block_editor_assets', array( $scripts_styles, 'enqueue_block_assets' ) );
			add_action( 'admin_enqueue_scripts', array( $scripts_styles, 'enqueue_admin_assets' ) );
		}
	}

	/**
	 * Get a service instance
	 *
	 * @param string $service_name Service name.
	 * @return object|null Service instance or null if not found.
	 */
	public function get_service( $service_name ) {
		return isset( $this->services[ $service_name ] ) ? $this->services[ $service_name ] : null;
	}

	/**
	 * Get all registered services
	 *
	 * @return array All services.
	 */
	public function get_all_services() {
		return $this->services;
	}

	/**
	 * Get plugin file path
	 *
	 * @return string Plugin file path.
	 */
	public function get_plugin_file() {
		return $this->plugin_file;
	}

	/**
	 * Get text domain
	 *
	 * @return string Text domain.
	 */
	public function get_text_domain() {
		return $this->text_domain;
	}

	/**
	 * Get the block checks registry
	 *
	 * @return BlockChecksRegistry|null The registry instance or null if not initialized.
	 */
	public function get_block_checks_registry() {
		return $this->get_service( 'block_checks_registry' );
	}

	/**
	 * Register a new accessibility check (convenience method)
	 *
	 * @param string $block_type Block type (e.g., 'core/image').
	 * @param string $check_name Unique check name.
	 * @param array  $check_args Check configuration.
	 * @return bool True on success, false on failure.
	 */
	public function register_check( $block_type, $check_name, $check_args ) {
		$registry = $this->get_block_checks_registry();
		return $registry ? $registry->register_check( $block_type, $check_name, $check_args ) : false;
	}

	/**
	 * Unregister an accessibility check (convenience method)
	 *
	 * @param string $block_type Block type.
	 * @param string $check_name Check name.
	 * @return bool True on success, false if check not found.
	 */
	public function unregister_check( $block_type, $check_name ) {
		$registry = $this->get_block_checks_registry();
		return $registry ? $registry->unregister_check( $block_type, $check_name ) : false;
	}
}
