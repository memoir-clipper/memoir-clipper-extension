import { logger } from '@/utils/helpers/logger';
import { TextSelectionOrchestrator } from './managers/textSelectionOrchestrator';
import { injectTailwind } from '@/styles/tailwindInjector';

/**
 * Initializes the content script by injecting styles and starting the orchestrator.
 */
function initializeContentScript(): void {
    logger.info('Content script initialization started');

    try {
        injectTailwind();
        TextSelectionOrchestrator.init();
        logger.info('Content script initialized successfully');
    } catch (error) {
        logger.error('Error during content script initialization:', error);
    }
}

// Execute initialization when the script is loaded.
initializeContentScript();
