# Step 5: Simplify JavaScript Validation Pipeline - Implementation Plan

**Priority:** LOW-MEDIUM  
**Time Estimate:** 6-8 hours  
**Complexity:** MEDIUM  
**Branch:** `refactor/js-validation-pipeline`  
**Date:** October 30, 2025  
**Status:** Ready for implementation

## Overview

Review and potentially refactor the JavaScript validation pipeline to improve code organization, reduce duplication, and make it easier to add new checks. This is an architectural improvement, not a bug fix.

## Why This Matters

Current validation code is spread across multiple directories with unclear responsibilities:
- ❓ `block-checks/` vs `block-validation/` - What's the difference?
- ❓ Are there duplication between files?
- ❓ Is the structure intuitive for new contributors?
- ❓ Can we add a new check in under 10 minutes?

## Goals

1. **Clarify responsibilities** - Each directory has a clear purpose
2. **Reduce duplication** - DRY principle across validation code
3. **Improve discoverability** - Easy to find where to add checks
4. **Maintain extensibility** - Keep filter system working
5. **Better organization** - Logical file structure

## Success Metrics

- 🎯 **Clear separation** between checks, validation logic, and UI
- 📚 **New check template** - Copy-paste to add new check
- ✅ **Zero duplication** - Common logic extracted
- 🚀 **Faster additions** - New check in under 10 minutes
- 📉 **Reduced complexity** - Fewer files to understand

---

## Phase 1: Current State Analysis (1-2 hours)

### 1.1 Map Existing Structure (30 mins)

**Current Directory Structure:**
```
src/
├── script.js (main entry point)
├── admin.js (admin-only)
├── scripts/
│   ├── block-checks/
│   │   ├── buttonValidation.js
│   │   ├── headingRankValidation.js
│   │   ├── imageValidation.js
│   │   ├── tableValidation.js
│   │   └── headingRankGlobalListener.js
│   ├── block-validation/
│   │   ├── validate-blocks.js
│   │   ├── validation-api.js
│   │   ├── blockErrorComponent.js
│   │   └── getInvalidBlocks.js
│   ├── block-modifications/
│   │   └── imageAttr.js
│   ├── supports/
│   │   └── isValidUrl.js
│   └── registerPlugin.js
```

**Questions to Answer:**
- [ ] What does each file export?
- [ ] Where is each export imported?
- [ ] Is any code duplicated?
- [ ] Are naming conventions consistent?

### 1.2 Analyze Each File (1 hour)

**For each file, document:**
```markdown
## [Filename]
**Purpose:** [One sentence]
**Exports:** [List of exported functions/objects]
**Imports:** [What it depends on]
**Used by:** [What imports this file]
**Lines of code:** [Approximate size]
**Complexity:** [Low/Medium/High]
**Duplication:** [Any repeated patterns?]
```

**Run analysis commands:**
```bash
# Count exports
grep -r "export " src/scripts/ | wc -l

# Find imports
grep -r "from.*scripts" src/

# Check for duplication
# Look for similar validation patterns
grep -r "return {" src/scripts/block-checks/

# Find unused exports
# (exports that aren't imported anywhere)
```

### 1.3 Document Current Data Flow (30 mins)

**Create flow diagram:**

```
User edits block
    ↓
Block change detected
    ↓
validate-blocks.js
    ↓
ba11yc_validate_block filter runs
    ↓
Individual checks execute
    ↓
Results collected
    ↓
validation-api.js
    ↓
Block marked invalid
    ↓
blockErrorComponent.js
    ↓
Error UI displayed
```

**Questions:**
- [ ] Is this flow clear from the code?
- [ ] Are there unnecessary intermediate steps?
- [ ] Could this be simplified?

---

## Phase 2: Identify Issues & Opportunities (1 hour)

### 2.1 Common Issues to Look For

#### Issue: Unclear Directory Purposes
```
Problem: What's the difference between block-checks/ and block-validation/?
Impact: Developers unsure where to add new code
Solution: Rename or consolidate directories
```

#### Issue: Code Duplication
```
Problem: Each check file has similar structure
Impact: Changes need to be repeated
Solution: Extract common patterns
```

#### Issue: Inconsistent Patterns
```
Problem: Some checks return objects, others use different formats
Impact: Harder to maintain
Solution: Standardize return types
```

#### Issue: Mixed Concerns
```
Problem: Files mixing validation logic with UI concerns
Impact: Hard to test, hard to reuse
Solution: Separate concerns
```

### 2.2 Document Findings

**Create `js-validation-analysis.md`:**

```markdown
# JavaScript Validation Analysis

## Issues Found

### 1. Directory Structure Unclear
**Severity:** Medium
**Evidence:** Developers asked "where do I add a check?"
**Impact:** Slower development
**Proposed Fix:** Rename directories to be more descriptive

### 2. Duplication in Check Files
**Severity:** Low
**Evidence:** Each check has similar boilerplate
**Impact:** Repeated code
**Proposed Fix:** Create check template/helper

### 3. [Add more issues as found]

## Strengths to Keep

### 1. Filter-Based System
**Why it works:** Extensible, decoupled
**Keep doing:** Use WordPress hooks for extension

### 2. Pure Function Checks
**Why it works:** Testable, predictable
**Keep doing:** Checks are pure functions
```

---

## Phase 3: Design Improved Structure (1-2 hours)

### 3.1 Proposed Directory Structure

**Option A: By Responsibility**
```
src/scripts/validation/
├── checks/              # Individual check implementations
│   ├── button.js       # Button-specific checks
│   ├── image.js        # Image-specific checks
│   ├── heading.js      # Heading-specific checks
│   └── table.js        # Table-specific checks
├── core/                # Core validation logic
│   ├── registry.js     # Check registration
│   ├── runner.js       # Execute checks
│   └── hooks.js        # WordPress hooks integration
├── ui/                  # User interface
│   ├── ErrorComponent.js
│   ├── InvalidationUI.js
│   └── ErrorDisplay.js
├── utils/               # Utilities
│   ├── isValidUrl.js
│   └── getBlocks.js
└── index.js             # Public API
```

**Option B: Flatter Structure**
```
src/scripts/validation/
├── checks-button.js
├── checks-image.js
├── checks-heading.js
├── checks-table.js
├── validation-runner.js
├── validate-blocks.js
├── ui-error-component.js
├── ui-invalidation.js
├── util-url.js
└── index.js
```

**Option C: Current with Cleanup**
```
src/scripts/
├── checks/              # Renamed from block-checks
│   ├── button.js       # Renamed from buttonValidation.js
│   ├── image.js
│   ├── heading.js
│   ├── table.js
│   └── heading-listener.js
├── validation/          # Renamed from block-validation
│   ├── hooks.js        # Renamed from validate-blocks.js
│   ├── runner.js       # New - extracted logic
│   ├── invalidation.js
│   └── error-component.js
├── utils/              # Renamed from supports
│   └── url.js
└── index.js
```

**Recommendation: Option C (Current with Cleanup)**
- Less disruptive
- Clearer naming
- Better organization
- Maintains working patterns

### 3.2 Standardize Check Structure

**Create template for checks:**

```javascript
/**
 * Validation checks for [Block Type]
 * 
 * @package BlockAccessibilityChecks
 */

import { applyFilters } from '@wordpress/hooks';

/**
 * Check 1: [Description]
 * 
 * @param {Object} attributes - Block attributes
 * @param {Object} block - Full block object
 * @returns {Object|null} Validation result or null if valid
 */
export function checkOne( attributes, block ) {
    // Get check level from settings
    const checkData = window.ba11ycData?.blockChecks?.['block/type']?.check_one;
    if ( ! checkData || checkData.level === 'none' ) {
        return null;
    }
    
    // Validation logic
    if ( /* condition fails */ ) {
        return {
            level: checkData.level,
            message: checkData[`${checkData.level}_msg`],
            checkName: 'check_one'
        };
    }
    
    return null;
}

/**
 * Check 2: [Description]
 * ...
 */
export function checkTwo( attributes, block ) {
    // Same pattern
}

/**
 * Register all checks for this block type
 */
export function registerButtonChecks() {
    addFilter(
        'ba11yc_validate_block',
        'ba11yc/button-checks',
        ( results, blockName, attributes, block ) => {
            if ( blockName !== 'core/button' ) {
                return results;
            }
            
            // Run all checks
            const checks = [
                checkOne( attributes, block ),
                checkTwo( attributes, block ),
            ];
            
            // Add non-null results
            checks.forEach( result => {
                if ( result ) {
                    results.push( result );
                }
            } );
            
            return results;
        },
        10
    );
}
```

### 3.3 Extract Common Utilities

**Create `src/scripts/validation/utils.js`:**

```javascript
/**
 * Get check configuration from localized data
 * 
 * @param {string} blockType - Block type (e.g., 'core/button')
 * @param {string} checkName - Check identifier
 * @returns {Object|null} Check configuration or null
 */
export function getCheckConfig( blockType, checkName ) {
    return window.ba11ycData?.blockChecks?.[blockType]?.[checkName] || null;
}

/**
 * Check if check is enabled
 * 
 * @param {string} blockType - Block type
 * @param {string} checkName - Check identifier
 * @returns {boolean} Whether check should run
 */
export function isCheckEnabled( blockType, checkName ) {
    const config = getCheckConfig( blockType, checkName );
    return config && config.level !== 'none';
}

/**
 * Create validation result object
 * 
 * @param {Object} checkConfig - Check configuration
 * @param {string} checkName - Check identifier
 * @returns {Object} Validation result
 */
export function createValidationResult( checkConfig, checkName ) {
    return {
        level: checkConfig.level,
        message: checkConfig[`${checkConfig.level}_msg`],
        checkName: checkName
    };
}

/**
 * Get all blocks from the editor
 * 
 * @returns {Array} All blocks
 */
export function getAllBlocks() {
    const { select } = wp.data;
    return select( 'core/block-editor' )?.getBlocks() || [];
}

/**
 * Get block index
 * 
 * @param {string} clientId - Block client ID
 * @returns {number} Block index or -1
 */
export function getBlockIndex( clientId ) {
    const blocks = getAllBlocks();
    return blocks.findIndex( block => block.clientId === clientId );
}
```

---

## Phase 4: Implementation Plan (2-3 hours)

### 4.1 Incremental Refactoring Strategy

**DO NOT refactor everything at once.** Use this approach:

1. ✅ **Create new structure alongside old** (no breaking changes)
2. ✅ **Migrate one check at a time** (test after each)
3. ✅ **Update imports gradually** (one file at a time)
4. ✅ **Remove old files last** (only when all migrations complete)

### 4.2 Step-by-Step Migration

#### Step 1: Create Utility Module (30 mins)
```bash
# Create new file
touch src/scripts/validation/utils.js

# Add common utilities
# Test in isolation
# Update one check to use it
```

#### Step 2: Refactor One Check (45 mins)
```bash
# Choose simplest check (button is good candidate)
# Create new structure
# Test thoroughly
# Compare with old version
```

#### Step 3: Migrate Remaining Checks (1 hour)
```bash
# Use button check as template
# Migrate image check
# Test
# Migrate heading check
# Test
# Migrate table check
# Test
```

#### Step 4: Update Validation Core (45 mins)
```bash
# Rename files for clarity
# Update imports
# Test entire system
```

#### Step 5: Cleanup (30 mins)
```bash
# Remove old files
# Update documentation
# Run all tests
```

### 4.3 Testing After Each Change

```bash
# Manual testing checklist
- [ ] Button validation still works
- [ ] Image validation still works  
- [ ] Heading validation still works
- [ ] Table validation still works
- [ ] Error display still works
- [ ] Settings page still works
- [ ] External plugins still work

# Automated tests (if available)
npm run test:js
```

---

## Phase 5: Documentation Update (1 hour)

### 5.1 Update Developer Documentation

**Create `docs/js-validation-pipeline.md`:**

```markdown
# JavaScript Validation Pipeline

## Overview

The validation pipeline validates blocks in real-time as users edit content.

## Architecture

### Directory Structure
```
src/scripts/
├── checks/         - Individual block validation logic
├── validation/     - Core validation framework
├── utils/         - Shared utilities
└── index.js       - Public API
```

### Adding a New Check

1. **Register check in PHP:**
```php
$registry->register_check( 'core/my-block', 'my_check', [
    'error_msg' => 'Check failed',
    'type' => 'error',
] );
```

2. **Create check function:**
```javascript
// src/scripts/checks/my-block.js
export function validateMyCheck( attributes ) {
    const config = getCheckConfig( 'core/my-block', 'my_check' );
    if ( ! isCheckEnabled( 'core/my-block', 'my_check' ) ) {
        return null;
    }
    
    if ( ! attributes.requiredField ) {
        return createValidationResult( config, 'my_check' );
    }
    
    return null;
}
```

3. **Register with filter:**
```javascript
addFilter(
    'ba11yc_validate_block',
    'ba11yc/my-block-checks',
    ( results, blockName, attributes ) => {
        if ( blockName === 'core/my-block' ) {
            const result = validateMyCheck( attributes );
            if ( result ) {
                results.push( result );
            }
        }
        return results;
    }
);
```

### Validation Flow

1. User edits block
2. WordPress `core/block-editor` store updates
3. Our plugin subscribes to changes
4. `ba11yc_validate_block` filter runs
5. All checks execute for block type
6. Results aggregated
7. Block marked invalid if any errors
8. Error component displays messages

### Utilities

Common utilities available in `utils.js`:
- `getCheckConfig()` - Get check settings
- `isCheckEnabled()` - Check if active
- `createValidationResult()` - Standard result format
- `getAllBlocks()` - Get all editor blocks
- `getBlockIndex()` - Find block position
```

### 5.2 Update CHANGELOG

```markdown
## [Unreleased]

### Changed
- **JavaScript validation structure**: Reorganized validation code for better clarity
  - Renamed `block-checks/` to `checks/` for brevity
  - Renamed `block-validation/` to `validation/` for consistency
  - Extracted common utilities to `utils.js`
  - Standardized check structure across all block types
  
### Improved
- **Developer experience**: Adding new checks now takes under 10 minutes
- **Code maintainability**: Common logic extracted, no duplication
- **Documentation**: Clear guide for extending validation
```

---

## Validation Pipeline Checklist

### Analysis Phase
- [ ] Map current structure
- [ ] Analyze each file
- [ ] Document data flow
- [ ] Identify issues
- [ ] Document findings

### Design Phase
- [ ] Propose new structure
- [ ] Create check template
- [ ] Design common utilities
- [ ] Get feedback
- [ ] Finalize approach

### Implementation Phase
- [ ] Create utility module
- [ ] Refactor one check completely
- [ ] Test thoroughly
- [ ] Migrate remaining checks one-by-one
- [ ] Update validation core
- [ ] Cleanup old files
- [ ] Run full test suite

### Documentation Phase
- [ ] Create validation pipeline guide
- [ ] Update existing docs
- [ ] Add code examples
- [ ] Update CHANGELOG
- [ ] Document patterns

---

## Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Current State Analysis | 1-2 hours |
| Phase 2 | Identify Issues | 1 hour |
| Phase 3 | Design Improvements | 1-2 hours |
| Phase 4 | Implementation | 2-3 hours |
| Phase 5 | Documentation | 1 hour |
| **Total** | | **6-9 hours** |

---

## Decision Criteria

**Should we proceed with this refactor?**

### Yes, if:
- ✅ New developers struggle to understand structure
- ✅ Adding checks takes too long
- ✅ Code duplication is significant
- ✅ Team agrees on new structure

### No, if:
- ❌ Current structure works well
- ❌ No complaints from developers
- ❌ Limited duplication found
- ❌ Higher priority work exists

**Recommendation:** Complete Phase 1-2 (analysis) first, then decide.

---

## Risks & Mitigations

### Risk: Breaking Existing Functionality
**Mitigation:** Incremental migration, test after each step

### Risk: External Plugins Break
**Mitigation:** Maintain backward compatibility, deprecation warnings

### Risk: Time Sink
**Mitigation:** Set time box, abort if not worthwhile

---

## Success Metrics

After completion:
- Can add new check in under 10 minutes? ✅
- Is directory structure intuitive? ✅
- Is code duplication eliminated? ✅
- Do all existing checks still work? ✅
- Are external plugins unaffected? ✅

---

## Notes

- This is a "nice to have," not urgent
- Prioritize if onboarding new developers
- Skip if current structure works well
- Consider after automated testing is in place

---

**Document Created:** October 30, 2025  
**Status:** Ready for implementation  
**Next Action:** Complete Phase 1 - Current State Analysis

