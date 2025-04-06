<?php

namespace BlockAccessibility;

class SettingsPage {

	/**
	 * Holds the block settings configuration.
	 *
	 * @var array
	 */
	private $blockSettings = array(
		array(
			'option_name'   => 'coreButtonBlockCheck',
			'block_label'   => 'Core Button Block',
			'description'   => 'Buttons should have text and a link, this check will ensure that the button block has both.',
			'function_name' => 'renderCoreButtonOptions',
		),
		array(
			'option_name'   => 'coreHeadingLevels',
			'block_label'   => 'Core Heading Block',
			'description'   => 'Select which heading levels you want to remove from the editor. Checked levels will not be available.',
			'function_name' => 'renderCoreHeadingOptions',
		),
		array(
			'option_name'   => 'coreImageBlockCheck',
			'block_label'   => 'Core Image Block',
			'description'   => 'Image alt text should be descriptive and not empty, this option will check for alternative text on images.',
			'function_name' => 'renderCoreImageOptions',
		),
		array(
			'option_name'   => 'coreTableBlockCheck',
			'block_label'   => 'Core Table Block',
			'description'   => 'Tables are required to have a header row, this option will check for a header row in tables.',
			'function_name' => 'renderCoreTableOptions',
		),
	);

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'blockCheckAdminMenu' ) );
		add_action( 'admin_init', array( $this, 'initSettings' ) );
	}

	public function blockCheckAdminMenu() {
		add_options_page(
			esc_html__( 'Block Accessibility Checks', 'block-accessibility-checks' ),
			esc_html__( 'Block Checks', 'block-accessibility-checks' ),
			'manage_options',
			'block-checks',
			array( $this, 'settingsPageLayout' )
		);
	}

	public function initSettings() {
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

		foreach ( $this->blockSettings as $block ) {
			add_settings_field(
				$block['option_name'],
				$block['block_label'],
				array( $this, $block['function_name'] ),
				'block_checks_options',
				'block_checks_options_section'
			);
		}
	}

	public function settingsPageLayout() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		echo '<div class="block-a11y-checks-settings">' . "\n";
		echo '<h1>' . esc_html( get_admin_page_title() ) . '</h1>' . "\n";
		echo '<form class="block-a11y-checks-settings-form" action="options.php" method="post">' . "\n";
		echo '<div class="block-a11y-checks-settings-grid">';

		settings_fields( 'block_checks_settings_group' );

		foreach ( $this->blockSettings as $block ) {
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

	private function renderBlockOptions( $blockOptionName, $description ) {
		$options = get_option( 'block_checks_options' );
		$value   = isset( $options[ $blockOptionName ] ) ? $options[ $blockOptionName ] : 'error';

		echo '<ul class="block-check-radio-options">';
		echo '<li><input type="radio" name="block_checks_options[' . esc_attr( $blockOptionName ) . ']" value="error" ' . checked( $value, 'error', false ) . '> ' . esc_html__( 'Error', 'block-accessibility-checks' ) . '</li>';
		echo '<li><input type="radio" name="block_checks_options[' . esc_attr( $blockOptionName ) . ']" value="warning" ' . checked( $value, 'warning', false ) . '> ' . esc_html__( 'Warning', 'block-accessibility-checks' ) . '</li>';
		echo '<li><input type="radio" name="block_checks_options[' . esc_attr( $blockOptionName ) . ']" value="none" ' . checked( $value, 'none', false ) . '> ' . esc_html__( 'None', 'block-accessibility-checks' ) . '</li>';
		echo '</ul>';
	}

	private function renderBlockOptionsFromConfig( $optionName ) {
		foreach ( $this->blockSettings as $block ) {
			if ( $block['option_name'] === $optionName ) {
				$this->renderBlockOptions( $block['option_name'], $block['description'] );
				return;
			}
		}

		// Optionally log an error or handle the case when the block configuration is missing
	}

	public function renderCoreButtonOptions() {
		$this->renderBlockOptionsFromConfig( 'coreButtonBlockCheck' );
	}

	public function renderCoreHeadingOptions() {
		$options        = get_option( 'block_checks_options' );
		$heading_levels = isset( $options['coreHeadingLevels'] ) ? $options['coreHeadingLevels'] : array( 'h1' ); // Default to h1 checked

		echo '<ul class="block-check-checkbox-options">';
		for ( $i = 1; $i <= 6; $i++ ) {
			$checked = in_array( "h{$i}", $heading_levels ) ? 'checked' : '';
			echo '<li>';
			echo '<input type="checkbox" 
                         id="heading-level-' . $i . '" 
                         name="block_checks_options[coreHeadingLevels][]" 
                         value="h' . $i . '" 
                         ' . $checked . '>';
			echo '<label for="heading-level-' . $i . '">H' . $i . '</label>';
			echo '</li>';
		}
		echo '</ul>';
	}

	public function renderCoreImageOptions() {
		$this->renderBlockOptionsFromConfig( 'coreImageBlockCheck' );
	}

	public function renderCoreTableOptions() {
		$this->renderBlockOptionsFromConfig( 'coreTableBlockCheck' );
	}
}
