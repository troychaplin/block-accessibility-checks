<?php

namespace BlockAccessibility;

class SettingsPage
{
    public function __construct()
    {
        add_action('admin_menu', [$this, 'settingsPage']);
        add_action('admin_init', [$this, 'registerSettings']);
    }

    public function settingsPage()
    {
        $this->blockCheckSettingsPage();
    }

    public function blockCheckSettingsPage()
    {
        add_options_page(
            __('Block Checks', 'block-accessibility-checks'),
            __('Block Checks', 'block-accessibility-checks'),
            'manage_options',
            'block-checks',
            [$this, 'renderBlockOptionsPage']
        );
    }

    public function registerSettings()
    {
        // Debugging output to ensure this is only called once
        error_log('registerSettings called');

        // Register settings for header and image block checks
        register_setting('block-checks-settings-group', 'header_block_check');
        register_setting('block-checks-settings-group', 'image_block_check');

        // Add settings section
        add_settings_section(
            'block-checks-settings-section',
            __('Block Accessibility Check Options', 'block-accessibility-checks'),
            null, // No callback needed for this simple section
            'block-checks'
        );

        // Add settings fields
        add_settings_field(
            'header_block_check',
            __('Header Block Check', 'block-accessibility-checks'),
            [$this, 'renderHeaderBlockCheckField'],
            'block-checks',
            'block-checks-settings-section'
        );

        add_settings_field(
            'image_block_check',
            __('Image Block Check', 'block-accessibility-checks'),
            [$this, 'renderImageBlockCheckField'],
            'block-checks',
            'block-checks-settings-section'
        );
    }

    public function renderBlockOptionsPage()
    {
        // Debugging output to ensure this is only called once
        error_log('renderBlockOptionsPage called');

?>
        <div class="wrap">
            <h1><?php _e('Block Accessibility Checks', 'block-accessibility-checks'); ?></h1>
            <p><?php _e('Manage your settings for block accessibility checks below.', 'block-accessibility-checks'); ?></p>
            <form method="post" action="options.php">
                <?php
                settings_fields('block-checks-settings-group'); // Output security fields for the registered setting
                do_settings_sections('block-checks'); // Output the settings section and fields for the page slug 'block-checks'
                submit_button(); // Output the save settings button
                ?>
            </form>
        </div>
    <?php
    }

    public function renderHeaderBlockCheckField()
    {
        $value = get_option('header_block_check', 'error'); // Default to 'error' if not set
    ?>
        <label><input type="radio" name="header_block_check" value="error" <?php checked($value, 'error'); ?>> <?php _e('Error', 'block-accessibility-checks'); ?></label><br>
        <label><input type="radio" name="header_block_check" value="warning" <?php checked($value, 'warning'); ?>> <?php _e('Warning', 'block-accessibility-checks'); ?></label><br>
        <label><input type="radio" name="header_block_check" value="none" <?php checked($value, 'none'); ?>> <?php _e('None', 'block-accessibility-checks'); ?></label>
    <?php
    }

    public function renderImageBlockCheckField()
    {
        $value = get_option('image_block_check', 'error'); // Default to 'error' if not set
    ?>
        <label><input type="radio" name="image_block_check" value="error" <?php checked($value, 'error'); ?>> <?php _e('Error', 'block-accessibility-checks'); ?></label><br>
        <label><input type="radio" name="image_block_check" value="warning" <?php checked($value, 'warning'); ?>> <?php _e('Warning', 'block-accessibility-checks'); ?></label><br>
        <label><input type="radio" name="image_block_check" value="none" <?php checked($value, 'none'); ?>> <?php _e('None', 'block-accessibility-checks'); ?></label>
<?php
    }
}

// Instantiate the class to hook everything up
new SettingsPage();
