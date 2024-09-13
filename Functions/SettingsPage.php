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

        add_settings_field(
            'coreHeadingBlockCheck',
            esc_html__('Heading', 'block-accessibility-checks'),
            array($this, 'renderCoreHeadingOptions'),
            'block_checks_options',
            'block_checks_options_section'
        );

        add_settings_field(
            'coreButtonBlockCheck',
            esc_html__('Button', 'block-accessibility-checks'),
            array($this, 'renderCoreButtonOptions'),
            'block_checks_options',
            'block_checks_options_section'
        );

        add_settings_field(
            'coreImageBlockCheck',
            esc_html__('Image', 'block-accessibility-checks'),
            array($this, 'renderCoreImageOptions'),
            'block_checks_options',
            'block_checks_options_section'
        );

        add_settings_field(
            'coreTableBlockCheck',
            esc_html__('Table', 'block-accessibility-checks'),
            array($this, 'renderCoreTableOptions'),
            'block_checks_options',
            'block_checks_options_section'
        );
    }

    public function settingsPageLayout()
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'block-accessibility-checks'));
        }

        // Admin Page Layout
        echo '<div class="wrap">' . "\n";
        echo '	<h1>' . esc_html(get_admin_page_title()) . '</h1>' . "\n";
        echo '	<form action="options.php" method="post">' . "\n";

        settings_fields('block_checks_settings_group');
        do_settings_sections('block_checks_options');
        submit_button();

        echo '	</form>' . "\n";
        echo '</div>' . "\n";
    }

    function renderCoreHeadingOptions()
    {
        // Retrieve data from the database and set 'error' as the default value.
        $options = get_option('block_checks_options');
        $value = isset($options['coreHeadingBlockCheck']) ? $options['coreHeadingBlockCheck'] : 'error'; // Set 'error' as default

        // Field output.
        echo '<input type="radio" name="block_checks_options[coreHeadingBlockCheck]" class="coreHeadingBlockCheck_field" value="' . esc_attr('error') . '" ' . checked($value, 'error', false) . '> ' . esc_html__('Error', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreHeadingBlockCheck]" class="coreHeadingBlockCheck_field" value="' . esc_attr('warning') . '" ' . checked($value, 'warning', false) . '> ' . esc_html__('Warning', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreHeadingBlockCheck]" class="coreHeadingBlockCheck_field" value="' . esc_attr('none') . '" ' . checked($value, 'none', false) . '> ' . esc_html__('None', 'block-accessibility-checks') . '<br>';
        echo '<p class="description">' . esc_html__('How strict do you want to be with the core/heading block?', 'block-accessibility-checks') . '</p>';
    }


    function renderCoreButtonOptions()
    {
        // Retrieve data from the database and set default value.
        $options = get_option('block_checks_options');
        $value = isset($options['coreButtonBlockCheck']) ? $options['coreButtonBlockCheck'] : 'error';

        // Field output.
        echo '<input type="radio" name="block_checks_options[coreButtonBlockCheck]" class="coreButtonBlockCheck_field" value="' . esc_attr('error') . '" ' . checked($value, 'error', false) . '> ' . esc_html__('Error', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreButtonBlockCheck]" class="coreButtonBlockCheck_field" value="' . esc_attr('warning') . '" ' . checked($value, 'warning', false) . '> ' . esc_html__('Warning', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreButtonBlockCheck]" class="coreButtonBlockCheck_field" value="' . esc_attr('none') . '" ' . checked($value, 'none', false) . '> ' . esc_html__('None', 'block-accessibility-checks') . '<br>';
        echo '<p class="description">' . esc_html__('How strict do you want to be with the core/button block?', 'block-accessibility-checks') . '</p>';
    }

    function renderCoreImageOptions()
    {
        // Retrieve data from the database and set default value.
        $options = get_option('block_checks_options');
        $value = isset($options['coreImageBlockCheck']) ? $options['coreImageBlockCheck'] : 'error';

        // Field output.
        echo '<input type="radio" name="block_checks_options[coreImageBlockCheck]" class="coreImageBlockCheck_field" value="' . esc_attr('error') . '" ' . checked($value, 'error', false) . '> ' . esc_html__('Error', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreImageBlockCheck]" class="coreImageBlockCheck_field" value="' . esc_attr('warning') . '" ' . checked($value, 'warning', false) . '> ' . esc_html__('Warning', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreImageBlockCheck]" class="coreImageBlockCheck_field" value="' . esc_attr('none') . '" ' . checked($value, 'none', false) . '> ' . esc_html__('None', 'block-accessibility-checks') . '<br>';
        echo '<p class="description">' . esc_html__('How strict do you want to be with the core/image block?', 'block-accessibility-checks') . '</p>';
    }

    function renderCoreTableOptions()
    {
        // Retrieve data from the database and set default value.
        $options = get_option('block_checks_options');
        $value = isset($options['coreTableBlockCheck']) ? $options['coreTableBlockCheck'] : 'error';

        // Field output.
        echo '<input type="radio" name="block_checks_options[coreTableBlockCheck]" class="coreTableBlockCheck_field" value="' . esc_attr('error') . '" ' . checked($value, 'error', false) . '> ' . esc_html__('Error', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreTableBlockCheck]" class="coreTableBlockCheck_field" value="' . esc_attr('warning') . '" ' . checked($value, 'warning', false) . '> ' . esc_html__('Warning', 'block-accessibility-checks') . '<br>';
        echo '<input type="radio" name="block_checks_options[coreTableBlockCheck]" class="coreTableBlockCheck_field" value="' . esc_attr('none') . '" ' . checked($value, 'none', false) . '> ' . esc_html__('None', 'block-accessibility-checks') . '<br>';
        echo '<p class="description">' . esc_html__('How strict do you want to be with the core/table block?', 'block-accessibility-checks') . '</p>';
    }
}
