<?php

namespace BlockAccessibility;

class SettingsPage
{

    public function __construct()
    {
        add_action('admin_menu', array($this, 'blockCheckAdminMenu'));
        add_action('admin_init', array($this, 'initSettings'));
    }

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

        // Fetch block configuration dynamically
        $blockConfig = BlockConfig::getBlockConfig();

        // Loop through each block configuration to add settings fields dynamically
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

    public function settingsPageLayout()
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'block-accessibility-checks'));
        }

        echo '<div class="block-a11y-checks-settings">' . "\n";
        echo '<h1>' . esc_html(get_admin_page_title()) . '</h1>' . "\n";
        echo '<form class="block-a11y-checks-settings-form" action="options.php" method="post">' . "\n";

        echo '<div class="block-a11y-checks-settings-options">';
        settings_fields('block_checks_settings_group');
        do_settings_sections('block_checks_options');
        submit_button();
        echo '</div>';

        echo '<div class="block-a11y-checks-settings-info">';
        echo '<h2>' . esc_html__('About', 'block-accessibility-checks') . '</h2>';
        echo '<p>' . esc_html__('This plugin checks the accessibility of the core blocks in the WordPress block editor. You can set the level of strictness for each block type.', 'block-accessibility-checks') . '</p>';
        echo '</div>';

        echo '</form>' . "\n";
        echo '</div>' . "\n";

        // Use print_r to output the array
        $blockChecksOptions = get_option('block_checks_options', []);
        echo '<pre>';
        print_r($blockChecksOptions);
        echo '</pre>';
    }

    private function renderBlockOptions($blockOptionName, $description)
    {
        // Retrieve data from the database and set default value to 'error'.
        $options = get_option('block_checks_options');
        $value = isset($options[$blockOptionName]) ? $options[$blockOptionName] : 'error';

        // Output radio buttons
        // echo '<p class="description">' . esc_html($description, 'block-accessibility-checks') . '</p>';
        echo '<ul class="block-check-radio-options">';
        echo '<li><input type="radio" name="block_checks_options[' . esc_attr($blockOptionName) . ']" value="error" ' . checked($value, 'error', false) . '> ' . esc_html__('Error', 'block-accessibility-checks') . '</li>';
        echo '<li><input type="radio" name="block_checks_options[' . esc_attr($blockOptionName) . ']" value="warning" ' . checked($value, 'warning', false) . '> ' . esc_html__('Warning', 'block-accessibility-checks') . '</li>';
        echo '<li><input type="radio" name="block_checks_options[' . esc_attr($blockOptionName) . ']" value="none" ' . checked($value, 'none', false) . '> ' . esc_html__('None', 'block-accessibility-checks') . '</li>';
        echo '</ul>';
    }

    // Use the shared renderBlockOptions method to render options for each block
    public function renderCoreHeadingOptions()
    {
        $this->renderBlockOptions('coreHeadingBlockCheck', 'How strict do you want to be with the core/heading block?');
    }

    public function renderCoreButtonOptions()
    {
        $this->renderBlockOptions('coreButtonBlockCheck', 'How strict do you want to be with the core/button block?');
    }

    public function renderCoreImageOptions()
    {
        $this->renderBlockOptions('coreImageBlockCheck', 'How strict do you want to be with the core/image block?');
    }

    public function renderCoreTableOptions()
    {
        $this->renderBlockOptions('coreTableBlockCheck', 'How strict do you want to be with the core/table block?');
    }
}
