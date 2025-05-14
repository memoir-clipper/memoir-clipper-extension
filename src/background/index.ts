import { logger } from '@/utils/logger';

// Background script runs when the extension is loaded or the browser starts
logger.info('Background script loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        logger.info('Extension installed');
    } else if (details.reason === 'update') {
        logger.info('Extension updated');
    }
});
