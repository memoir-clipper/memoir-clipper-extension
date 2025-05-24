import { ID_IMAGE_CONTEXT_MENU, ID_LINK_CONTEXT_MENU, ID_PAGE_CONTEXT_MENU, ID_TEXT_CONTEXT_MENU } from '@/utils/ids';
import { logger } from '@/utils/logger';
import { ImageModel } from '@/models/imageModel';
import { LinkModel } from '@/models/linkModel';
import { PageModel } from '@/models/pageModel';
import { TEXT_SELECTED_ACTION } from '@/utils/actions';

/**
 * Handles various context menu click actions based on the menu item ID.
 *
 * This function processes clicks on different context menu items, creating appropriate
 * data models or sending messages to tabs depending on the type of selection:
 * - For images: Creates an ImageModel
 * - For links: Creates a LinkModel
 * - For pages: Creates a PageModel
 * - For text selections: Requests selected text via messaging
 *
 * @param info - Information about the clicked context menu item
 * @param tab - The tab where the context menu was clicked (if available)
 */
export function handleContextMenuActions(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
    switch (info.menuItemId) {
        case ID_IMAGE_CONTEXT_MENU:
            const imageCaptured = new ImageModel(info, tab);
            logger.debug('Image context menu clicked:', imageCaptured.toJSON());
            break;

        case ID_LINK_CONTEXT_MENU:
            const linkCaptured = new LinkModel(info, tab);
            logger.debug('Link context menu clicked:', linkCaptured.toJSON());
            break;

        case ID_PAGE_CONTEXT_MENU:
            const pageCaptured = new PageModel(info, tab);
            logger.debug('Page context menu clicked:', pageCaptured.toJSON());
            break;

        case ID_TEXT_CONTEXT_MENU:
            if (tab?.id) {
                chrome.tabs.sendMessage(tab.id, { action: TEXT_SELECTED_ACTION }, response => {
                    if (chrome.runtime.lastError) {
                        logger.error('Error getting selected text:', chrome.runtime.lastError);
                        return;
                    }

                    if (response?.success && response?.model) {
                        logger.debug('Text context menu clicked:', response.model);
                    } else {
                        logger.warn('No valid text selection was found');
                    }
                });
            }
            break;

        default:
            logger.debug('Unknown context menu item clicked:', info.menuItemId);
            break;
    }
}
