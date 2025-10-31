# Step 3: Dead Code Review - Overview

## Phase 1.2: Private Methods & Properties Review Checklist

Based on automated search results from `grep -rn "private function" Functions/` and `grep -rn "private.*\$" Functions/`

### BlockChecksRegistry.php (11 methods, 5 properties)

**Private Properties:**
- [ ] `$checks` (line 26) - Core data structure, verify usage
- [ ] `$plugin_info` (line 33) - Check if fully utilized
- [ ] `$plugin_info_cache` (line 40) - Verify caching is actually happening
- [ ] `$instance` (line 47) - Singleton instance (likely needed)
- [ ] `$core_block_checks` (line 67) - Check if used or just stored

**Private Methods:**
- [ ] `__construct()` (line 72) - Constructor (required)
- [ ] `init_core_block_checks()` (line 85) - Verify called in constructor
- [ ] `sort_checks_by_priority()` (line 316) - Verify usage in register_check()
- [ ] `get_check_level_from_settings()` (line 356) - Check callers
- [ ] `get_core_block_setting()` (line 373) - Check callers
- [ ] `get_external_block_setting()` (line 389) - Check callers
- [ ] `detect_plugin_info()` (line 463) - Verify usage
- [ ] `find_main_plugin_file()` (line 521) - Verify called by detect_plugin_info()
- [ ] `extract_plugin_info_from_block_type()` (line 581) - Check callers
- [ ] `log_error()` (line 603) - Count usage instances
- [ ] `log_debug()` (line 616) - Count usage instances

### SettingsPage.php (14 methods, 1 property)

**Private Properties:**
- [ ] `$registry` (line 30) - Verify all uses

**Private Methods:**
- [ ] `render_heading_level_options()` (line 176) - Check callers
- [ ] `add_external_plugin_menus()` (line 356) - Verify hook registration
- [ ] `register_external_plugin_settings()` (line 432) - Verify hook registration
- [ ] `render_core_settings_content()` (line 478) - Check callers
- [ ] `render_core_block_checks()` (line 488) - Check callers
- [ ] `render_core_block_options()` (line 525) - Check callers
- [ ] `render_external_plugin_settings_content()` (line 536) - Check callers
- [ ] `render_settings_page()` (line 569) - Check callers (seems like main render method)
- [ ] `render_block_options()` (line 623) - Check callers
- [ ] `extract_plugin_info_from_block_type()` (line 673) - Check callers
- [ ] `get_block_display_name()` (line 697) - Check callers
- [ ] `log_error()` (line 711) - Count usage instances
- [ ] `log_debug()` (line 724) - Count usage instances
- [ ] `display_settings_notices()` (line 739) - Check callers

### ScriptsStyles.php (4 methods, 2 properties)

**Private Properties:**
- [ ] `$plugin_file` (line 28) - Verify usage
- [ ] `$translations` (line 35) - Verify usage

**Private Methods:**
- [ ] `enqueue_block_scripts()` (line 95) - Verify hook registration
- [ ] `enqueue_block_styles()` (line 137) - Verify hook registration
- [ ] `enqueue_admin_styles()` (line 171) - Verify hook registration
- [ ] `prepare_validation_rules_for_js()` (line 190) - Check callers

### PluginInitializer.php (8 methods, 3 properties)

**Private Properties:**
- [ ] `$plugin_file` (line 25) - Verify usage
- [ ] `$text_domain` (line 32) - Verify usage
- [ ] `$services` (line 39) - Check if service container is actually used

**Private Methods:**
- [ ] `init_heading_levels()` (line 68) - Verify called in init sequence
- [ ] `init_translations()` (line 123) - Verify called in init sequence
- [ ] `init_scripts_styles()` (line 141) - Verify called in init sequence
- [ ] `init_settings_page()` (line 159) - Verify called in init sequence
- [ ] `init_block_checks_registry()` (line 176) - Verify called in init sequence
- [ ] `setup_hooks()` (line 194) - Verify called in constructor
- [ ] `log_error()` (line 280) - Count usage instances
- [ ] `log_debug()` (line 293) - Count usage instances

### HeadingLevels.php (3 methods, 1 property)

**Private Properties:**
- [ ] `$cached_options` (line 33) - Verify caching is working and beneficial

**Private Methods:**
- [ ] `get_options()` (line 52) - Check callers
- [ ] `log_error()` (line 161) - Count usage instances
- [ ] `log_debug()` (line 174) - Count usage instances

### CoreBlockChecks.php (1 method, 1 property)

**Private Properties:**
- [ ] `$registry` (line 29) - Verify usage

**Private Methods:**
- [ ] `get_core_block_check_definitions()` (line 87) - Check callers

### Translations.php (2 properties)

**Private Properties:**
- [ ] `$plugin_file` (line 30) - Verify usage
- [ ] `$text_domain` (line 37) - Verify usage

---

## Summary Statistics

- **Total Private Methods:** 41
- **Total Private Properties:** 13
- **Files to Review:** 7

## Key Areas to Investigate

1. **Logging Methods:** `log_error()` and `log_debug()` appear in multiple classes - are they all necessary?
2. **Plugin Info Caching:** `$plugin_info_cache` in BlockChecksRegistry - is caching actually happening?
3. **Service Container:** `$services` in PluginInitializer - is `get_service()` actually used?
4. **Duplicate Methods:** `extract_plugin_info_from_block_type()` exists in both BlockChecksRegistry and SettingsPage

## Next Steps

For each item above:
1. Search for usage: `grep -rn "method_name\|property_name" Functions/`
2. Verify it's actually called/read (not just set)
3. Document findings in main dead-code-review document
4. Mark for removal or keep with justification