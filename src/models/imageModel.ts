import { ContentType } from '@/utils/values/enums';
import { BaseModel } from './baseModel';

/**
 * Represents an image captured from a web page with source URL and page context.
 */
export class ImageModel extends BaseModel {
    srcUrl: string | undefined;
    pageUrl: string | undefined;
    faviconUrl: string | undefined;
    title: string | undefined;

    constructor(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        super();
        this.type = ContentType.IMAGE;
        this.populateFromContextMenu(info, tab);
    }

    private populateFromContextMenu(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined): void {
        this.srcUrl = info.srcUrl;
        this.pageUrl = tab?.url;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }
}
