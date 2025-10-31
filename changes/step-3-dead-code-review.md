# Step 3: Dead Code Review - Implementation Plan

**Priority:** MEDIUM  
**Time Estimate:** 6-10 hours  
**Branch:** `cleanup/dead-code-review`  
**Date:** October 30, 2025  
**Status:** Ready for implementation

## Overview

Conduct a comprehensive, methodical audit of the entire codebase to identify and remove dead code, unused methods, unreferenced properties, and unnecessary complexity. This builds on the previous cleanups to ensure the codebase contains only functional, purposeful code.

## Goals

1. **Identify all unused code** - Methods, properties, callbacks that are never called
2. **Find unreachable code paths** - Conditional logic that can never execute
3. **Detect write-only properties** - Variables set but never read
4. **Discover redundant validation** - Duplicate sanitization/validation
5. **Locate legacy compatibility code** - Old code kept "just in case"
6. **Remove console.log and debug code** - Development artifacts in production

## Success Metrics

- 🎯 Zero warnings from static analysis tools
- 📉 10-15% reduction in total code (estimated 100-150 lines)
- 🧹 All private methods have confirmed callers
- ✅ All class properties are actually used
- 🚀 No console.log statements in production code

---

## Phase 1: Automated Analysis & Tooling (1-2 hours)

### 1.1 Run PHP_CodeSniffer (15 minutes)

**Purpose:** Check for WordPress coding standards violations and potential issues

```bash
cd /path/to/block-accessibility-checks/
vendor/bin/phpcs --standard=WordPress Functions/
```

**Document findings:**
- Coding standard violations
- Unused variable warnings
- Complexity warnings

### 1.2 Search for Common Dead Code Patterns (30 minutes)

#### Private Methods
```bash
# List all private methods
grep -rn "private function" Functions/

# For each private method found, search for usage
# Example: If you find private function foo()
grep -rn "\->foo(" Functions/
grep -rn "self::foo(" Functions/
```

#### Private Properties
```bash
# List all private properties
grep -rn "private \$" Functions/

# For each property, search for reads (not just writes)
# Example: If you find private $bar
grep -rn "\$this->bar" Functions/
```

#### Unused Parameters
```bash
# Look for parameters that might be unused
# This requires manual inspection of each method
```

### 1.3 Search for Debug/Development Code (15 minutes)

```bash
# Console logs in JavaScript
grep -rn "console.log" src/
grep -rn "console.error" src/
grep -rn "console.warn" src/

# Error logs in PHP (check if needed)
grep -rn "error_log" Functions/

# Commented-out code blocks
grep -rn "^[[:space:]]*//" src/
```

### 1.4 Search for Legacy Code Markers (15 minutes)

```bash
# Deprecated code
grep -rn "@deprecated" Functions/
grep -rn "deprecated" Functions/

# Backward compatibility mentions
grep -rn "backward compatibility" Functions/
grep -rn "backwards compatibility" Functions/

# Legacy mentions
grep -rn "legacy" Functions/
grep -rn "old way" Functions/

# TODO/FIXME comments that might indicate unused code
grep -rn "TODO" Functions/ src/
grep -rn "FIXME" Functions/ src/
```

### 1.5 Analyze Hook Registrations (30 minutes)

```bash
# List all hook registrations
grep -rn "add_action\|add_filter" Functions/

# For each callback, verify:
# 1. The method exists
# 2. The method is not empty
# 3. The callback is actually needed
```

**Output:** Create `analysis-results.md` with all findings organized by category

---

## Phase 2: PHP Code Review - File by File (3-4 hours)

### 2.1 BlockChecksRegistry.php (1 hour)

**Current Size:** 622 lines  
**Complexity:** HIGH - Core registry logic

#### Review Checklist:

**Public Methods** (External API - be cautious):
- [ ] `get_instance()` - ✅ Singleton, must keep
- [ ] `register_check()` - Check if all parameters used
- [ ] `register_check_with_plugin_detection()` - Is this used externally?
- [ ] `unregister_check()` - Is this used externally?
- [ ] `set_check_enabled()` - Is this used externally?
- [ ] `is_check_registered()` - Search for callers
- [ ] `get_check_config()` - Search for callers
- [ ] `get_checks()` - Verify all callers
- [ ] `get_all_checks()` - Used by SettingsPage?
- [ ] `get_registered_block_types()` - Used by SettingsPage?
- [ ] `get_effective_check_level()` - Used by JavaScript?
- [ ] `get_plugin_info()` - Used by SettingsPage?
- [ ] `get_all_plugin_info()` - Used by SettingsPage?
- [ ] `get_debug_info()` - Used anywhere?
- [ ] `get_core_block_checks()` - Used anywhere?

**Private Methods** (Internal only - safe to remove if unused):
- [ ] `init_core_block_checks()` - Called in constructor?
- [ ] `sort_checks_by_priority()` - Used in `register_check()`?
- [ ] `get_check_level_from_settings()` - Used in `get_effective_check_level()`?
- [ ] `get_core_block_setting()` - Used in `get_check_level_from_settings()`?
- [ ] `get_external_block_setting()` - Used in `get_check_level_from_settings()`?
- [ ] `detect_plugin_info()` - Used in `register_check_with_plugin_detection()`?
- [ ] `find_main_plugin_file()` - Used in `detect_plugin_info()`?
- [ ] `extract_plugin_info_from_block_type()` - Used in `get_external_block_setting()`?
- [ ] `log_error()` - Count usage, is it helpful?
- [ ] `log_debug()` - Count usage, is it helpful?

**Private Properties**:
- [ ] `$checks` - Core data structure
- [ ] `$plugin_info` - Is this fully utilized?
- [ ] `$plugin_info_cache` - Is caching actually happening?
- [ ] `$instance` - Singleton instance
- [ ] `$core_block_checks` - Used or just stored?

**Areas of Interest**:
- Plugin detection logic (lines ~490-605) - Is this all necessary?
- Error logging - Is WP_DEBUG check repeated too often?
- Can any validation be simplified?

**Search Commands**:
```bash
# Check usage of each public method
grep -rn "register_check_with_plugin_detection" .
grep -rn "get_debug_info" .
grep -rn "get_core_block_checks" .

# Check if plugin_info_cache is actually used
grep -rn "plugin_info_cache" Functions/
```

### 2.2 CoreBlockChecks.php (1 hour)

**Current Size:** 222 lines  
**Complexity:** MEDIUM - Check definitions

#### Review Checklist:

**Public Methods**:
- [ ] `__construct()` - Required
- [ ] `register_default_checks()` - Called from Registry?

**Private Methods**:
- [ ] `register_button_checks()` - Called in register_default_checks()?
- [ ] `register_image_checks()` - Called in register_default_checks()?
- [ ] `register_heading_checks()` - Called in register_default_checks()?
- [ ] `register_table_checks()` - Called in register_default_checks()?

**Check Configuration**:
- [ ] Are all check configurations actually used in JavaScript?
- [ ] Are error_msg and warning_msg both necessary for each check?
- [ ] Are priorities meaningful or all the same?

**Search Commands**:
```bash
# Verify each check is used in JavaScript
grep -rn "button_text_check" src/
grep -rn "button_link_check" src/
grep -rn "image_alt_text" src/
grep -rn "image_alt_decorative" src/
# ... etc for all checks
```

### 2.3 SettingsPage.php (45 minutes)

**Current Size:** 756 lines  
**Complexity:** HIGH - Lots of rendering logic

#### Review Checklist:

**Public Methods**:
- [ ] `__construct()` - Required
- [ ] `init()` - Hook registration
- [ ] `init_settings()` - Settings registration

**Private Methods - Review each**:
- [ ] `add_settings_page()` - Used in init()?
- [ ] `register_settings()` - Used in init()?
- [ ] `render_settings_page()` - Callback for admin menu?
- [ ] `render_settings_sections()` - Called in render_settings_page()?
- [ ] `render_core_blocks_section()` - Callback for settings section?
- [ ] `render_external_plugins_section()` - Callback for settings section?
- [ ] `render_heading_levels_section()` - Callback for settings section?
- [ ] `render_core_heading_options()` - Callback for settings field?
- [ ] `render_block_type_settings()` - Called in render methods?
- [ ] `render_check_option()` - Called in render_block_type_settings()?
- [ ] `render_error_setting()` - Called in render_check_option()?
- [ ] `render_warning_setting()` - Called in render_check_option()?
- [ ] `sanitize_settings()` - Callback for register_setting()?
- [ ] `render_plugin_separator()` - Called anywhere?
- [ ] `get_plugin_info()` - Called in rendering?

**Potential Simplifications**:
- Can render_error_setting() and render_warning_setting() be combined?
- Are there repeated HTML patterns that could be extracted?
- Is get_plugin_info() just wrapping a registry call?

**Search Commands**:
```bash
# Find all method calls
grep -rn "render_error_setting\|render_warning_setting" Functions/SettingsPage.php
grep -rn "render_plugin_separator" Functions/
```

### 2.4 ScriptsStyles.php (30 minutes)

**Current Size:** 221 lines  
**Complexity:** LOW-MEDIUM - Asset management

#### Review Checklist:

**Public Methods**:
- [ ] `__construct()` - Required
- [ ] `init()` - Hook registration

**Private Methods**:
- [ ] `enqueue_editor_assets()` - Hooked to enqueue_block_editor_assets?
- [ ] `enqueue_admin_assets()` - Hooked to admin_enqueue_scripts?
- [ ] `get_localized_data()` - Called in enqueue methods?

**Localized Data Review**:
- [ ] `adminUrl` - Used in JavaScript?
- [ ] `blockChecks` - Used in JavaScript?
- [ ] `userSettings` - Used in JavaScript?
- [ ] `ajaxUrl` - Used anywhere?
- [ ] `nonce` - Used anywhere?

**Search Commands**:
```bash
# Check JavaScript usage of localized data
grep -rn "ba11ycData.adminUrl" src/
grep -rn "ba11ycData.blockChecks" src/
grep -rn "ba11ycData.userSettings" src/
grep -rn "ba11ycData.ajaxUrl" src/
grep -rn "ba11ycData.nonce" src/
```

### 2.5 PluginInitializer.php (30 minutes)

**Current Size:** 299 lines  
**Complexity:** MEDIUM - Service container

#### Review Checklist:

**Public Methods**:
- [ ] `__construct()` - Required
- [ ] `get_service()` - Is this used externally?

**Private Methods**:
- [ ] `init_services()` - Called on 'init' hook?
- [ ] `init_registry()` - Called in init_services()?
- [ ] `init_settings_page()` - Called in init_services()?
- [ ] `init_scripts_styles()` - Called in init_services()?
- [ ] `init_translations()` - Called in init_services()?
- [ ] `init_heading_levels()` - Called in constructor?
- [ ] `fire_ready_action()` - Called in init_services()?

**Service Container Review**:
- [ ] Is `get_service()` actually called anywhere?
- [ ] Could service initialization be simplified?
- [ ] Are all services actually used?

**Search Commands**:
```bash
# Check if get_service is used
grep -rn "->get_service(" .
grep -rn "get_service\(" .
```

### 2.6 HeadingLevels.php (30 minutes)

**Current Size:** 180 lines  
**Complexity:** LOW - Filter logic

#### Review Checklist:

**Public Methods**:
- [ ] `__construct()` - Required
- [ ] `init()` - Hook registration

**Private Methods**:
- [ ] `restrict_heading_blocks()` - Callback for register_block_type_args?
- [ ] `get_allowed_heading_levels()` - Called in restrict_heading_blocks()?

**Filter Logic**:
- [ ] Is the heading restriction actually used?
- [ ] Are settings properly retrieved?
- [ ] Can logic be simplified?

### 2.7 Translations.php (15 minutes)

**Current Size:** 78 lines  
**Complexity:** LOW - i18n setup

#### Review Checklist:

**Public Methods**:
- [ ] `__construct()` - Required
- [ ] `init()` - Hook registration

**Private Methods**:
- [ ] `load_textdomain()` - Callback for init?

**Questions**:
- [ ] Is this class even necessary or could it be inline?
- [ ] Is textdomain loading happening correctly?

---

## Phase 3: JavaScript Dead Code Review (1-2 hours)

### 3.1 Main Entry Points (30 minutes)

#### src/script.js
- [ ] Review all imports - are they used?
- [ ] Check for unused functions
- [ ] Verify all registered hooks are needed

#### src/admin.js
- [ ] Review admin-specific code
- [ ] Check for duplicate logic with script.js
- [ ] Verify asset enqueuing is correct

### 3.2 Block Validation Files (30 minutes)

#### src/scripts/block-validation/
- [ ] `validationHooks.js` - All filters used?
- [ ] `blockInvalidation.js` - All functions called?
- [ ] `blockErrorComponent.js` - Component actually used?
- [ ] `getInvalidBlocks.js` - Function called anywhere?

**Search for usage**:
```bash
# Check if each exported function is imported elsewhere
grep -rn "from.*validationHooks" src/
grep -rn "from.*blockInvalidation" src/
grep -rn "from.*blockErrorComponent" src/
grep -rn "from.*getInvalidBlocks" src/
```

### 3.3 Block Checks Files (30 minutes)

#### src/scripts/block-checks/
- [ ] `buttonValidation.js` - Used in validation hooks?
- [ ] `imageValidation.js` - Used in validation hooks?
- [ ] `tableValidation.js` - Used in validation hooks?
- [ ] `headingRankValidation.js` - Used in validation hooks?
- [ ] `headingRankGlobalListener.js` - Event listeners registered?

**For each check file**:
1. Verify it's imported in script.js
2. Confirm the validation function is called
3. Check if all helper functions are used
4. Look for console.log statements

### 3.4 Support Files (15 minutes)

#### src/scripts/supports/isValidUrl.js
- [ ] Is this function imported and used?
- [ ] Could it be inlined if simple?

#### src/scripts/block-modifications/imageAttr.js
- [ ] Are block modifications applied?
- [ ] Is this still needed with current validation?

### 3.5 Debug Code Cleanup (15 minutes)

```bash
# Find all console statements
grep -rn "console\." src/

# For each console statement, determine:
# - Is it necessary for debugging?
# - Should it be removed for production?
# - Should it be wrapped in a debug flag?
```

---

## Phase 4: Documentation & Reporting (1 hour)

### 4.1 Create Findings Report

Create `dead-code-findings.md` with structure:

```markdown
# Dead Code Review Findings

## Executive Summary
- Total files reviewed: X
- Dead code found: Y instances
- Lines to be removed: Z
- Estimated impact: A% reduction

## Confirmed Dead Code (Safe to Remove)

### PHP
- [ ] ClassName::method_name() - Never called (Lines X-Y)
  - Evidence: grep search shows no callers
  - Impact: Remove Z lines
  
### JavaScript
- [ ] functionName() in file.js - Never imported (Lines X-Y)
  - Evidence: no import statements found
  - Impact: Remove Z lines

## Potentially Unused (Needs Discussion)

### Methods with Single Caller
- [ ] ClassName::method_name() - Only called in one place
  - Could be inlined? or Should remain for clarity?

### Properties with Limited Use
- [ ] ClassName::$property - Only written, never read
  - Is this for future use?

## Code to Keep (Verified as Used)

- [x] ClassName::method_name() - Used by:
  - External plugins via hook
  - SettingsPage rendering
  
## Debug Code Found

### Console Statements
- [ ] console.log in file.js:42 - Remove
- [ ] console.error in file.js:89 - Keep (error handling)

## Recommendations

1. **High Priority** - Remove confirmed dead code (saves X lines)
2. **Medium Priority** - Discuss potentially unused code
3. **Low Priority** - Optimize structures with limited use
```

### 4.2 Create Removal Plan

For each piece of dead code found, document:
1. **Location** - File and line numbers
2. **Evidence** - Why we believe it's unused
3. **Risk Level** - Low/Medium/High
4. **Dependencies** - What else might be affected

### 4.3 Update CHANGELOG

Prepare changelog entry:
```markdown
## [Unreleased]

### Removed
- **Dead code from systematic review**: Removed X unused methods, Y unused properties, and Z debug statements (~N lines)
  - List specific removals here
  
### Improved
- **Code clarity**: Removed all dead code paths identified in systematic review
- **Maintainability**: Codebase now contains only functional code
```

---

## Phase 5: Implementation & Testing (2-3 hours)

### 5.1 Remove Dead Code (1-2 hours)

For each confirmed dead code item:
1. Create a backup branch
2. Remove the code
3. Run linter
4. Test locally
5. Commit with clear message

**Commit Message Template**:
```
Remove unused method ClassName::methodName()

- Method was never called in codebase
- Identified in systematic dead code review
- No external usage detected
- Reduces code by X lines
```

### 5.2 Testing Checklist

After each removal:
- [ ] Run PHPCS: `vendor/bin/phpcs Functions/`
- [ ] Check for PHP errors: Load in WordPress
- [ ] Test settings page renders correctly
- [ ] Test block editor loads correctly
- [ ] Test validation still works on sample blocks
- [ ] Check browser console for JS errors

### 5.3 Final Verification

```bash
# Ensure no new dead code introduced
grep -rn "private function" Functions/
# Manually verify each still has callers

# Check JavaScript imports/exports align
# ... specific checks per file
```

---

## Risk Assessment

### Low Risk Removals
- Private methods with no callers
- Console.log statements
- Commented-out code
- Unused imports

### Medium Risk Removals
- Public methods with no internal usage (might be used externally)
- Properties that are set but not read (might be for debugging)
- Helper methods with single caller (might be kept for clarity)

### High Risk Removals (Avoid)
- Public API methods (even if seemingly unused)
- Hook callbacks (even if they appear simple)
- Methods called via string references
- Anything marked as part of external API

---

## Tools & Resources

### Automated Tools
- **PHPCS**: `vendor/bin/phpcs --standard=WordPress Functions/`
- **Grep searches**: See commands throughout this doc
- **IDE features**: Use built-in "Find Usages" functionality

### Manual Review
- Read code top-to-bottom for each class
- Trace execution paths
- Check WordPress hook documentation
- Review external plugin integration docs

### External References
- WordPress Plugin API documentation
- PHP static analysis best practices
- JavaScript module system documentation

---

## Success Criteria

- [ ] All automated searches completed and documented
- [ ] Every PHP class reviewed with checklist completed
- [ ] Every JavaScript file reviewed for dead code
- [ ] Findings report created with evidence
- [ ] All confirmed dead code removed
- [ ] Tests pass after each removal
- [ ] CHANGELOG updated
- [ ] No linter errors
- [ ] Plugin functions correctly in WordPress

---

## Rollback Plan

If issues are discovered:
1. Git revert specific commits
2. Document why code was actually needed
3. Update findings report with lessons learned
4. Add comments to code explaining purpose

---

## Estimated Timeline

| Phase | Time | Cumulative |
|-------|------|-----------|
| Phase 1: Automated Analysis | 1-2 hours | 1-2 hours |
| Phase 2: PHP Review | 3-4 hours | 4-6 hours |
| Phase 3: JavaScript Review | 1-2 hours | 5-8 hours |
| Phase 4: Documentation | 1 hour | 6-9 hours |
| Phase 5: Implementation & Testing | 2-3 hours | 8-12 hours |
| **Total** | **8-12 hours** | |

---

## Notes

- This is a thorough, systematic review - don't rush
- When in doubt about a piece of code, document it in "Needs Discussion" section
- Focus on confirmed dead code first
- Keep external plugin compatibility in mind
- Document everything for future reference

---

**Document Created:** October 30, 2025  
**Status:** Ready for implementation  
**Next Action:** Begin Phase 1 - Automated Analysis

