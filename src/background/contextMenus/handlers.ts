import { ID_IMAGE_CONTEXT_MENU } from '@/utils/ids';
import { logger } from '@/utils/logger';
import { ImageModel } from '@/models/imageModel';

export function handleContextMenuActions(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
    if (info.menuItemId === ID_IMAGE_CONTEXT_MENU) {
        const imageCaptured = new ImageModel(info, tab);
        logger.debug('Image context menu clicked:', imageCaptured.toJSON());
    }
}
