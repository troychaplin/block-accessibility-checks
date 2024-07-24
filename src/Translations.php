<?php

namespace BlockAccessibility;

class Translations
{
    private $pluginFile;
    private $textDomain;

    public function __construct($pluginFile, $textDomain) {
        $this->pluginFile = $pluginFile;
        $this->textDomain = $textDomain;
    }

    public function loadTextDomain() {
        load_plugin_textdomain($this->textDomain, false, dirname(plugin_basename($this->pluginFile)) . '/languages/');
    }

    public function setupScriptTranslations($scriptHandle) {
        wp_set_script_translations(
            $scriptHandle,
            $this->textDomain,
            plugin_dir_path($this->pluginFile) . 'languages'
        );
    }
}
