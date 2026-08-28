<?php
/**
 * Assets
 *
 * Manages registration and enqueueing of scripts and styles, and injects
 * validation configuration into the block editor settings.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility\Core;

use BlockAccessibility\Core\Traits\EditorDetection;
use BlockAccessibility\Block\Registry as BlockChecksRegistry;
use BlockAccessibility\Block\HeadingSources;
use BlockAccessibility\Meta\Registry as MetaChecksRegistry;
use BlockAccessibility\Editor\Registry as EditorChecksRegistry;
use BlockAccessibility\Rest\SettingsController;

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Assets
 *
 * Responsible for managing the registration and enqueueing of scripts and
 * styles within the Block Accessibility Checks plugin.
 */
class Assets {

	use EditorDetection;

	/**
	 * Script handle for the main block accessibility script.
	 *
	 * @var string
	 */
	private const SCRIPT_HANDLE = 'block-accessibility-script';

	/**
	 * Settings page script/style handle.
	 *
	 * @var string
	 */
	private const SETTINGS_HANDLE = 'block-accessibility-settings';

	/**
	 * Path to the main block checks JavaScript file.
	 *
	 * @var string
	 */
	private const BLOCK_SCRIPT_PATH = 'build/block-checks.js';

	/**
	 * Path to the main block checks stylesheet.
	 *
	 * @var string
	 */
	private const BLOCK_STYLE_PATH = 'build/block-checks.css';

	/**
	 * Path to the settings app JavaScript file.
	 *
	 * @var string
	 */
	private const SETTINGS_SCRIPT_PATH = 'build/settings.js';

	/**
	 * Path to the settings app stylesheet.
	 *
	 * @var string
	 */
	private const SETTINGS_STYLE_PATH = 'build/settings.css';

	/**
	 * The path to the plugin file.
	 *
	 * @var string
	 */
	private $plugin_file;

	/**
	 * The translations object.
	 *
	 * @var I18n
	 */
	private $translations;

	/**
	 * Cached settings option.
	 *
	 * @var array|null
	 */
	private $settings = null;

	/**
	 * Constructs a new instance of the Assets class.
	 *
	 * @param string $plugin_file The path to the plugin file.
	 * @param I18n   $translations The translations object.
	 */
	public function __construct( string $plugin_file, I18n $translations ) {
		$this->plugin_file  = $plugin_file;
		$this->translations = $translations;

		// Inject validation config into editor settings instead of wp_localize_script.
		add_filter( 'block_editor_settings_all', array( $this, 'inject_editor_settings' ) );
	}

	/**
	 * Enqueues the editor assets (script + styles).
	 *
	 * Runs in both post editor and site editor contexts. Not on the frontend.
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		if ( ! \is_admin() || ! $this->should_load_validation() ) {
			return;
		}

		$this->translations->setup_script_translations( self::SCRIPT_HANDLE );

		$this->enqueue_block_scripts();
		$this->enqueue_block_styles();
	}

	/**
	 * Enqueues the admin assets.
	 *
	 * Loads the DataViews settings app only on the plugin's settings page.
	 *
	 * @param string $hook_suffix The current admin page hook suffix.
	 * @return void
	 */
	public function enqueue_admin_assets( $hook_suffix = '' ) {
		// The settings page hook for a top-level menu with slug 'block-a11y-checks'.
		if ( 'toplevel_page_block-a11y-checks' !== $hook_suffix ) {
			return;
		}

		$asset_file   = \plugin_dir_path( $this->plugin_file ) . 'build/settings.asset.php';
		$dependencies = array( 'wp-components', 'wp-element', 'wp-i18n', 'wp-api-fetch' );
		$version      = BA11YC_VERSION;

		if ( file_exists( $asset_file ) ) {
			$asset        = require $asset_file;
			$dependencies = $asset['dependencies'] ?? $dependencies;
			$version      = $asset['version'] ?? $version;
		}

		\wp_enqueue_script(
			self::SETTINGS_HANDLE,
			plugins_url( self::SETTINGS_SCRIPT_PATH, $this->plugin_file ),
			$dependencies,
			$version,
			true
		);

		\wp_enqueue_style(
			self::SETTINGS_HANDLE,
			plugins_url( self::SETTINGS_STYLE_PATH, $this->plugin_file ),
			array( 'wp-components' ),
			$version
		);

		$this->translations->setup_script_translations( self::SETTINGS_HANDLE );

		// Display-name maps for the settings UI (block titles, post type labels,
		// and namespace -> plugin name).
		\wp_add_inline_script(
			self::SETTINGS_HANDLE,
			'window.ba11ycSettings = ' . \wp_json_encode(
				array(
					'blockTitles'    => $this->get_block_titles(),
					'postTypeLabels' => $this->get_post_type_labels(),
					'pluginNames'    => $this->get_plugin_names(),
				)
			) . ';',
			'before'
		);
	}

	/**
	 * Enqueues the editor block script.
	 *
	 * @return void
	 */
	private function enqueue_block_scripts() {
		$asset_file   = \plugin_dir_path( $this->plugin_file ) . 'build/block-checks.asset.php';
		$dependencies = array( 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-data', 'wp-edit-post', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins' );
		$version      = BA11YC_VERSION;

		if ( file_exists( $asset_file ) ) {
			$asset        = require $asset_file;
			$dependencies = $asset['dependencies'] ?? $dependencies;
			$version      = $asset['version'] ?? $version;
		}

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			plugins_url( self::BLOCK_SCRIPT_PATH, $this->plugin_file ),
			$dependencies,
			$version,
			true
		);
	}

	/**
	 * Enqueues the editor block styles (icons + color variables).
	 *
	 * @return void
	 */
	private function enqueue_block_styles() {
		wp_enqueue_style(
			'block-checks-style',
			plugins_url( self::BLOCK_STYLE_PATH, $this->plugin_file ),
			array(),
			BA11YC_VERSION
		);

		$warning_icon_url = plugins_url( 'src/assets/universal-access-warning.svg', $this->plugin_file );
		$error_icon_url   = plugins_url( 'src/assets/universal-access-error.svg', $this->plugin_file );

		$inline_css = sprintf(
			":root {
				--a11y-red: #d82000;
				--a11y-light-red: #ffe4e0;
				--a11y-dark-red: #a21800;
				--a11y-yellow: #dbc900;
				--a11y-light-yellow: #fffde2;
				--a11y-dark-yellow: #807500;
				--a11y-border-width: 3px solid;
				--a11y-warning-icon: url('%s');
				--a11y-error-icon: url('%s');
			}",
			esc_url( $warning_icon_url ),
			esc_url( $error_icon_url )
		);

		wp_add_inline_style( 'block-checks-style', $inline_css );
	}

	/**
	 * Inject validation configuration into the block editor settings.
	 *
	 * Available in JS via `getEditorSettings().blockA11yChecks`.
	 *
	 * @param array $settings The editor settings array.
	 * @return array Modified editor settings with validation config.
	 */
	public function inject_editor_settings( array $settings ): array {
		if ( ! $this->should_load_validation() ) {
			return $settings;
		}

		$editor_context  = $this->get_editor_context();
		$is_site_editor  = 'site-editor' === $editor_context;
		$registry        = BlockChecksRegistry::get_instance();
		$meta_registry   = MetaChecksRegistry::get_instance();
		$editor_registry = EditorChecksRegistry::get_instance();

		$settings['blockA11yChecks'] = array(
			'editorContext'         => $editor_context,
			'validationRules'       => $this->prepare_block_rules( $registry, $is_site_editor ),
			'metaValidationRules'   => $this->prepare_meta_rules( $meta_registry, $is_site_editor ),
			'editorValidationRules' => $this->prepare_editor_rules( $editor_registry, $is_site_editor ),
			'registeredBlockTypes'  => $registry->get_registered_block_types(),
			'headingSources'        => HeadingSources::get_instance()->get_resolved_sources(),
		);

		return $settings;
	}

	/**
	 * Get the cached settings option.
	 *
	 * @return array
	 */
	private function get_settings(): array {
		if ( null === $this->settings ) {
			$settings       = get_option( SettingsController::OPTION_KEY, array() );
			$this->settings = is_array( $settings ) ? $settings : array();
		}
		return $this->settings;
	}

	/**
	 * Resolve whether a check is active given site-editor gating.
	 *
	 * Returns 'none' when not in the site editor or when the per-check
	 * site-editor flag is absent (default disabled) or explicitly false.
	 *
	 * @param string $effective_level The effective level after overrides.
	 * @param bool   $is_site_editor  Whether the current context is the site editor.
	 * @param string $flag_path_a     First key into the siteEditor flag tree (scope).
	 * @param array  $flag_keys       The remaining keys into the siteEditor flag tree.
	 * @return string The level, or 'none' if gated off.
	 */
	private function gate_site_editor( string $effective_level, bool $is_site_editor, string $flag_path_a, array $flag_keys ): string {
		if ( ! $is_site_editor ) {
			return $effective_level;
		}

		$settings = $this->get_settings();
		$node     = $settings['siteEditor'][ $flag_path_a ] ?? null;

		foreach ( $flag_keys as $key ) {
			if ( ! is_array( $node ) || ! array_key_exists( $key, $node ) ) {
				return 'none'; // No explicit flag: default disabled.
			}
			$node = $node[ $key ];
		}

		// $node is now the boolean flag (true = explicitly enabled).
		return ( true === $node ) ? $effective_level : 'none';
	}

	/**
	 * Prepare block validation rules for JS.
	 *
	 * @param BlockChecksRegistry $registry       The block checks registry.
	 * @param bool                $is_site_editor Whether the current context is the site editor.
	 * @return array
	 */
	private function prepare_block_rules( BlockChecksRegistry $registry, bool $is_site_editor ): array {
		$js_rules = array();

		foreach ( $registry->get_all_checks() as $block_type => $checks ) {
			$js_rules[ $block_type ] = array();

			foreach ( $checks as $check_name => $check_config ) {
				$level = $registry->get_effective_check_level( $block_type, $check_name );
				$level = $this->gate_site_editor( $level, $is_site_editor, 'block', array( $block_type, $check_name ) );

				if ( 'none' === $level ) {
					continue;
				}

				$js_rules[ $block_type ][ $check_name ] = $this->format_rule( $check_config, $level );
			}
		}

		return $js_rules;
	}

	/**
	 * Prepare meta validation rules for JS.
	 *
	 * @param MetaChecksRegistry $registry       The meta checks registry.
	 * @param bool               $is_site_editor Whether the current context is the site editor.
	 * @return array
	 */
	private function prepare_meta_rules( MetaChecksRegistry $registry, bool $is_site_editor ): array {
		$js_rules = array();

		foreach ( $registry->get_all_meta_checks() as $post_type => $meta_fields ) {
			$js_rules[ $post_type ] = array();

			foreach ( $meta_fields as $meta_key => $checks ) {
				$js_rules[ $post_type ][ $meta_key ] = array();

				foreach ( $checks as $check_name => $check_config ) {
					$level = $registry->get_effective_meta_check_level( $post_type, $meta_key, $check_name );
					$level = $this->gate_site_editor( $level, $is_site_editor, 'meta', array( $post_type, $meta_key, $check_name ) );

					if ( 'none' === $level ) {
						continue;
					}

					$js_rules[ $post_type ][ $meta_key ][ $check_name ] = $this->format_rule( $check_config, $level );
				}
			}
		}

		return $js_rules;
	}

	/**
	 * Prepare editor validation rules for JS.
	 *
	 * @param EditorChecksRegistry $registry       The editor checks registry.
	 * @param bool                 $is_site_editor Whether the current context is the site editor.
	 * @return array
	 */
	private function prepare_editor_rules( EditorChecksRegistry $registry, bool $is_site_editor ): array {
		$js_rules = array();

		foreach ( $registry->get_all_editor_checks() as $post_type => $checks ) {
			$js_rules[ $post_type ] = array();

			foreach ( $checks as $check_name => $check_config ) {
				$level = $registry->get_effective_editor_check_level( $post_type, $check_name );
				$level = $this->gate_site_editor( $level, $is_site_editor, 'editor', array( $post_type, $check_name ) );

				if ( 'none' === $level ) {
					continue;
				}

				$js_rules[ $post_type ][ $check_name ] = $this->format_rule( $check_config, $level );
			}
		}

		return $js_rules;
	}

	/**
	 * Format a single rule for JS consumption.
	 *
	 * @param array  $check_config The raw check config.
	 * @param string $level        The effective level.
	 * @return array
	 */
	private function format_rule( array $check_config, string $level ): array {
		return array(
			'error_msg'   => $check_config['error_msg'],
			'warning_msg' => $check_config['warning_msg'],
			'level'       => $level,
			'category'    => $check_config['category'] ?? 'accessibility',
			'priority'    => $check_config['priority'],
			'enabled'     => $check_config['enabled'],
			'description' => $check_config['description'],
		);
	}

	/**
	 * Build a map of registered block types to their human-readable titles.
	 *
	 * @return array
	 */
	private function get_block_titles(): array {
		$titles         = array();
		$block_registry = \WP_Block_Type_Registry::get_instance();

		foreach ( BlockChecksRegistry::get_instance()->get_registered_block_types() as $block_type ) {
			$block                 = $block_registry->get_registered( $block_type );
			$titles[ $block_type ] = ( $block && ! empty( $block->title ) )
				? $block->title
				: ucwords( str_replace( array( '-', '_' ), ' ', explode( '/', $block_type )[1] ?? $block_type ) );
		}

		return $titles;
	}

	/**
	 * Build a map of plugin namespace slugs to their human-readable plugin names.
	 *
	 * Checks are registered with a `namespace` slug and nothing else identifying —
	 * there is no display name in the registry — so the name is resolved by matching
	 * the namespace against installed plugin directory slugs, which is the
	 * convention integrations follow. Namespaces that match no installed plugin are
	 * simply omitted; the client falls back to title-casing the slug.
	 *
	 * @return array
	 */
	private function get_plugin_names(): array {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$names = array();

		foreach ( \get_plugins() as $plugin_file => $plugin_data ) {
			if ( empty( $plugin_data['Name'] ) ) {
				continue;
			}

			$slug = dirname( $plugin_file );
			if ( '.' === $slug ) {
				continue; // Single-file plugin, no directory to match a namespace against.
			}

			$names[ $slug ] = $plugin_data['Name'];
		}

		return $names;
	}

	/**
	 * Build a map of post types to their singular labels.
	 *
	 * @return array
	 */
	private function get_post_type_labels(): array {
		$labels     = array();
		$registries = array(
			EditorChecksRegistry::get_instance()->get_all_editor_checks(),
			MetaChecksRegistry::get_instance()->get_all_meta_checks(),
		);

		foreach ( $registries as $by_post_type ) {
			foreach ( array_keys( $by_post_type ) as $post_type ) {
				if ( isset( $labels[ $post_type ] ) ) {
					continue;
				}
				$obj                  = \get_post_type_object( $post_type );
				$labels[ $post_type ] = ( $obj && ! empty( $obj->labels->singular_name ) )
					? $obj->labels->singular_name
					: ucwords( str_replace( array( '-', '_' ), ' ', $post_type ) );
			}
		}

		return $labels;
	}
}
