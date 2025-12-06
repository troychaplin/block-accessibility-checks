# Rework Message Display UX

## Overview

Replace the current clunky message display system (PluginDocumentSettingPanel and inline meta field wrappers) with a modern, native-feeling UX that includes:

1. Clean inline indicators on blocks and meta fields (small icon badges in upper-left corner)
2. Header toolbar button with issue count badge
3. Unified PluginSidebar consolidating all issues
4. Tooltip support for inline indicators
5. Auto-scroll to blocks when clicking sidebar items

## Current State Analysis

**Current Implementation:**

- Block errors: Shown in `InspectorControls` (block sidebar) via `blockErrorComponent.js`
- Editor errors: Shown in `PluginDocumentSettingPanel` via `EditorValidationDisplay.js`
- Meta errors: Shown inline around fields via `ValidationDisplay.js` and `ValidatedToolsPanelItem.js`
- Block indicators: Use `::after` pseudo-elements at `left: -50px` (outside block) - needs to be moved inside

**Files to Modify:**

- `src/scripts/components/EditorValidationDisplay.js` - Remove/replace PluginDocumentSettingPanel
- `src/scripts/validation/blockErrorComponent.js` - Update block indicator positioning
- `src/scripts/validation/ValidationDisplay.js` - Add meta field indicators
- `src/styles/editor/block-icon.scss` - Redesign block indicators (move inside, smaller)
- `src/styles/editor/meta-validation.scss` - Add meta field indicators
- `src/scripts/registerPlugin.js` - Add new unified sidebar component

**New Files to Create:**

- `src/scripts/components/ValidationHeaderButton.js` - Header toolbar button with badge
- `src/scripts/components/UnifiedValidationSidebar.js` - Consolidated sidebar
- `src/scripts/components/BlockIndicator.js` - Inline block indicator component
- `src/scripts/components/MetaIndicator.js` - Inline meta field indicator component
- `src/scripts/components/ValidationTooltip.js` - Tooltip component for indicators
- `src/styles/editor/validation-header.scss` - Header button styles
- `src/styles/editor/unified-sidebar.scss` - Unified sidebar styles
- `src/styles/editor/inline-indicators.scss` - Inline indicator styles

## Implementation Steps

### 1. Create Unified Validation Sidebar

- Consolidate block, editor, and meta validation issues into one `PluginSidebar`
- Organize by type (errors vs warnings) and category (blocks, editor, meta)
- Add click handlers to scroll to and select relevant blocks/fields
- Use native Gutenberg components (`PanelBody`, `PanelRow`, etc.)

### 2. Create Header Toolbar Button

- Use Gutenberg SlotFill system to add button to editor header
- Display badge count showing total errors/warnings
- Auto-open sidebar when clicked
- Use appropriate Gutenberg icon (warning/error icon)

### 3. Redesign Block Indicators

- Move indicators from `left: -50px` to inside block wrapper (upper-left corner)
- Reduce size to ~16-20px icon badge
- Position using absolute positioning within block wrapper
- Add tooltip on click/hover showing issue summary
- Remove old `::after` pseudo-element approach

### 4. Add Meta Field Indicators

- Create small icon badges for meta fields with validation issues
- Position in upper-left corner of field wrapper
- Match block indicator styling for consistency
- Add tooltip support

### 5. Update Block Error Component

- Keep `InspectorControls` for detailed per-block info (optional, can be removed later)
- Update wrapper classes to support new inline indicators
- Ensure block highlighting still works for visual feedback

### 6. Remove/Deprecate Old Components

- Remove `EditorValidationDisplay` PluginDocumentSettingPanel usage
- Keep validation logic but change display mechanism
- Update meta field wrappers to use new indicator system

### 7. Styling Updates

- Modern, clean indicator design matching Gutenberg aesthetics
- Proper z-index handling for indicators
- Responsive behavior
- Accessibility considerations (focus states, ARIA labels)

## Technical Considerations

**Gutenberg Components to Use:**

- `PluginSidebar` - For unified sidebar
- `SlotFill` system - For header button (likely `PluginMoreMenuItem` or custom SlotFill)
- `Popover` or `Tooltip` - For indicator tooltips
- `PanelBody`, `PanelRow` - For sidebar organization
- `Button` with `Badge` - For header button

**Data Management:**

- Reuse existing validation functions (`GetInvalidBlocks`, `GetInvalidMeta`, `GetInvalidEditorChecks`)
- Create aggregated validation state hook for header button
- Manage sidebar open/close state

**Block Selection/Scrolling:**

- Use `useSelect` to get block editor dispatch
- Use `selectBlock` action to select blocks when clicking sidebar items
- Implement smooth scrolling to selected blocks

## Testing Considerations

- Test with multiple blocks having issues
- Test with editor-level and meta-level issues
- Test tooltip interactions
- Test sidebar scrolling/selection
- Test responsive behavior
- Verify accessibility (keyboard navigation, screen readers)