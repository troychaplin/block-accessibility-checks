/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';
import { useInvalidBlocks } from '../utils/use-invalid-blocks';
import { useInvalidMeta } from '../utils/use-invalid-meta';
import { useInvalidEditorChecks } from '../utils/use-invalid-editor-checks';

/**
 * Computes validation state across blocks, meta, and editor checks and syncs
 * the results into the data store.
 *
 * Call this hook once from a top-level component that lives as long as the
 * editor is mounted (see register-sidebar.js).
 */
export function useValidationSync() {
	const invalidBlocks = useInvalidBlocks();
	const invalidMeta = useInvalidMeta();
	const invalidEditorChecks = useInvalidEditorChecks();

	const { setInvalidBlocks, setInvalidMeta, setInvalidEditorChecks } = useDispatch(STORE_NAME);

	useEffect(() => {
		setInvalidBlocks(invalidBlocks);
	}, [invalidBlocks, setInvalidBlocks]);

	useEffect(() => {
		setInvalidMeta(invalidMeta);
	}, [invalidMeta, setInvalidMeta]);

	useEffect(() => {
		setInvalidEditorChecks(invalidEditorChecks);
	}, [invalidEditorChecks, setInvalidEditorChecks]);
}
