/**
 * Table Header Component
 *
 * Renders the table header with column titles.
 * Supports sorting indicators (future feature).
 */

export default function TableHeader({ columns }) {
	return (
		<div className="ba11y-dataview-thead" role="rowgroup">
			<div className="ba11y-dataview-row ba11y-dataview-row-header" role="row">
				{columns.map(column => (
					<div
						key={column.id}
						className={`ba11y-dataview-th ba11y-dataview-th-${column.id}`}
						role="columnheader"
						style={{
							textAlign: column.align || 'left',
						}}
					>
						<span className="ba11y-dataview-th-content">{column.header}</span>
					</div>
				))}
			</div>
		</div>
	);
}
