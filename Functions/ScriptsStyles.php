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

    public function enqueueAssets()
    {
        $script_handle = 'block-accessibility-script';
        $this->translations->setupScriptTranslations($script_handle);

        $this->enqueueScripts();
        $this->enqueueStyles();
    }

    private function enqueueScripts()
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

        $this->localizeScript($script_handle);
    }

    private function localizeScript($handle)
    {
        wp_localize_script(
            $handle,
            'blockAccessibilitySettings',
            ['mode' => BLOCK_ACCESSIBILITY_MODE]
        );
    }

    private function enqueueStyles()
    {
        $style_path = 'build/block-checks.css';
        wp_enqueue_style(
            'block-checks-style',
            plugins_url($style_path, $this->pluginFile),
            [],
            filemtime(plugin_dir_path($this->pluginFile) . $style_path)
        );
    }
}
