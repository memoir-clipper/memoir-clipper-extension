import { ID_IMAGE_CONTEXT_MENU, ID_LINK_CONTEXT_MENU, ID_PAGE_CONTEXT_MENU, ID_TEXT_CONTEXT_MENU } from '@/utils/ids';
import { logger } from '@/utils/logger';
import { ImageModel } from '@/models/imageModel';
import { LinkModel } from '@/models/linkModel';
import { PageModel } from '@/models/pageModel';
import { ACTION_GET_SELECTED_TEXT } from '@/utils/actions';
import { ExtensionMessage } from '@/models/extensionMessage';
import { ExtensionResponse } from '@/models/extensionReponse';

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
                const message = ExtensionMessage.create(ACTION_GET_SELECTED_TEXT);

                chrome.tabs.sendMessage(tab.id, message.toJSON(), rawResponse => {
                    if (chrome.runtime.lastError) {
                        logger.error('Error getting selected text:', chrome.runtime.lastError);
                        return;
                    }

                    const response = new ExtensionResponse(
                        rawResponse?.success ?? false,
                        rawResponse?.data,
                        rawResponse?.error,
                        rawResponse?.requestId ?? message.requestId,
                    );

                    if (response.isSuccess()) {
                        logger.debug('Text context menu clicked:', response.data);
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
