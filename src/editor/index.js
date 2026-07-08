/**
 * Block Accessibility Checks — editor runtime entry.
 *
 * Side-effect imports register the data store, the editor filters/sidebar
 * plugin, and the bundled core-block check logic on module load.
 */

import './store';
import './hooks';
import './checks';
import './styles.scss';
