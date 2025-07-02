import { logger } from '@/utils/helpers/logger';
import '@/styles/tailwind.css';

/**
 * Initializes the popup UI when the DOM is fully loaded.
 */
function initializePopup(): void {
    logger.info('Popup loaded');
}

document.addEventListener('DOMContentLoaded', initializePopup);
