import { createRoot } from '@wordpress/element';
import { App } from './App';

import './styles.scss';

const root = document.getElementById('ba11yc-settings-root');

if (root) {
	createRoot(root).render(<App />);
}
