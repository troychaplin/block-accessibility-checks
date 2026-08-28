/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store/constants';
import { useInvalidBlocks } from '../utils/use-invalid-blocks';
import { useInvalidMeta } from '../utils/use-invalid-meta';
import { useInvalidEditorChecks } from '../utils/use-invalid-editor-checks';
import {
	computeHeadingOutline,
	headingOutlineSignature,
	isHeadingRankEnabled,
	setHeadingInvalidation,
} from '../utils/heading-outline';
import { getValidationRootScope } from '../utils/get-validation-root';

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

	const headingInvalidation = useSelect(
		select => select(STORE_NAME).getHeadingInvalidation(),
		[]
	);

	// Mirrored into module state so the heading check can honour it without
	// reading this store, which it must not do: it runs inside validateBlock,
	// and useSelect subscribes to every store its callback touches.
	setHeadingInvalidation(headingInvalidation);

	// Heading order is a document-wide rule, so blocks cannot judge themselves
	// in isolation: changing one heading can change the verdict on another.
	// This signature changes whenever the outline does, and per-block
	// validation depends on it to know when to run again.
	const scope = useSelect(select => getValidationRootScope(select), []);

	const headingSignature = useSelect(
		select => {
			if (!isHeadingRankEnabled()) {
				return '';
			}

			return headingOutlineSignature(
				computeHeadingOutline(select, headingInvalidation, scope)
			);
		},
		[headingInvalidation, scope]
	);

	const { setInvalidBlocks, setInvalidMeta, setInvalidEditorChecks, setHeadingSignature } =
		useDispatch(STORE_NAME);

	useEffect(() => {
		setInvalidBlocks(invalidBlocks);
	}, [invalidBlocks, setInvalidBlocks]);

	useEffect(() => {
		setInvalidMeta(invalidMeta);
	}, [invalidMeta, setInvalidMeta]);

	useEffect(() => {
		setInvalidEditorChecks(invalidEditorChecks);
	}, [invalidEditorChecks, setInvalidEditorChecks]);

	useEffect(() => {
		setHeadingSignature(headingSignature);
	}, [headingSignature, setHeadingSignature]);
}
