import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { Button, Notice, Spinner, VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DataViews, DataForm, filterSortAndPaginate } from '@wordpress/dataviews';
import {
	transformChecksToRows,
	rowsToSettings,
	collectNonConfigurableSettings,
	reapplySettingsToRows,
} from './utils/transform';
import { SeveritySelect, LEVEL_OPTIONS } from './components/SeveritySelect';
import { SiteEditorToggle } from './components/SiteEditorToggle';
import { HEADING_LEVEL_FIELDS, HEADING_LEVEL_FORM } from './components/HeadingLevelsField';

const CHECKS_PATH = '/block-accessibility-checks/v1/checks';
const SETTINGS_PATH = '/block-accessibility-checks/v1/settings';

const DEFAULT_VIEW = {
	type: 'table',
	search: '',
	filters: [],
	page: 1,
	perPage: 25,
	sort: { field: 'title', direction: 'asc' },
	titleField: 'title',
	descriptionField: 'description',
	fields: ['target', 'check_type', 'category', 'plugin_name', 'level', 'site_editor'],
};

const DEFAULT_GENERAL = { headingLevels: [] };

export function App() {
	const [rows, setRows] = useState([]);
	const [general, setGeneral] = useState(DEFAULT_GENERAL);
	// Saved settings for checks the table never lists (`configurable: false`).
	// Carried through every save so the full-replace POST cannot drop them.
	const [preservedSettings, setPreservedSettings] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [notice, setNotice] = useState(null);
	const [view, setView] = useState(DEFAULT_VIEW);

	useEffect(() => {
		async function fetchData() {
			try {
				const [checks, settings] = await Promise.all([
					apiFetch({ path: CHECKS_PATH }),
					apiFetch({ path: SETTINGS_PATH }),
				]);
				setRows(transformChecksToRows(checks, settings));
				setPreservedSettings(collectNonConfigurableSettings(checks, settings));
				setGeneral({ ...DEFAULT_GENERAL, ...(settings?.general || {}) });
			} catch (error) {
				setNotice({
					status: 'error',
					message:
						error.message || __('Failed to load checks.', 'block-accessibility-checks'),
				});
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	useEffect(() => {
		const handler = e => {
			if (isDirty) {
				e.preventDefault();
			}
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [isDirty]);

	const handleLevelChange = useCallback((rowId, newLevel) => {
		setRows(prevRows =>
			prevRows.map(row => {
				if (row.id !== rowId) {
					return row;
				}
				return {
					...row,
					level: newLevel,
					has_override: newLevel !== row.default_level,
				};
			})
		);
		setIsDirty(true);
	}, []);

	const handleSiteEditorChange = useCallback((rowId, enabled) => {
		setRows(prevRows =>
			prevRows.map(row => (row.id === rowId ? { ...row, site_editor: enabled } : row))
		);
		setIsDirty(true);
	}, []);

	// DataForm hands back a partial patch of the form data, so merge rather than
	// replace — that also keeps any general setting this form does not cover.
	const handleGeneralChange = useCallback(patch => {
		setGeneral(prev => ({ ...prev, ...patch }));
		setIsDirty(true);
	}, []);

	const handleResetToDefault = useCallback(items => {
		const itemIds = new Set(items.map(i => i.id));
		setRows(prevRows =>
			prevRows.map(row =>
				itemIds.has(row.id)
					? { ...row, level: row.default_level, has_override: false, site_editor: false }
					: row
			)
		);
		setIsDirty(true);
	}, []);

	const handleSave = useCallback(async () => {
		setIsSaving(true);
		setNotice(null);
		try {
			const settings = rowsToSettings(rows, general, preservedSettings);
			const saved = await apiFetch({
				path: SETTINGS_PATH,
				method: 'POST',
				data: settings,
			});

			// Re-derive from the server's sanitized echo rather than trusting local
			// state, so anything PHP rejected shows up immediately instead of
			// silently diverging until the next reload.
			setRows(prevRows => reapplySettingsToRows(prevRows, saved));
			setGeneral({ ...DEFAULT_GENERAL, ...(saved?.general || {}) });
			setIsDirty(false);
			setNotice({
				status: 'success',
				message: __('Settings saved successfully.', 'block-accessibility-checks'),
			});
		} catch (error) {
			setNotice({
				status: 'error',
				message:
					error.message || __('Failed to save settings.', 'block-accessibility-checks'),
			});
		} finally {
			setIsSaving(false);
		}
	}, [rows, general, preservedSettings]);

	const pluginElements = useMemo(() => {
		const plugins = [...new Set(rows.map(r => r.plugin_name))].sort();
		return plugins.map(name => ({ value: name, label: name }));
	}, [rows]);

	const fields = useMemo(
		() => [
			{
				id: 'title',
				label: __('Check', 'block-accessibility-checks'),
				enableGlobalSearch: true,
				enableSorting: true,
				// The title column carries the row's identity; hiding it would
				// leave nothing to identify the check by.
				enableHiding: false,
				filterBy: false,
			},
			{
				// The check name slug is what a developer greps for, so keep it
				// searchable even though it never gets a column of its own.
				id: 'check_name',
				label: __('Check slug', 'block-accessibility-checks'),
				enableGlobalSearch: true,
				enableSorting: false,
				filterBy: false,
			},
			{
				id: 'description',
				label: __('Description', 'block-accessibility-checks'),
				enableGlobalSearch: true,
				enableSorting: false,
				enableHiding: false,
				render: ({ item }) => (
					<span className="ba11yc-description-cell">{item.description}</span>
				),
			},
			{
				id: 'target',
				label: __('Target', 'block-accessibility-checks'),
				enableGlobalSearch: true,
				enableSorting: true,
			},
			{
				id: 'check_type',
				label: __('Check Type', 'block-accessibility-checks'),
				enableSorting: true,
				elements: [
					{ value: 'Block', label: __('Block', 'block-accessibility-checks') },
					{ value: 'Meta', label: __('Meta', 'block-accessibility-checks') },
					{ value: 'Editor', label: __('Editor', 'block-accessibility-checks') },
				],
				filterBy: { isPrimary: true, operators: ['is'] },
			},
			{
				id: 'category',
				label: __('Category', 'block-accessibility-checks'),
				enableSorting: true,
				elements: [
					{
						value: 'Accessibility',
						label: __('Accessibility', 'block-accessibility-checks'),
					},
					{ value: 'Validation', label: __('Validation', 'block-accessibility-checks') },
				],
				filterBy: { operators: ['is'] },
			},
			{
				id: 'plugin_name',
				label: __('Plugin', 'block-accessibility-checks'),
				enableSorting: true,
				enableGlobalSearch: true,
				elements: pluginElements,
				filterBy: { operators: ['is'] },
			},
			{
				id: 'level',
				label: __('Level', 'block-accessibility-checks'),
				elements: LEVEL_OPTIONS,
				filterBy: { isPrimary: true, operators: ['is'] },
				render: ({ item }) => (
					<div className="ba11yc-level-cell">
						<SeveritySelect
							value={item.level}
							onChange={value => handleLevelChange(item.id, value)}
						/>
					</div>
				),
			},
			{
				id: 'site_editor',
				label: __('Site Editor', 'block-accessibility-checks'),
				enableSorting: false,
				render: ({ item }) => (
					<SiteEditorToggle
						value={item.site_editor}
						onChange={value => handleSiteEditorChange(item.id, value)}
					/>
				),
			},
		],
		[pluginElements, handleLevelChange, handleSiteEditorChange]
	);

	const actions = useMemo(
		() => [
			{
				id: 'reset-to-default',
				label: __('Reset to default', 'block-accessibility-checks'),
				// `supportsBulk` is what renders the selection checkbox column and the
				// bulk toolbar; DataViews owns the selection state itself, so no
				// `selection`/`onChangeSelection` props are needed. Rows failing
				// `isEligible` get a disabled checkbox rather than none at all.
				supportsBulk: true,
				isEligible: item => item.has_override || item.site_editor === true,
				callback: items => handleResetToDefault(items),
			},
		],
		[handleResetToDefault]
	);

	const { data: paginatedRows, paginationInfo } = useMemo(
		() => filterSortAndPaginate(rows, view, fields),
		[rows, view, fields]
	);

	if (isLoading) {
		return (
			<div className="ba11yc-page">
				<Spinner />
				<VisuallyHidden>
					{__('Loading checks…', 'block-accessibility-checks')}
				</VisuallyHidden>
			</div>
		);
	}

	return (
		<div className="ba11yc-page">
			<div className="ba11yc-page__header">
				<h1>
					{__('Block Accessibility Checks & Validation', 'block-accessibility-checks')}
				</h1>
				<Button
					variant="primary"
					onClick={handleSave}
					isBusy={isSaving}
					disabled={!isDirty || isSaving}
				>
					{__('Save Changes', 'block-accessibility-checks')}
				</Button>
			</div>

			{notice && (
				<Notice status={notice.status} isDismissible onDismiss={() => setNotice(null)}>
					{notice.message}
				</Notice>
			)}

			{rows.length === 0 ? (
				<Notice status="warning" isDismissible={false}>
					{__(
						'No configurable validation checks are registered.',
						'block-accessibility-checks'
					)}
				</Notice>
			) : (
				<DataViews
					data={paginatedRows}
					fields={fields}
					view={view}
					onChangeView={setView}
					paginationInfo={paginationInfo}
					actions={actions}
					defaultLayouts={{ table: {} }}
				/>
			)}

			<div className="ba11yc-page__general">
				<DataForm
					data={general}
					fields={HEADING_LEVEL_FIELDS}
					form={HEADING_LEVEL_FORM}
					onChange={handleGeneralChange}
				/>
			</div>
		</div>
	);
}
