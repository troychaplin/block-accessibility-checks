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

	/**
	 * Holds the block settings configuration.
	 *
	 * @var array
	 */
	private $block_settings = array(
		array(
			'option_name'   => 'core_button_block_check',
			'block_label'   => 'Core Button Block',
			'description'   => 'Buttons should have text and a link, this check will ensure that the button block has both.',
			'function_name' => 'render_core_button_options',
		),
		array(
			'option_name'   => 'core_heading_levels',
			'block_label'   => 'Core Heading Block',
			'description'   => 'Select which heading levels you want to remove from the editor. Checked levels will not be available.',
			'function_name' => 'render_core_heading_options',
		),
		array(
			'option_name'   => 'core_image_block_check',
			'block_label'   => 'Core Image Block',
			'description'   => 'Image alt text should be descriptive and not empty, this option will check for alternative text on images.',
			'function_name' => 'render_core_image_options',
		),
		array(
			'option_name'   => 'core_table_block_check',
			'block_label'   => 'Core Table Block',
			'description'   => 'Tables are required to have a header row, this option will check for a header row in tables.',
			'function_name' => 'render_core_table_options',
		),
	);

	/**
	 * SettingsPage constructor.
	 *
	 * This constructor initializes the settings page by adding the necessary
	 * actions to the WordPress admin menu and initializing the settings.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'block_check_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'init_settings' ) );
	}

	/**
	 * Adds the settings page to the WordPress admin menu.
	 *
	 * This method is responsible for adding the settings page to the WordPress
	 * admin menu under the "Settings" section. It uses the `add_options_page`
	 * function to create a new options page.
	 *
	 * @return void
	 */
	public function block_check_admin_menu() {
		add_options_page(
			esc_html__( 'Block Accessibility Checks', 'block-accessibility-checks' ),
			esc_html__( 'Block Checks', 'block-accessibility-checks' ),
			'manage_options',
			'block-checks',
			array( $this, 'settings_page_layout' )
		);
	}

	/**
	 * Initializes the settings for the plugin.
	 *
	 * This method is responsible for registering the settings and adding
	 * the settings section and fields to the WordPress admin.
	 *
	 * @return void
	 */
	public function init_settings() {
		register_setting(
			'block_checks_settings_group',
			'block_checks_options'
		);

		add_settings_section(
			'block_checks_options_section',
			'',
			false,
			'block_checks_options'
		);

		foreach ( $this->block_settings as $block ) {
			add_settings_field(
				$block['option_name'],
				$block['block_label'],
				array( $this, $block['function_name'] ),
				'block_checks_options',
				'block_checks_options_section'
			);
		}
	}

	/**
	 * Renders the settings page layout.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the settings page for the plugin.
	 *
	 * @return void
	 */
	public function settings_page_layout() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		echo '<div class="block-a11y-checks-settings">' . "\n";
		echo '<h1>' . esc_html( get_admin_page_title() ) . '</h1>' . "\n";
		echo '<form class="block-a11y-checks-settings-form" action="options.php" method="post">' . "\n";
		echo '<div class="block-a11y-checks-settings-grid">';

		settings_fields( 'block_checks_settings_group' );

		foreach ( $this->block_settings as $block ) {
			echo '<div class="block-a11y-checks-settings-field">';
			echo '<h2>' . esc_html( $block['block_label'] ) . '</h2>';
			echo '<p>' . esc_html( $block['description'] ) . '</p>';
			call_user_func( array( $this, $block['function_name'] ) );
			echo '</div>';
		}

		echo '</div>';
		submit_button();
		echo '</form>' . "\n";
		echo '</div>' . "\n";
	}

	/**
	 * Renders the block options for the settings page.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the block options in the plugin's settings page.
	 *
	 * @param string $block_option_name The option name for the block.
	 *
	 * @return void
	 */
	private function render_block_options( $block_option_name ) {
		$options = get_option( 'block_checks_options' );
		$value   = isset( $options[ $block_option_name ] ) ? $options[ $block_option_name ] : 'error';

		echo '<ul class="block-check-radio-options">';
		echo '<li><input type="radio" name="block_checks_options[' . esc_attr( $block_option_name ) . ']" value="error" ' . checked( $value, 'error', false ) . '> ' . esc_html__( 'Error', 'block-accessibility-checks' ) . '</li>';
		echo '<li><input type="radio" name="block_checks_options[' . esc_attr( $block_option_name ) . ']" value="warning" ' . checked( $value, 'warning', false ) . '> ' . esc_html__( 'Warning', 'block-accessibility-checks' ) . '</li>';
		echo '<li><input type="radio" name="block_checks_options[' . esc_attr( $block_option_name ) . ']" value="none" ' . checked( $value, 'none', false ) . '> ' . esc_html__( 'None', 'block-accessibility-checks' ) . '</li>';
		echo '</ul>';
	}

	/**
	 * Renders the block options based on the configuration.
	 *
	 * This method is responsible for rendering the block options for the
	 * settings page based on the provided option name. It looks up the
	 * configuration and calls the appropriate rendering method.
	 *
	 * @param string $option_name The option name to look up in the block settings.
	 *
	 * @return void
	 */
	private function render_block_options_from_config( $option_name ) {
		foreach ( $this->block_settings as $block ) {
			if ( $block['option_name'] === $option_name ) {
				$this->render_block_options( $block['option_name'], $block['description'] );
				return;
			}
		}
	}

	/**
	 * Renders the core button options for the settings page.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the core button options in the plugin's settings page.
	 *
	 * @return void
	 */
	public function render_core_button_options() {
		$this->render_block_options_from_config( 'core_button_block_check' );
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
		$options        = get_option( 'block_checks_options' );
		$heading_levels = isset( $options['core_heading_levels'] ) ? $options['core_heading_levels'] : array( 'h1' );

		echo '<ul class="block-check-checkbox-options">';
		for ( $i = 1; $i <= 6; $i++ ) {
			$level   = 'h' . $i;
			$checked = in_array( $level, $heading_levels, true ) ? 'checked' : '';
			echo '<li>';
			echo '<input type="checkbox" 
						 id="' . esc_attr( 'heading-level-' . $i ) . '" 
						 name="block_checks_options[core_heading_levels][]" 
						 value="' . esc_attr( $level ) . '" 
						 ' . esc_attr( $checked ) . '>';
			echo '<label for="' . esc_attr( 'heading-level-' . $i ) . '">' . esc_html( strtoupper( $level ) ) . '</label>';
			echo '</li>';
		}
		echo '</ul>';
	}

	/**
	 * Renders the core image options for the settings page.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the core image options in the plugin's settings page.
	 *
	 * @return void
	 */
	public function render_core_image_options() {
		$this->render_block_options_from_config( 'core_image_block_check' );
	}

	/**
	 * Renders the core table options for the settings page.
	 *
	 * This method is responsible for outputting the HTML or other content
	 * necessary to display the core table options in the plugin's settings page.
	 *
	 * @return void
	 */
	public function render_core_table_options() {
		$this->render_block_options_from_config( 'core_table_block_check' );
	}
}
