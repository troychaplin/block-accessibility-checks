<?php

namespace BlockAccessibility;

class SettingsPage
{
    /**
     * Holds the block settings configuration.
     *
     * @var array
     */
    private $blockSettings = [
        [
            'option_name' => 'coreButtonBlockCheck',
            'block_label' => 'Core Button Block',
            'description' => 'Each block should have text and a link. How strict do you want to be with the core/button block?',
            'function_name' => 'renderCoreButtonOptions',
        ],
        [
            'option_name' => 'coreHeadingBlockCheck',
            'block_label' => 'Core Heading Block',
            'description' => 'How strict do you want to be with the core/heading block?',
            'function_name' => 'renderCoreHeadingOptions',
        ],
        [
            'option_name' => 'coreImageBlockCheck',
            'block_label' => 'Core Image Block',
            'description' => 'How strict do you want to be with the core/image block?',
            'function_name' => 'renderCoreImageOptions',
        ],
        [
            'option_name' => 'coreTableBlockCheck',
            'block_label' => 'Core Table Block',
            'description' => 'How strict do you want to be with the core/table block?',
            'function_name' => 'renderCoreTableOptions',
        ],
    ];

    public function __construct()
    {
        add_action('admin_menu', [$this, 'blockCheckAdminMenu']);
        add_action('admin_init', [$this, 'initSettings']);
    }

    public function blockCheckAdminMenu()
    {
        add_options_page(
            esc_html__('Block Accessibility Checks', 'block-accessibility-checks'),
            esc_html__('Block Checks', 'block-accessibility-checks'),
            'manage_options',
            'block-checks',
            [$this, 'settingsPageLayout']
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

        foreach ($this->blockSettings as $block) {
            add_settings_field(
                $block['option_name'],
                $block['block_label'],
                [$this, $block['function_name']],
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
        echo '<div class="block-a11y-checks-settings-grid">';

        settings_fields('block_checks_settings_group');

        foreach ($this->blockSettings as $block) {
            echo '<div class="block-a11y-checks-settings-field">';
            echo '<h2>' . esc_html($block['block_label']) . '</h2>';
            echo '<p>' . esc_html($block['description']) . '</p>';
            call_user_func([$this, $block['function_name']]);
            echo '</div>';
        }

        echo '</div>';
        submit_button();
        echo '</form>' . "\n";
        echo '</div>' . "\n";
    }

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

    private function renderBlockOptionsFromConfig($optionName)
    {
        foreach ($this->blockSettings as $block) {
            if ($block['option_name'] === $optionName) {
                $this->renderBlockOptions($block['option_name'], $block['description']);
                return;
            }
        }

        // Optionally log an error or handle the case when the block configuration is missing
    }

    public function renderCoreButtonOptions()
    {
        $this->renderBlockOptionsFromConfig('coreButtonBlockCheck');
    }

    public function renderCoreHeadingOptions()
    {
        $this->renderBlockOptionsFromConfig('coreHeadingBlockCheck');
    }

    public function renderCoreImageOptions()
    {
        $this->renderBlockOptionsFromConfig('coreImageBlockCheck');
    }

    public function renderCoreTableOptions()
    {
        $this->renderBlockOptionsFromConfig('coreTableBlockCheck');
    }
}
