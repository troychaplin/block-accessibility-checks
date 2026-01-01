/**
 * Settings Header Component
 *
 * Displays the page header with title and description.
 */

export default function SettingsHeader({ title, description }) {
	return (
		<header className="ba11y-settings-header">
			<h1>{title}</h1>
			{description && <p>{description}</p>}
		</header>
	);
}
