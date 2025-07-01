import { logger } from '@/utils/helpers/logger';
import { registerContextMenus } from './contextMenus/createContextMenus';
import { handleContextMenuActions } from './contextMenus/handlers';

// --- Event Handlers ---

function handleInstallation(details: chrome.runtime.InstalledDetails): void {
    if (details.reason === 'install') {
        logger.info('Extension installed');
    } else if (details.reason === 'update') {
        logger.info('Extension updated');
    }
    registerContextMenus();
}

// --- Initialization ---

function initializeBackgroundScript(): void {
    logger.info('Background script initialization started');

    chrome.runtime.onInstalled.addListener(handleInstallation);
    chrome.contextMenus.onClicked.addListener(handleContextMenuActions);

    logger.info('Background script initialized successfully');
}

// --- Entry Point ---

initializeBackgroundScript();
