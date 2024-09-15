<?php

/**
 *
 * The ScriptsStyles class is responsible for enqueueing block assets and admin assets.
 *
 * @package BlockAccessibility
 */

namespace BlockAccessibility;

class ScriptsStyles
{
    private $pluginFile;
    private $translations;

    /**
     * Constructs a new instance of the ScriptsStyles class.
     *
     * @param string $pluginFile The path to the plugin file.
     * @param Translations $translations The translations object.
     */
    public function __construct($pluginFile, Translations $translations)
    {
        $this->pluginFile = $pluginFile;
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
    public function enqueueBlockAssets()
    {
        $script_handle = 'block-accessibility-script';
        $this->translations->setupScriptTranslations($script_handle);

        $this->enqueueBlockScripts();
        $this->enqueueBlockStyles();
    }

    /**
     * Enqueues the admin assets.
     *
     * This method is responsible for enqueueing the necessary scripts and styles for the admin area.
     * It sets up script translations and enqueues admin styles.
     *
     * @return void
     */
    public function enqueueAdminAssets()
    {
        $script_handle = 'block-accessibility-script';
        $this->translations->setupScriptTranslations($script_handle);

        $this->enqueueAdminStyles();
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
    private function enqueueBlockScripts()
    {
        $script_path = 'build/block-checks.js';
        $script_handle = 'block-accessibility-script';

        wp_enqueue_script(
            $script_handle,
            plugins_url($script_path, $this->pluginFile),
            ['wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'],
            filemtime(plugin_dir_path($this->pluginFile) . $script_path),
            true
        );

        /**
         * Retrieves the block checks options from the database.
         *
         * @return array The block checks options.
         */
        $block_checks_options = get_option('block_checks_options', []);

        wp_localize_script(
            $script_handle,
            'BlockAccessibilityChecks',
            array(
                'blockChecksOptions' => $block_checks_options,
                'blocks' => BlockConfig::getBlockConfig(),
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
    private function enqueueBlockStyles()
    {
        $style_path = 'build/block-checks.css';
        wp_enqueue_style(
            'block-checks-style',
            plugins_url($style_path, $this->pluginFile),
            [],
            filemtime(plugin_dir_path($this->pluginFile) . $style_path)
        );
    }

    /**
     * Enqueues the admin styles for the block accessibility checks.
     *
     * This function is responsible for enqueueing the admin styles for the block accessibility checks.
     * It uses the `wp_enqueue_style` function to enqueue the 'block-checks-admin' style.
     *
     * @access private
     */
    private function enqueueAdminStyles()
    {
        $style_path = 'build/block-admin.css';
        wp_enqueue_style('block-checks-admin', plugins_url($style_path, $this->pluginFile), []);
    }
}
