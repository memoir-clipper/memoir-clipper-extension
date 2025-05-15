import { ID_IMAGE_CONTEXT_MENU, ID_LINK_CONTEXT_MENU, ID_PAGE_CONTEXT_MENU } from '@/utils/ids';
import { logger } from '@/utils/logger';
import { ImageModel } from '@/models/imageModel';
import { LinkModel } from '@/models/linkModel';
import { PageModel } from '@/models/pageModel';

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

        default:
            logger.debug('Unknown context menu item clicked:', info.menuItemId);
            break;
    }
}
