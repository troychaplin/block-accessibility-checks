<?php
/**
 * Namespace declaration for the BlockAccessibility plugin.
 *
 * This namespace is used to encapsulate all the classes and functions
 * related to the Block Accessibility Checks plugin, ensuring that there
 * are no naming conflicts with other plugins or core WordPress functionality.
 *
 * @package BlockAccessibilityChecks
 */

namespace BlockAccessibility;

/**
 * Class SettingsHardcoded
 *
 * This class provides a simple HTML design preview for the settings interface.
 * It outputs pure HTML without complex logic for easy design manipulation.
 *
 * @package BlockAccessibilityChecks\Functions
 */
class SettingsHardcoded {

	/**
	 * Render a simple HTML design preview page.
	 *
	 * This method outputs pure HTML for design work without complex logic.
	 *
	 * @return void
	 */
	public function design_preview_page(): void {
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( \esc_html__( 'You do not have sufficient permissions to access this page.', 'block-accessibility-checks' ) );
		}

		?>
		<div class="ba11y-settings">
			<div class="ba11y-settings-container">
				
				<header class="ba11y-settings-header">
					<h1>Block Accessibility & Validation Checks</h1>
					<p>Configure accessibility checks and validations for block attributes and meta fields</p>
				</header>

				<section class="ba11y-settings-section">
					<div class="ba11y-settings-plugin-header">
						<h2>Core Block Checks</h2>
					</div>
					
					<form class="ba11y-settings-form" action="options.php" method="post">

							<!-- Button Block -->
							<article class="ba11y-block-options ba11y-block-options-core-button">
								<h2>Button Block</h2>

								<div class="ba11y-block-single-option" role="group" aria-labelledby="button-text-label">
									<div class="ba11y-field-group">
										<div class="ba11y-field-label">
											<p id="button-text-label">Button Text Check (Accessibility check)</p>
										</div>
										<div class="ba11y-field-controls">
											<input type="radio" id="button_text_error" name="button_text_check" value="error" checked>
											<label for="button_text_error" class="ba11y-button">Error</label>
											
											<input type="radio" id="button_text_warning" name="button_text_check" value="warning">
											<label for="button_text_warning" class="ba11y-button">Warning</label>
											
											<input type="radio" id="button_text_none" name="button_text_check" value="none">
											<label for="button_text_none" class="ba11y-button">None</label>
										</div>
									</div>
								</div>

								<div class="ba11y-block-single-option" role="group" aria-labelledby="button-link-label">
									<div class="ba11y-field-group">
										<div class="ba11y-field-label">
											<p id="button-link-label">Button Link Validation (Validation check)</p>
										</div>
										<div class="ba11y-field-controls">
											<input type="radio" id="button_link_error" name="button_link_check" value="error">
											<label for="button_link_error" class="ba11y-button">Error</label>
											
											<input type="radio" id="button_link_warning" name="button_link_check" value="warning" checked>
											<label for="button_link_warning" class="ba11y-button">Warning</label>
											
											<input type="radio" id="button_link_none" name="button_link_check" value="none">
											<label for="button_link_none" class="ba11y-button">None</label>
										</div>
									</div>
								</div>
							</article>

							<!-- Image Block -->
							<article class="ba11y-block-options ba11y-block-options-core-image">
								<h2>Image Block</h2>

								<div class="ba11y-block-single-option" role="group" aria-labelledby="alt-text-label">
									<div class="ba11y-field-group">
										<div class="ba11y-field-label">
											<p id="alt-text-label">Alt Text Check (Accessibility check)</p>
										</div>
										<div class="ba11y-field-controls">
											<input type="radio" id="alt_text_error" name="alt_text_check" value="error" checked>
											<label for="alt_text_error" class="ba11y-button">Error</label>
											
											<input type="radio" id="alt_text_warning" name="alt_text_check" value="warning">
											<label for="alt_text_warning" class="ba11y-button">Warning</label>
											
											<input type="radio" id="alt_text_none" name="alt_text_check" value="none">
											<label for="alt_text_none" class="ba11y-button">None</label>
										</div>
									</div>
								</div>
								
								<div class="ba11y-block-single-option" role="group" aria-labelledby="image-size-label">
									<div class="ba11y-field-group">
										<div class="ba11y-field-label">
											<p id="image-size-label">Image Size Validation (Validation check)</p>
										</div>
										<div class="ba11y-field-controls">
											<input type="radio" id="image_size_error" name="image_size_check" value="error">
											<label for="image_size_error" class="ba11y-button">Error</label>
											
											<input type="radio" id="image_size_warning" name="image_size_check" value="warning">
											<label for="image_size_warning" class="ba11y-button">Warning</label>
											
											<input type="radio" id="image_size_none" name="image_size_check" value="none" checked>
											<label for="image_size_none" class="ba11y-button">None</label>
										</div>
									</div>
								</div>
							</article>

							<!-- Heading Block -->
							<!-- <article class="ba11y-block-options ba11y-block-options-core-heading">
								<h2>Heading Block</h2>
								<p>Select which heading levels you want to remove from the editor. Checked levels will not be available.</p>

								<ul class="block-check-checkbox-options">
									<li>
										<input type="checkbox" id="heading-level-1" name="heading_levels[]" value="h1" checked>
										<label for="heading-level-1">H1</label>
									</li>
									<li>
										<input type="checkbox" id="heading-level-2" name="heading_levels[]" value="h2" checked>
										<label for="heading-level-2">H2</label>
									</li>
									<li>
										<input type="checkbox" id="heading-level-3" name="heading_levels[]" value="h3" checked>
										<label for="heading-level-3">H3</label>
									</li>
									<li>
										<input type="checkbox" id="heading-level-4" name="heading_levels[]" value="h4">
										<label for="heading-level-4">H4</label>
									</li>
									<li>
										<input type="checkbox" id="heading-level-5" name="heading_levels[]" value="h5">
										<label for="heading-level-5">H5</label>
									</li>
									<li>
										<input type="checkbox" id="heading-level-6" name="heading_levels[]" value="h6">
										<label for="heading-level-6">H6</label>
									</li>
								</ul>
							</article> -->

						<button type="submit" class="button button-primary">Save Changes</button>
					</form>
				</section>
			</div>
		</div>
		<?php
	}
}
