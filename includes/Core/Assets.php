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

namespace BlockAccessibility\Core;

use BlockAccessibility\Core\Traits\EditorDetection;
use BlockAccessibility\Block\Registry as BlockChecksRegistry;
use BlockAccessibility\Meta\Registry as MetaChecksRegistry;
use BlockAccessibility\Editor\Registry as EditorChecksRegistry;

/**
 * Class Assets
 *
 * This class is responsible for managing the registration and enqueueing
 * of scripts and styles within the Block Accessibility Checks plugin.
 *
 * @package BlockAccessibilityChecks
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
	 * Path to the admin stylesheet.
	 *
	 * @var string
	 */
	private const ADMIN_STYLE_PATH = 'build/block-admin.css';

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
	 * Constructs a new instance of the Assets class.
	 *
	 * @param string $plugin_file The path to the plugin file.
	 * @param I18n   $translations The translations object.
	 */
	public function __construct( string $plugin_file, I18n $translations ) {
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
		// Only run in content editor (all post types except Site Editor).
		if ( ! $this->is_content_editor() ) {
			return;
		}

		$this->translations->setup_script_translations( self::SCRIPT_HANDLE );

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
		$this->translations->setup_script_translations( self::SCRIPT_HANDLE );

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
		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			plugins_url( self::BLOCK_SCRIPT_PATH, $this->plugin_file ),
			array( 'wp-block-editor', 'wp-components', 'wp-compose', 'wp-data', 'wp-edit-post', 'wp-element', 'wp-hooks', 'wp-i18n', 'wp-plugins' ),
			BA11YC_VERSION,
			true
		);

		// Get block checks options for JavaScript.
		$block_checks_options = get_option( 'block_checks_options', array() );

		// Get the block checks registry to expose validation rules to JavaScript.
		$registry                = BlockChecksRegistry::get_instance();
		$meta_registry           = MetaChecksRegistry::get_instance();
		$editor_registry         = EditorChecksRegistry::get_instance();
		$validation_rules        = $this->prepare_validation_rules_for_js( $registry );
		$meta_validation_rules   = $this->prepare_meta_validation_rules_for_js( $meta_registry );
		$editor_validation_rules = $this->prepare_editor_validation_rules_for_js( $editor_registry );
		$registered_block_types  = $registry->get_registered_block_types();

		\wp_localize_script(
			self::SCRIPT_HANDLE,
			'BlockAccessibilityChecks',
			array(
				'blockChecksOptions'    => $block_checks_options,
				'validationRules'       => $validation_rules,
				'metaValidationRules'   => $meta_validation_rules,
				'editorValidationRules' => $editor_validation_rules,
				'registeredBlockTypes'  => $registered_block_types,
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
		// Enqueue the main stylesheet.
		wp_enqueue_style(
			'block-checks-style',
			plugins_url( self::BLOCK_STYLE_PATH, $this->plugin_file ),
			array(),
			BA11YC_VERSION
		);

		// Dynamically generate the SVG URLs.
		$warning_icon_url = plugins_url( 'src/assets/universal-access-warning.svg', $this->plugin_file );
		$error_icon_url   = plugins_url( 'src/assets/universal-access-error.svg', $this->plugin_file );

		// Add the SVG URLs as CSS variables for warning and error icons.
		$inline_css = sprintf(
			":root {
				--a11y-warning-icon: url('%s');
				--a11y-error-icon: url('%s');
			}",
			esc_url( $warning_icon_url ),
			esc_url( $error_icon_url )
		);

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
		wp_enqueue_style(
			'block-checks-admin',
			plugins_url( self::ADMIN_STYLE_PATH, $this->plugin_file ),
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

	/**
	 * Prepare meta validation rules for JavaScript
	 *
	 * Formats the meta validation rules from the registry into a structure
	 * that can be consumed by JavaScript.
	 *
	 * @param MetaChecksRegistry $meta_registry The meta checks registry instance.
	 * @return array Formatted meta validation rules for JavaScript.
	 */
	private function prepare_meta_validation_rules_for_js( MetaChecksRegistry $meta_registry ): array {
		$all_meta_checks = $meta_registry->get_all_meta_checks();
		$js_rules        = array();

		foreach ( $all_meta_checks as $post_type => $meta_fields ) {
			$js_rules[ $post_type ] = array();

			foreach ( $meta_fields as $meta_key => $checks ) {
				$js_rules[ $post_type ][ $meta_key ] = array();

				foreach ( $checks as $check_name => $check_config ) {
					// Get the effective check level (considering settings).
					$effective_type = $meta_registry->get_effective_meta_check_level( $post_type, $meta_key, $check_name );

					// Skip checks set to 'none'.
					if ( 'none' === $effective_type ) {
						continue;
					}

					// Only include configuration that JavaScript needs.
					$js_rules[ $post_type ][ $meta_key ][ $check_name ] = array(
						'error_msg'   => $check_config['error_msg'],
						'warning_msg' => $check_config['warning_msg'],
						'type'        => $effective_type,
						'priority'    => $check_config['priority'],
						'enabled'     => $check_config['enabled'],
						'description' => $check_config['description'],
					);
				}
			}
		}

		return $js_rules;
	}

	/**
	 * Prepare editor validation rules for JavaScript
	 *
	 * Formats the editor validation rules from the registry into a structure
	 * that can be consumed by JavaScript.
	 *
	 * @param EditorChecksRegistry $editor_registry The editor checks registry instance.
	 * @return array Formatted editor validation rules for JavaScript.
	 */
	private function prepare_editor_validation_rules_for_js( EditorChecksRegistry $editor_registry ): array {
		$all_editor_checks = $editor_registry->get_all_editor_checks();
		$js_rules          = array();

		foreach ( $all_editor_checks as $post_type => $checks ) {
			$js_rules[ $post_type ] = array();

			foreach ( $checks as $check_name => $check_config ) {
				// Get the effective check level (considering settings).
				$effective_type = $editor_registry->get_effective_editor_check_level( $post_type, $check_name );

				// Skip checks set to 'none'.
				if ( 'none' === $effective_type ) {
					continue;
				}

				// Only include configuration that JavaScript needs.
				$js_rules[ $post_type ][ $check_name ] = array(
					'error_msg'   => $check_config['error_msg'],
					'warning_msg' => $check_config['warning_msg'],
					'type'        => $effective_type,
					'priority'    => $check_config['priority'],
					'enabled'     => $check_config['enabled'],
					'description' => $check_config['description'],
				);
			}
		}

		return $js_rules;
	}
}
