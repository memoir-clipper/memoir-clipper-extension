import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';

/**
 * Represents an image captured from a web page.
 * Extends the BaseModel class with additional properties specific to captured images.
 */
export class ImageModel extends BaseModel {
    /** The source URL of the image */
    srcUrl: string | undefined;

    /** The URL of the page where the image was captured */
    pageUrl: string | undefined;

    /** The URL of the favicon of the page */
    faviconUrl: string | undefined;

    /** The title of the page */
    title: string | undefined;

    /**
     * Creates a new instance of the image model.
     * @param info - The context menu click data containing information about the clicked element.
     * @param tab - The tab where the click occurred. May be undefined if not available.
     */
    constructor(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        super();
        this.type = ContentType.IMAGE;
        this.create(info, tab);
    }

    /**
     * Converts the image model instance to a JSON object.
     * @returns A JSON representation of the image model instance.
     */
    private create(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        this.srcUrl = info.srcUrl;
        this.pageUrl = tab?.url;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }
}
