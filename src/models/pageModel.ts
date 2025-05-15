import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';

/**
 * Represents a page captured from a web browser.
 * Extends the BaseModel class with additional properties specific to captured pages.
 */
export class PageModel extends BaseModel {
    /** The URL of the page */
    pageUrl: string | undefined;

    /** The URL of the favicon of the page */
    faviconUrl: string | undefined;

    /** The title of the page */
    title: string | undefined;

    /**
     * Creates a new instance of the page model.
     * @param info - The context menu click data containing information about the clicked element.
     * @param tab - The tab where the click occurred. May be undefined if not available.
     */
    constructor(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        super();
        this.create(info, tab);
        this.type = ContentType.PAGE;
    }

    /**
     * Converts the page model instance to a JSON object.
     * @returns A JSON representation of the page model instance.
     */
    private create(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        this.pageUrl = info.pageUrl;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }
}
