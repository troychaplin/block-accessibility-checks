<?php

namespace BlockAccessibility;

class AssetEnqueuer
{
    private $pluginFile;

    public function __construct($pluginFile) {
        // Ensure the plugin file points to the main plugin file, typically plugin.php at the root
        $this->pluginFile = $pluginFile;
    }

    public function enqueueAssets() {
        $script_path = 'build/block-checks.js';
        $style_path = 'build/block-checks.css';
    
        $script_handle = 'block-accessibility-script';
    
        wp_enqueue_script(
            $script_handle,
            plugins_url($script_path, $this->pluginFile),
            ['wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'],
            filemtime(plugin_dir_path($this->pluginFile) . $script_path),
            true
        );
    
        wp_enqueue_style(
            'block-checks-style',
            plugins_url($style_path, $this->pluginFile),
            [],
            filemtime(plugin_dir_path($this->pluginFile) . $style_path)
        );
    
        // Load the text domain for the script
        wp_set_script_translations(
            $script_handle,
            'block-accessibility-checks',
            plugin_dir_path($this->pluginFile) . 'languages'
        );
    }
}
