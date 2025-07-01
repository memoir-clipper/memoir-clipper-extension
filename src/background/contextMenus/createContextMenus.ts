import { logger } from '@/utils/helpers/logger';
import { contextMenusList } from './contextMenus';

// --- Context Menu Helpers ---

function removeAllContextMenus(callback: () => void): void {
    chrome.contextMenus.removeAll(callback);
}

function createContextMenu(contextMenu: chrome.contextMenus.CreateProperties): void {
    chrome.contextMenus.create(contextMenu, () => {
        if (chrome.runtime.lastError) {
            logger.error('Error creating context menu:', chrome.runtime.lastError);
        } else {
            logger.debug('Context menu created successfully:', contextMenu.title);
        }
    });
}

// --- Context Menu Registration ---

/**
 * Registers all context menu items for the extension.
 */
export function registerContextMenus(): void {
    logger.info('Registering context menus');

    try {
        removeAllContextMenus(() => {
            contextMenusList.forEach(createContextMenu);
        });
    } catch (error) {
        logger.error('Unexpected error during context menu registration:', error);
    }
}
