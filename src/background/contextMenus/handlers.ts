import {
    ID_IMAGE_CONTEXT_MENU,
    ID_LINK_CONTEXT_MENU,
    ID_PAGE_CONTEXT_MENU,
    ID_TEXT_CONTEXT_MENU,
} from '@/utils/values/ids';
import { logger } from '@/utils/helpers/logger';
import { ImageModel } from '@/models/imageModel';
import { LinkModel } from '@/models/linkModel';
import { PageModel } from '@/models/pageModel';
import { ACTION_GET_SELECTED_TEXT } from '@/utils/values/actions';
import { ExtensionMessage } from '@/models/extensionMessage';
import { ExtensionResponse } from '@/models/extensionResponse';

// --- Context Menu Handlers ---

function handleImageContextMenu(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined): void {
    const imageCaptured = new ImageModel(info, tab);
    logger.info('Image context menu processed:', imageCaptured.toJSON());
}

function handleLinkContextMenu(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined): void {
    const linkCaptured = new LinkModel(info, tab);
    logger.info('Link context menu processed:', linkCaptured.toJSON());
}

function handlePageContextMenu(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined): void {
    const pageCaptured = new PageModel(info, tab);
    logger.info('Page context menu processed:', pageCaptured.toJSON());
}

/**
 * Handles clicks on the text context menu.
 * Sends a message to the content script to retrieve the selected text.
 */
function handleTextContextMenu(tab: chrome.tabs.Tab | undefined): void {
    if (!tab?.id) {
        logger.warn('Text context menu clicked, but no valid tab ID found');
        return;
    }

    const message = ExtensionMessage.create(ACTION_GET_SELECTED_TEXT);

    chrome.tabs.sendMessage(tab.id, message.toJSON(), rawResponse => {
        if (chrome.runtime.lastError) {
            logger.error('Error retrieving selected text:', chrome.runtime.lastError);
            return;
        }

        const response = new ExtensionResponse(
            rawResponse?.success ?? false,
            rawResponse?.data,
            rawResponse?.error,
            rawResponse?.requestId ?? message.requestId,
        );

        if (response.isSuccess()) {
            logger.info('Text context menu processed:', response.data);
        } else {
            logger.warn('No valid text selection found');
        }
    });
}

// --- Main Dispatcher ---

/**
 * Dispatches context menu click actions based on the menu item ID.
 */
export function handleContextMenuActions(
    info: chrome.contextMenus.OnClickData,
    tab: chrome.tabs.Tab | undefined,
): void {
    switch (info.menuItemId) {
        case ID_IMAGE_CONTEXT_MENU:
            handleImageContextMenu(info, tab);
            break;
        case ID_LINK_CONTEXT_MENU:
            handleLinkContextMenu(info, tab);
            break;
        case ID_PAGE_CONTEXT_MENU:
            handlePageContextMenu(info, tab);
            break;
        case ID_TEXT_CONTEXT_MENU:
            handleTextContextMenu(tab);
            break;
        default:
            logger.warn('Unknown context menu item clicked:', info.menuItemId);
            break;
    }
}
