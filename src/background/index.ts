import { logger } from '@/utils/logger';
import { createImageContextMenu } from './contextMenus/createContextMenus';
import { handleContextMenuActions } from './contextMenus/handlers';

// Background script runs when the extension is loaded or the browser starts
logger.info('Background script loaded');

// Listen for installation and set up all context menu functionality
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        logger.info('Extension installed');
    } else if (details.reason === 'update') {
        logger.info('Extension updated');
    }

    createImageContextMenu();
    chrome.contextMenus.onClicked.addListener((info, tab) => handleContextMenuActions(info, tab));
});
