import { logger } from '@/utils/logger';
import { contextMenusList } from './contextMenus';

/**
 * Creates Chrome context menu items for images.
 *
 * This function first removes all existing context menus and then
 * creates new context menu items based on the predefined contextMenusList.
 * Success or failure of each menu item creation is logged.
 *
 * @throws Will log errors if context menu creation fails or if an unexpected error occurs
 */
export function registerContextMenus() {
    try {
        chrome.contextMenus.removeAll(() => {
            for (const contextMenu of contextMenusList) {
                chrome.contextMenus.create(contextMenu, () => {
                    if (chrome.runtime.lastError) {
                        logger.error('Error creating context menu:', chrome.runtime.lastError);
                    } else {
                        logger.debug('Context menu created successfully for contexts:', contextMenu.contexts);
                    }
                });
            }
        });
    } catch (error) {
        logger.error('Unexpected error creating context menu:', error);
    }
}
