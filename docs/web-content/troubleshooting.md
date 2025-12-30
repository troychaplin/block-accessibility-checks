# Troubleshooting

## Validation Not Running

**Problem:** Your validation doesn't execute when editing blocks.

**Solutions:**
- Verify your script is enqueued with `block-accessibility-script` dependency
- Check that the Block Accessibility Checks plugin is active
- Ensure hook names and filter names are correct (check for typos)
- Check browser console for JavaScript errors
- Verify the block type name matches exactly (case-sensitive)

## Settings Not Appearing

**Problem:** Your checks don't appear in the Settings panel.

**Solutions:**
- Confirm you're using `type => 'settings'` in your check configuration
- Verify the plugin is active and the check is registered
- Check for PHP errors that might prevent registration
- Clear WordPress transients/cache
- Check that the hook is firing (`ba11yc_ready` or `ba11yc_editor_checks_ready`)

## Messages Not Displaying

**Problem:** Validation runs but messages don't appear.

**Solutions:**
- Ensure `error_msg` and `warning_msg` are defined in PHP registration
- Check that validation is returning `false` when it should fail
- Verify your JavaScript filter is using the correct hook name
- Check that the check name matches between PHP and JavaScript
- Verify the block type name is correct

## Validation Runs on Wrong Blocks

**Problem:** Validation runs for blocks it shouldn't.

**Solutions:**
- Check the block type filter at the start of your validation
- Verify block type names are exact matches (case-sensitive)
- Use early returns to skip blocks that don't apply
- Check for namespace issues (e.g., `'my-plugin/block'` vs `'block'`)

## Performance Issues

**Problem:** Editor feels slow or unresponsive.

**Solutions:**
- Simplify validation logic
- Use early returns to skip unnecessary work
- Cache complex calculations outside the filter
- Avoid DOM queries or API calls in validation
- Profile your code to find bottlenecks

## Next Steps

Now that you understand best practices, dive into implementation:

- **[Block Attributes Validation](block-attributes.md)** - Validate block attribute values
- **[Post Meta Validation](post-meta.md)** - Validate custom post meta fields
- **[General Editor Validation](general-editor.md)** - Validate overall editor state
- **[Core Concepts](core-concepts.md)** - Review fundamental concepts
