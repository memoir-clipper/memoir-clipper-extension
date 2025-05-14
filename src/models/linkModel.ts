import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';
import { logger } from '@/utils/logger';

/**
 * Represents a link captured from a web page.
 * Extends the BaseModel class with additional properties specific to captured links.
 */
export class LinkModel extends BaseModel {
    /** The URL of the link */
    href: string | undefined;

    /** The URL of the page where the link was captured */
    pageUrl: string | undefined;

    /** The URL of the favicon of the page */
    faviconUrl: string | undefined;

    /** The title of the page */
    title: string | undefined;

    /**
     * Creates a new instance of the link model.
     * @param info - The context menu click data containing information about the clicked element.
     * @param tab - The tab where the click occurred. May be undefined if not available.
     */
    constructor(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        super();
        this.type = ContentType.LINK;
        this.create(info, tab);
    }

    /**
     * Converts the link model instance to a JSON object.
     * @returns A JSON representation of the link model instance.
     */
    private create(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        this.href = info.linkUrl;
        this.pageUrl = tab?.url;
        if (this.isSameDomainAsPage()) this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }

    /**
     * Checks if the link's domain is the same as the page's domain.
     * @returns True if the domains are the same, false otherwise.
     */
    private isSameDomainAsPage(): boolean {
        if (!this.pageUrl || !this.href) {
            return false;
        }
        try {
            const pageUrlDomain = new URL(this.pageUrl).hostname;
            const hrefDomain = new URL(this.href).hostname;
            return pageUrlDomain === hrefDomain;
        } catch (e) {
            logger.error('Error comparing href and pageUrl domains:', e);
            return false;
        }
    }
}
