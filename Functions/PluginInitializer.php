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
	public function __construct( string $plugin_file, string $text_domain ) {
		$this->plugin_file = $plugin_file;
		$this->text_domain = $text_domain;
	}

	/**
	 * Initialize the plugin
	 *
	 * Initializes all plugin services in the correct order and sets up WordPress hooks.
	 * If any initialization step fails, an error is logged and an admin notice is displayed.
	 *
	 * @return void
	 * @throws \Exception If any service initialization fails.
	 */
	public function init(): void {
		try {
			$this->log_debug( 'Starting plugin initialization.' );

			// Initialize services in the correct order.
			$this->init_translations();
			$this->init_scripts_styles();
			$this->init_settings_page();
			$this->init_block_config();
			$this->init_block_checks_registry();

			// Setup hooks.
			$this->setup_hooks();

			// Allow other plugins to hook into our initialization.
			\do_action( 'ba11yc_plugin_initialized', $this );

			// Allow developers to access the registry and add custom checks.
			\do_action( 'ba11yc_ready', $this->get_service( 'block_checks_registry' ), $this );

			$this->log_debug( 'Plugin initialization completed successfully.' );

		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize plugin: ' . $e->getMessage() );

			// Add admin notice for initialization failure.
			\add_action( 'admin_notices', array( $this, 'display_initialization_error' ) );
		}
	}

	/**
	 * Initialize translations
	 *
	 * @return void
	 * @throws \Exception If translations service initialization fails.
	 */
	private function init_translations(): void {
		try {
			$translations = new Translations( $this->plugin_file, $this->text_domain );
			$translations->load_text_domain();
			$this->services['translations'] = $translations;
			$this->log_debug( 'Translations service initialized.' );
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize translations: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Initialize scripts and styles
	 *
	 * @return void
	 * @throws \Exception If scripts and styles service initialization fails.
	 */
	private function init_scripts_styles(): void {
		try {
			$translations                     = $this->get_service( 'translations' );
			$scripts_styles                   = new ScriptsStyles( $this->plugin_file, $translations );
			$this->services['scripts_styles'] = $scripts_styles;
			$this->log_debug( 'Scripts and styles service initialized.' );
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize scripts and styles: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Initialize settings page
	 *
	 * @return void
	 * @throws \Exception If settings page service initialization fails.
	 */
	private function init_settings_page(): void {
		try {
			$settings_page                   = new SettingsPage();
			$this->services['settings_page'] = $settings_page;
			$this->log_debug( 'Settings page service initialized.' );
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize settings page: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Initialize block configuration
	 *
	 * @return void
	 * @throws \Exception If block config service initialization fails.
	 */
	private function init_block_config(): void {
		try {
			$block_config                   = BlockConfig::get_instance();
			$this->services['block_config'] = $block_config;
			$this->log_debug( 'Block config service initialized.' );
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize block config: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Initialize block checks registry
	 *
	 * @return void
	 * @throws \Exception If block checks registry service initialization fails.
	 */
	private function init_block_checks_registry(): void {
		try {
			$block_checks_registry                   = BlockChecksRegistry::get_instance();
			$this->services['block_checks_registry'] = $block_checks_registry;
			$this->log_debug( 'Block checks registry service initialized.' );
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to initialize block checks registry: ' . $e->getMessage() );
			throw $e;
		}
	}

	/**
	 * Setup WordPress hooks
	 *
	 * Registers WordPress action hooks for the scripts and styles service.
	 *
	 * @return void
	 */
	private function setup_hooks(): void {
		try {
			$scripts_styles = $this->get_service( 'scripts_styles' );

			if ( $scripts_styles ) {
				\add_action( 'enqueue_block_editor_assets', array( $scripts_styles, 'enqueue_block_assets' ) );
				\add_action( 'admin_enqueue_scripts', array( $scripts_styles, 'enqueue_admin_assets' ) );
				$this->log_debug( 'WordPress hooks setup completed.' );
			} else {
				$this->log_error( 'Scripts styles service not available for hook setup.' );
			}
		} catch ( \Exception $e ) {
			$this->log_error( 'Failed to setup WordPress hooks: ' . $e->getMessage() );
		}
	}

	/**
	 * Get a service instance with error handling
	 *
	 * @param string $service_name Service name.
	 * @return object|null Service instance or null if not found.
	 */
	public function get_service( string $service_name ): ?object {
		if ( ! isset( $this->services[ $service_name ] ) ) {
			$this->log_error( "Requested service '{$service_name}' not found." );
			return null;
		}

		return $this->services[ $service_name ];
	}

	/**
	 * Check if a service exists
	 *
	 * @param string $service_name Service name.
	 * @return bool True if service exists, false otherwise.
	 */
	public function has_service( string $service_name ): bool {
		return isset( $this->services[ $service_name ] );
	}

	/**
	 * Get all registered services
	 *
	 * @return array All services.
	 */
	public function get_all_services(): array {
		return $this->services;
	}

	/**
	 * Get plugin file path
	 *
	 * @return string Plugin file path.
	 */
	public function get_plugin_file(): string {
		return $this->plugin_file;
	}

	/**
	 * Get text domain
	 *
	 * @return string Text domain.
	 */
	public function get_text_domain(): string {
		return $this->text_domain;
	}

	/**
	 * Get the block checks registry
	 *
	 * @return BlockChecksRegistry|null The registry instance or null if not initialized.
	 */
	public function get_block_checks_registry(): ?BlockChecksRegistry {
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
	public function register_check( string $block_type, string $check_name, array $check_args ): bool {
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
	public function unregister_check( string $block_type, string $check_name ): bool {
		$registry = $this->get_block_checks_registry();
		return $registry ? $registry->unregister_check( $block_type, $check_name ) : false;
	}

	/**
	 * Display admin notice for initialization errors
	 *
	 * @return void
	 */
	public function display_initialization_error(): void {
		printf(
			'<div class="notice notice-error"><p><strong>%s:</strong> %s</p></div>',
			'Plugin Error',
			'Block Accessibility Checks plugin failed to initialize properly. Please check your error logs for more details.'
		);
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
			\error_log( 'Block Accessibility Checks - PluginInitializer: ' . $message );
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
			\error_log( 'Block Accessibility Checks - PluginInitializer DEBUG: ' . $message );
		}
	}
}
