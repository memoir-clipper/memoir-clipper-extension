import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';

/**
 * Represents a page captured from a web browser with URL and metadata.
 */
export class PageModel extends BaseModel {
    pageUrl: string | undefined;
    faviconUrl: string | undefined;
    title: string | undefined;

    constructor(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        super();
        this.create(info, tab);
        this.type = ContentType.PAGE;
    }

    /** Populates page data from context menu info and tab. */
    private create(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        this.pageUrl = info.pageUrl;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }
}
