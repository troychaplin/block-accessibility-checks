/**
 * Table Header Component
 *
 * Renders the table header with column titles.
 * Supports sorting indicators (future feature).
 */

export default function TableHeader({ columns }) {
	return (
		<thead className="ba11y-dataview-thead">
			<tr className="ba11y-dataview-row ba11y-dataview-row-header">
				{columns.map(column => (
					<th
						key={column.id}
						className={`ba11y-dataview-th ba11y-dataview-th-${column.id}`}
					>
						<span className="ba11y-dataview-th-content">{column.header}</span>
					</th>
				))}
			</tr>
		</thead>
	);
}
