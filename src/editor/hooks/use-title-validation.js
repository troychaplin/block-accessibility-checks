/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useValidationIssues } from '../utils/use-validation-issues';

const TITLE_CHECK_NAME = 'post_title_required';
const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 15000;

/**
 * Finds the `<html>` element of whichever document currently contains the
 * post title, or null if the title isn't there (yet).
 *
 * Deliberately keyed off the title element itself rather than any iframe
 * readiness signal: this plugin previously tried gating on Gutenberg's
 * internal `__internalIsInitialized` flag, but private/underscored APIs like
 * that aren't guaranteed to exist across WordPress versions. Checking for
 * `.editor-post-title__input` directly works the same way regardless of
 * whether the canvas is iframed, and regardless of Gutenberg version.
 *
 * @return {Element|null} The owning document's root element, or null.
 */
function findTitleDocumentRoot() {
	const iframe = document.querySelector('iframe[name="editor-canvas"]');
	const canvasDocument = iframe?.contentDocument || document;
	return canvasDocument.querySelector('.editor-post-title__input')
		? canvasDocument.documentElement
		: null;
}

/**
 * Side-effect hook that mirrors the `post_title_required` editor check onto
 * the title area, reusing the same red/yellow outline treatment applied to
 * invalid blocks (see `.editor-post-title__input` rules in inline-indicators.scss).
 *
 * The marker class is set on the canvas `<html>` element rather than on the
 * title element itself: the title `<h1>` (and the iframe's `<body>`) are
 * rendered by Gutenberg's own React tree with a `className` computed from
 * state such as focus, so classes added to them directly get wiped the next
 * time Gutenberg re-renders. `<html>` is only ever a React *portal target*,
 * never a rendered element, so it's safe for us to mutate imperatively —
 * Gutenberg does the same thing itself (`block-editor-iframe__html`).
 *
 * The title (and its containing iframe) may not exist in the DOM yet on the
 * first render, so this polls briefly until it appears rather than relying
 * on a one-time lookup — otherwise, a title that's already invalid on mount
 * would never get marked, since `severity` wouldn't change again to trigger
 * a retry.
 */
export function useTitleValidation() {
	const { invalidEditorChecks } = useValidationIssues();

	const titleIssue = invalidEditorChecks.find(issue => issue.checkName === TITLE_CHECK_NAME);
	const severity = titleIssue?.type || null;

	useEffect(() => {
		let cancelled = false;
		let appliedRoot = null;

		function apply(root) {
			appliedRoot = root;
			root.classList.remove('ba11yc-title-error', 'ba11yc-title-warning');

			if (severity === 'error') {
				root.classList.add('ba11yc-title-error');
			} else if (severity === 'warning') {
				root.classList.add('ba11yc-title-warning');
			}
		}

		function tick() {
			if (cancelled) {
				return;
			}

			const root = findTitleDocumentRoot();
			if (root) {
				apply(root);
				clearInterval(intervalId);
			}
		}

		tick();
		const intervalId = setInterval(tick, POLL_INTERVAL_MS);
		const timeoutId = setTimeout(() => clearInterval(intervalId), POLL_TIMEOUT_MS);

		return () => {
			cancelled = true;
			clearInterval(intervalId);
			clearTimeout(timeoutId);
			appliedRoot?.classList.remove('ba11yc-title-error', 'ba11yc-title-warning');
		};
	}, [severity]);
}
