/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useValidationIssues } from '../utils/use-validation-issues';
import {
	hasErrors as issueHasErrors,
	hasWarnings as issueHasWarnings,
} from '../utils/issue-helpers';
import { getEditorContext } from '../utils/get-validation-config';

const LOCK_NAME = 'block-accessibility-checks';

/**
 * Side-effect hook that reads aggregate validation state from the store and
 * orchestrates editor-wide consequences (save locking, body classes).
 *
 * Only active in post editor contexts (default and template views).
 */
export function useValidationLifecycle() {
	const editorContext = getEditorContext();
	const isValidContext =
		editorContext === 'post-editor' || editorContext === 'post-editor-template';

	const {
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
	} = useDispatch('core/editor');

	const { invalidBlocks, invalidMeta, invalidEditorChecks } = useValidationIssues();

	useEffect(() => {
		if (!isValidContext) {
			return;
		}
		if (!lockPostSaving || !unlockPostSaving) {
			return;
		}

		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasEditorErrors = issueHasErrors(invalidEditorChecks);

		if (hasBlockErrors || hasMetaErrors || hasEditorErrors) {
			lockPostSaving(LOCK_NAME);
			if (lockPostAutosaving) {
				lockPostAutosaving(LOCK_NAME);
			}
			if (disablePublishSidebar) {
				disablePublishSidebar();
			}
		} else {
			unlockPostSaving(LOCK_NAME);
			if (unlockPostAutosaving) {
				unlockPostAutosaving(LOCK_NAME);
			}
			if (enablePublishSidebar) {
				enablePublishSidebar();
			}
		}
	}, [
		invalidBlocks,
		invalidMeta,
		invalidEditorChecks,
		lockPostSaving,
		unlockPostSaving,
		lockPostAutosaving,
		unlockPostAutosaving,
		disablePublishSidebar,
		enablePublishSidebar,
		isValidContext,
	]);

	useEffect(() => {
		if (!isValidContext) {
			return;
		}
		if (!document.body) {
			return;
		}

		const hasBlockErrors = invalidBlocks.some(block => block.mode === 'error');
		const hasBlockWarnings = invalidBlocks.some(block => block.mode === 'warning');
		const hasMetaErrors = invalidMeta.some(meta => meta.hasErrors);
		const hasMetaWarnings = invalidMeta.some(meta => meta.hasWarnings && !meta.hasErrors);
		const hasEditorErrors = issueHasErrors(invalidEditorChecks);
		const hasEditorWarnings = issueHasWarnings(invalidEditorChecks);

		const hasAnyErrors = hasBlockErrors || hasMetaErrors || hasEditorErrors;
		const hasAnyWarnings =
			!hasAnyErrors && (hasBlockWarnings || hasMetaWarnings || hasEditorWarnings);

		if (hasAnyErrors) {
			document.body.classList.add('has-validation-errors');
			document.body.classList.remove('has-validation-warnings');
		} else if (hasAnyWarnings) {
			document.body.classList.add('has-validation-warnings');
			document.body.classList.remove('has-validation-errors');
		} else {
			document.body.classList.remove('has-validation-errors', 'has-validation-warnings');
		}

		return () => {
			if (document.body) {
				document.body.classList.remove('has-validation-errors', 'has-validation-warnings');
			}
		};
	}, [invalidBlocks, invalidMeta, invalidEditorChecks, isValidContext]);
}
