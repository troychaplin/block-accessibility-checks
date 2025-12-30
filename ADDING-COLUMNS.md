# Adding New Columns to Settings Table

This guide shows you how to easily add new columns to the DataViews-style settings table.

## Quick Example: Add a "Priority" Column

### Step 1: Define the Column (`src/settings-demo/config/columns.js`)

```javascript
export const COLUMNS = [
	{
		id: 'check',
		header: __('Validation Check', 'block-accessibility-checks'),
		width: '1fr',
		minWidth: '300px',
		primary: true,
	},
	{
		id: 'block',
		header: __('Block', 'block-accessibility-checks'),
		width: '180px',
	},
	// 🆕 ADD NEW COLUMN HERE
	{
		id: 'priority',
		header: __('Priority', 'block-accessibility-checks'),
		width: '120px',
		enableSorting: true, // Future feature
	},
	{
		id: 'level',
		header: __('Level', 'block-accessibility-checks'),
		width: '240px',
		align: 'right',
	},
];
```

### Step 2: Render the Cell Content (`src/settings-demo/components/TableRow.js`)

Add a case in the `renderCell()` function:

```javascript
const renderCell = (column) => {
	switch (column.id) {
		case 'check':
			return (
				<div className="ba11y-dataview-cell-content">
					<span className="ba11y-check-description">
						{row.check.description}
					</span>
				</div>
			);

		// ... other cases ...

		// 🆕 ADD NEW CASE HERE
		case 'priority':
			return (
				<div className="ba11y-dataview-cell-content">
					<span className="ba11y-priority-badge">
						{row.check.priority || 'Medium'}
					</span>
				</div>
			);

		case 'level':
			// ... existing code ...
	}
};
```

### Step 3: (Optional) Add Styles (`src/settings-demo.scss`)

```scss
// Priority badge
.ba11y-priority-badge {
	display: inline-flex;
	align-items: center;
	padding: 3px 8px;
	background: #fff3cd;
	border: 1px solid #ffc107;
	border-radius: 2px;
	font-size: 11px;
	color: #856404;
	font-weight: 500;
	text-transform: uppercase;
}
```

### Step 4: Rebuild

```bash
npm run build
```

**That's it!** Your new column will automatically appear in the table.

---

## Column Configuration Options

```javascript
{
	id: 'unique-id',           // Required: Unique column identifier
	header: 'Display Name',    // Required: Column header text (use __ for i18n)
	width: '200px',            // Required: CSS width (px, %, 1fr, etc.)
	minWidth: '100px',         // Optional: Minimum width
	maxWidth: '500px',         // Optional: Maximum width
	enableSorting: true,       // Optional: Enable sorting (future feature)
	align: 'left',             // Optional: left|center|right (default: left)
	primary: false,            // Optional: Bold treatment (default: false)
}
```

---

## More Column Examples

### Status Column (with colored badge)

```javascript
// In columns.js
{
	id: 'status',
	header: __('Status', 'block-accessibility-checks'),
	width: '100px',
}

// In TableRow.js
case 'status':
	const statusClass = row.check.enabled ? 'status-active' : 'status-inactive';
	return (
		<div className="ba11y-dataview-cell-content">
			<span className={`ba11y-status-badge ${statusClass}`}>
				{row.check.enabled ? 'Active' : 'Inactive'}
			</span>
		</div>
	);

// In settings-demo.scss
.ba11y-status-badge {
	display: inline-flex;
	padding: 3px 8px;
	border-radius: 2px;
	font-size: 11px;
	font-weight: 500;

	&.status-active {
		background: #d1f4e0;
		color: #007017;
	}

	&.status-inactive {
		background: #f0f0f1;
		color: #646970;
	}
}
```

### Help Link Column

```javascript
// In columns.js
{
	id: 'help',
	header: '',
	width: '60px',
	align: 'center',
}

// In TableRow.js
case 'help':
	return (
		<div className="ba11y-dataview-cell-content">
			<a
				href={`https://example.com/docs/${row.check.name}`}
				target="_blank"
				rel="noopener noreferrer"
				className="ba11y-help-link"
			>
				<Icon icon={help} />
			</a>
		</div>
	);
```

### Actions Menu Column

```javascript
// In columns.js
{
	id: 'actions',
	header: '',
	width: '60px',
	align: 'right',
}

// In TableRow.js (using WordPress components)
import { DropdownMenu } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';

case 'actions':
	return (
		<div className="ba11y-dataview-cell-content">
			<DropdownMenu
				icon={moreVertical}
				label={__('Actions', 'block-accessibility-checks')}
				controls={[
					{
						title: __('Reset to default', 'block-accessibility-checks'),
						onClick: () => handleReset(row.id),
					},
					{
						title: __('View documentation', 'block-accessibility-checks'),
						onClick: () => handleViewDocs(row.id),
					},
				]}
			/>
		</div>
	);
```

---

## Tips & Best Practices

### Column Widths:
- Use `1fr` for flexible columns that fill available space
- Use `px` for fixed-width columns (badges, actions, etc.)
- Set `minWidth` to prevent columns from getting too narrow
- First column usually `1fr` with a `minWidth`

### Column Order:
- Primary content (check name) comes first
- Metadata (block, category) in middle
- Actions/controls (level, actions) on right

### Alignment:
- Text content: `align: 'left'` (default)
- Numbers: `align: 'right'`
- Icons/actions: `align: 'center'` or `'right'`

### Responsive:
- Columns automatically stack on mobile (<782px)
- Consider which columns are most important
- Very wide tables might need horizontal scroll

### Accessibility:
- Use semantic `role` attributes (already handled)
- Ensure badges have proper color contrast
- Interactive elements need focus states
- Screen readers should announce column headers

---

## Common Patterns

### Badge with Icon:
```javascript
import { check } from '@wordpress/icons';

<span className="ba11y-badge">
	<Icon icon={check} size={16} />
	{label}
</span>
```

### Tooltip on Hover:
```javascript
import { Tooltip } from '@wordpress/components';

<Tooltip text={row.check.description}>
	<span className="ba11y-badge">{label}</span>
</Tooltip>
```

### Conditional Rendering:
```javascript
case 'advanced':
	if (!row.check.supportsAdvanced) {
		return <div className="ba11y-dataview-cell-content">—</div>;
	}
	return (
		<div className="ba11y-dataview-cell-content">
			{/* Your content */}
		</div>
	);
```

---

## Testing Your New Column

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Check in browser:**
   - Navigate to Block Checks → Demo Settings
   - Verify column appears with correct header
   - Check alignment and spacing
   - Test responsive behavior (resize window)

3. **Verify accessibility:**
   - Tab through table with keyboard
   - Use screen reader to verify column headers
   - Check color contrast for badges

4. **Test edge cases:**
   - Empty/null values
   - Very long text
   - Special characters
   - Different browsers

---

## Removing a Column

Simply remove it from the `COLUMNS` array in `columns.js`:

```javascript
// Before
export const COLUMNS = [
	{ id: 'check', ... },
	{ id: 'block', ... },
	{ id: 'category', ... },  // ← Remove this
	{ id: 'level', ... },
];

// After
export const COLUMNS = [
	{ id: 'check', ... },
	{ id: 'block', ... },
	{ id: 'level', ... },
];
```

The grid will automatically adjust!

---

## Need Help?

- Check existing columns in `columns.js` for examples
- Look at `TableRow.js` to see how cells are rendered
- Review `settings-demo.scss` for styling patterns
- Test changes incrementally (one column at a time)
