# Demo Settings Page - DataViews-Inspired (v3)

This is a React-based settings page that **replicates the DataViews look and feel** with an **extensible column architecture** for easy future expansion.

## 🎯 Design Goals Achieved

✅ **DataViews aesthetic** - Matches WordPress core table layouts  
✅ **Easily extensible** - Add new columns with minimal code  
✅ **Lightweight** - No DataViews dependency (custom implementation)  
✅ **Professional** - Clean, modern WordPress admin interface  

## 📊 Current Features

### Table with 4 Columns:
1. **Validation Check** - Primary column (bold)
2. **Block** - Badge showing which block
3. **Category** - Accessibility vs Validation badge
4. **Level** - ToggleGroupControl (Error/Warning/None)

### DataViews-Style Elements:
- Sticky table headers
- Uppercase column labels (11px)
- Subtle row hover states
- Clean borders and spacing
- Responsive mobile layout
- ARIA roles for accessibility

## 🚀 How to Add New Columns

Adding a new column is **super easy** - just update the config file!

See full documentation inside the file for examples.

## 📁 File Structure

```
src/settings-demo/
├── DemoSettingsApp.js              # Main app
├── config/
│   └── columns.js                  # 📌 COLUMN DEFINITIONS
├── components/
│   ├── SettingsHeader.js           # Page header
│   ├── SettingsTable.js            # Table container
│   ├── TableHeader.js              # Column headers
│   └── TableRow.js                 # 📌 CELL RENDERING
```

## 🎨 DataViews-Inspired Styling

Matches WordPress core DataViews with proper colors, spacing, and typography.

---

**Ready to test!** Navigate to Block Checks → Demo Settings. 🚀
