<?php

/**
 *
 * Class SettingsPage
 *
 * The SettingsPage class handles the settings page for the Block Accessibility Checks plugin.
 *
 * @package BlockAccessibility
 */

namespace BlockAccessibility;

class SettingsPage
{

    /**
     * Initializes the SettingsPage class.
     *
     * This constructor method sets up the necessary actions for the SettingsPage class.
     * It adds the 'blockCheckAdminMenu' method to the 'admin_menu' action hook and the 'initSettings' method to the 'admin_init' action hook.
     * 
     */
    public function __construct()
    {
        add_action('admin_menu', array($this, 'blockCheckAdminMenu'));
        add_action('admin_init', array($this, 'initSettings'));
    }

    /**
     * Registers the Block Accessibility Checks settings page in the WordPress admin menu.
     *
     * @return void
     */
    public function blockCheckAdminMenu()
    {
        add_options_page(
            esc_html__('Block Accessibility Checks', 'block-accessibility-checks'),
            esc_html__('Block Checks', 'block-accessibility-checks'),
            'manage_options',
            'block-checks',
            array($this, 'settingsPageLayout')
        );
    }

    /**
     * Initializes the settings for the block accessibility checks.
     *
     * This method registers the settings, adds the settings section, and dynamically adds settings fields
     * based on the block configuration.
     *
     * @return void
     */
    public function initSettings()
    {
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

        /**
         * Retrieves the block configuration.
         *
         * @return BlockConfig The block configuration object.
         */
        $blockConfig = BlockConfig::getInstance()->getBlockConfig();

        /**
         * Adds settings fields for each block in the block configuration.
         *
         * @param array $blockConfig The array containing the block configuration.
         * @return void
         */
        foreach ($blockConfig as $block) {
            add_settings_field(
                $block['option_name'],
                $block['block_label'],
                array($this, $block['function_name']),
                'block_checks_options',
                'block_checks_options_section'
            );
        }
    }

    /**
     * Renders the settings page layout.
     *
     * This method is responsible for rendering the settings page layout for the plugin. It checks if the current user has sufficient permissions to access the page and displays an error message if not. It then outputs the HTML markup for the settings form, including the options, sections, and submit button. Additionally, it displays information about the plugin and outputs the current block checks options using `print_r`.
     *
     * @return void
     */
    public function settingsPageLayout()
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'block-accessibility-checks'));
        }

        echo '<div class="block-a11y-checks-settings">' . "\n";
        echo '<h1>' . esc_html(get_admin_page_title()) . '</h1>' . "\n";
        echo '<form class="block-a11y-checks-settings-form" action="options.php" method="post">' . "\n";

        echo '<div class="block-a11y-checks-settings-grid">';

        // Output the settings fields manually to avoid the table layout
        settings_fields('block_checks_settings_group');

        // Retrieve all the fields added dynamically in initSettings()
        $blockConfig = BlockConfig::getInstance()->getBlockConfig();
        $options = get_option('block_checks_options');

        // Loop through each field and wrap in a custom div
        foreach ($blockConfig as $block) {
            $value = isset($options[$block['option_name']]) ? $options[$block['option_name']] : 'error';

            echo '<div class="block-a11y-checks-settings-field">';
            echo '<h2>' . esc_html($block['block_label']) . '</h2>';
            call_user_func(array($this, $block['function_name']));
            echo '</div>';
        }

        echo '</div>';

        submit_button();
        echo '</form>' . "\n";
        echo '</div>' . "\n";
    }

    /**
     * Renders the block options for a given block option name and description.
     *
     * @param string $blockOptionName The name of the block option.
     * @param string $description The description of the block option.
     * @return void
     */
    private function renderBlockOptions($blockOptionName, $description)
    {
        $options = get_option('block_checks_options');
        $value = isset($options[$blockOptionName]) ? $options[$blockOptionName] : 'error';

        echo '<ul class="block-check-radio-options">';
        echo '<li><input type="radio" name="block_checks_options[' . esc_attr($blockOptionName) . ']" value="error" ' . checked($value, 'error', false) . '> ' . esc_html__('Error', 'block-accessibility-checks') . '</li>';
        echo '<li><input type="radio" name="block_checks_options[' . esc_attr($blockOptionName) . ']" value="warning" ' . checked($value, 'warning', false) . '> ' . esc_html__('Warning', 'block-accessibility-checks') . '</li>';
        echo '<li><input type="radio" name="block_checks_options[' . esc_attr($blockOptionName) . ']" value="none" ' . checked($value, 'none', false) . '> ' . esc_html__('None', 'block-accessibility-checks') . '</li>';
        echo '</ul>';
    }

    /**
     * Renders the core heading options on the settings page.
     *
     * This method is responsible for rendering the core heading options on the settings page.
     * It calls the `renderBlockOptions` method with the appropriate parameters to display the options.
     *
     * @return void
     */
    public function renderCoreHeadingOptions()
    {
        $this->renderBlockOptions('coreHeadingBlockCheck', 'How strict do you want to be with the core/heading block?');
    }

    /**
     * Renders the core image options on the settings page.
     *
     * This method is responsible for rendering the core image options on the settings page.
     * It calls the `renderBlockOptions` method with the appropriate parameters to display the options.
     *
     * @return void
     */
    public function renderCoreImageOptions()
    {
        $this->renderBlockOptions('coreImageBlockCheck', 'How strict do you want to be with the core/image block?');
    }

    /**
     * Renders the core table options on the settings page.
     *
     * This method is responsible for rendering the core table options on the settings page.
     * It calls the `renderBlockOptions` method with the appropriate parameters to display the options.
     *
     * @return void
     */
    public function renderCoreTableOptions()
    {
        $this->renderBlockOptions('coreTableBlockCheck', 'How strict do you want to be with the core/table block?');
    }
}
