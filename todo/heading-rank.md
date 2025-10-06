# Heading Rank Validation Implementation Plan

## Overview
Add heading rank validation to check for proper heading hierarchy (h1 → h2 → h3, etc.) without skipping levels. This will leverage WordPress core's existing heading structure analysis rather than reinventing the wheel.

## Phase 1: Core Heading Block Validation (MVP)

### Goal
Implement heading rank validation for WordPress core heading blocks (`core/heading`) using WordPress's existing block editor data stores.

### Technical Approach

#### 1. Leverage WordPress Core Data Stores
Instead of building our own heading analysis, use WordPress's existing `core/block-editor` data store:

```javascript
import { select } from '@wordpress/data';

const blocks = select('core/block-editor').getBlocks();
const headingBlocks = blocks.filter(block => block.name === 'core/heading');
```

#### 2. Validation Logic
- Extract heading levels from all heading blocks in the document
- Check for skipped heading levels (e.g., h2 → h4)
- Allow proper section closure (h4 → h2 is valid when closing a subsection)

#### 3. Integration Points
- **PHP Registration**: Add heading rank check to `CoreBlockChecks.php`
- **JavaScript Validation**: Create validation function using `ba11yc.validateBlock` filter
- **UI Integration**: Use existing higher-order component system for highlighting

### Implementation Steps

#### Step 1: PHP Configuration
1. Add heading rank check to `CoreBlockChecks.php` for `core/heading` blocks
2. Configure check as warning (not error) to avoid blocking content creation
3. Add appropriate error/warning messages

#### Step 2: JavaScript Validation Function
1. Create `headingRankValidation.js` in `src/scripts/block-checks/`
2. Implement validation logic using WordPress data stores
3. Register with `ba11yc.validateBlock` filter

#### Step 3: Document Context Analysis
1. Get all heading blocks from document
2. Build heading hierarchy map
3. Identify rank violations
4. Return specific blocks that need highlighting

### Validation Rules
- **Primary Rule**: No skipping heading levels (h2 → h4 = violation)
- **Exception**: Closing subsections is allowed (h4 → h2 when starting new section)
- **Scope**: Document-wide context (not just immediate siblings)

## Phase 2: Enhanced Validation (Future)

### Custom Block Support
- Extend validation to custom blocks containing headings
- Use block attributes or inner HTML parsing
- Support nested heading structures

### Advanced Features
- Multiple h1 detection (optional warning)
- Heading content analysis
- Accessibility-specific heading rules

## Technical Considerations

### Performance
- Use WordPress's existing block data (no additional DOM parsing)
- Leverage core's heading analysis (already optimized)
- Cache heading structure when possible

### User Experience
- Real-time validation in editor
- Clear, actionable error messages
- Visual highlighting of problematic headings
- Integration with existing accessibility check system

### Integration with Existing System
- Use existing `validateBlock()` function
- Leverage current higher-order component for highlighting
- Follow established patterns for error/warning display
- Maintain consistency with other accessibility checks

## Files to Create/Modify

### New Files
- `src/scripts/block-checks/headingRankValidation.js`

### Modified Files
- `Functions/CoreBlockChecks.php` - Add heading rank check registration
- `src/scripts/block-validation/validationHooks.js` - Ensure compatibility

## Success Criteria
- [x] Core heading blocks show validation warnings for rank violations
- [x] Validation uses WordPress core data stores (not custom parsing)
- [x] Problematic headings are highlighted in editor
- [x] Validation integrates seamlessly with existing accessibility system
- [x] Performance impact is minimal
- [x] Clear, helpful error messages guide users to fix issues

## Implementation Status

### ✅ Phase 1: Core Heading Block Validation (COMPLETED)

#### ✅ Step 1: PHP Configuration
- Added `check_heading_rank` to `CoreBlockChecks.php` for `core/heading` blocks
- Configured as warning (not error) to avoid blocking content creation
- Added appropriate error/warning messages
- Added `core/heading` to supported block types

#### ✅ Step 2: JavaScript Validation Function
- Created `headingRankValidation.js` in `src/scripts/block-checks/`
- Implemented validation logic using WordPress `core/block-editor` data store
- Registered with `ba11yc.validateBlock` filter
- Added import to main `src/script.js` file

#### ✅ Step 3: Document Context Analysis
- Gets all heading blocks from document using `select('core/block-editor').getBlocks()`
- Builds heading hierarchy map with levels, clientIds, and content
- Identifies rank violations (skipping heading levels)
- Returns validation results for highlighting problematic blocks

### Validation Logic Implemented
- **Primary Rule**: No skipping heading levels (h2 → h4 = violation)
- **Exception**: Closing subsections is allowed (h4 → h2 when starting new section)
- **Scope**: Document-wide context using WordPress core data stores
- **Performance**: Leverages existing WordPress block data (no additional DOM parsing)

### Integration Points
- **PHP Registration**: ✅ Added to `CoreBlockChecks.php`
- **JavaScript Validation**: ✅ Created `headingRankValidation.js`
- **UI Integration**: ✅ Uses existing higher-order component system
- **Build Process**: ✅ Successfully compiles and builds

## Future Enhancements
- Support for custom blocks with headings
- Advanced heading structure analysis
- Integration with WordPress's document outline API
- Bulk heading structure fixes
