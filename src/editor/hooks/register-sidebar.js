/**
 * Side-effect module. Registers the validation plugin with the block editor.
 *
 * The registered plugin mounts four siblings:
 *   - <ValidationSync />      : invokes useValidationSync, returns null
 *   - <ValidationLifecycle /> : invokes useValidationLifecycle, returns null
 *   - <TitleValidation />     : invokes useTitleValidation, returns null
 *   - <ValidationSidebar />   : renders the sidebar (null when no issues)
 *
 * Siblings (rather than two hooks in one component) avoid an infinite-render
 * loop: useValidationSync dispatches to the store; useValidationLifecycle
 * subscribes to it.
 */

/**
 * WordPress dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { useValidationSync } from './use-validation-sync';
import { useValidationLifecycle } from './use-validation-lifecycle';
import { useTitleValidation } from './use-title-validation';
import { ValidationSidebar } from '../components/validation-sidebar';

function ValidationSync() {
	useValidationSync();
	return null;
}

function ValidationLifecycle() {
	useValidationLifecycle();
	return null;
}

function TitleValidation() {
	useTitleValidation();
	return null;
}

function ValidationPlugin() {
	return (
		<>
			<ValidationSync />
			<ValidationLifecycle />
			<TitleValidation />
			<ValidationSidebar />
		</>
	);
}

registerPlugin('block-a11y-checks', {
	render: ValidationPlugin,
});
