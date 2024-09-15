<?php

namespace BlockAccessibility;

class ScriptsStyles
{
    private $pluginFile;
    private $translations;

    public function __construct($pluginFile, Translations $translations)
    {
        $this->pluginFile = $pluginFile;
        $this->translations = $translations;
    }

    public function enqueueBlockAssets()
    {
        $script_handle = 'block-accessibility-script';
        $this->translations->setupScriptTranslations($script_handle);

        $this->enqueueBlockScripts();
        $this->enqueueBlockStyles();
    }

    public function enqueueAdminAssets()
    {
        $script_handle = 'block-accessibility-script';
        $this->translations->setupScriptTranslations($script_handle);

        $this->enqueueAdminStyles();
    }

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

        // Get the block check options from the database
        $block_checks_options = get_option('block_checks_options', []);

        // Localize the block check options array to use in JavaScript
        wp_localize_script(
            $script_handle,
            'BlockAccessibilityChecks',
            array('blockChecksOptions' => $block_checks_options)
        );
    }

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

    private function enqueueAdminStyles()
    {
        $style_path = 'build/block-admin.css';
        wp_enqueue_style('block-checks-admin', plugins_url($style_path, $this->pluginFile), []);
    }
}
