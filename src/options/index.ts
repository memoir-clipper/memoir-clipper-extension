import { logger } from '@/utils/helpers/logger';
import '@/styles/tailwind.css';

/**
 * Initializes the options page UI when the DOM is fully loaded.
 */
function initializeOptionsPage(): void {
    logger.info('Options page loaded');
}

document.addEventListener('DOMContentLoaded', initializeOptionsPage);
