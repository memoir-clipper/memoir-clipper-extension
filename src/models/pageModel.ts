import { ContentType } from '@/utils/values/enums';
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
        this.type = ContentType.PAGE;
        this.pageUrl = info.pageUrl;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }
}
