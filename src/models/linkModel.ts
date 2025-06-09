import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';
import { logger } from '@/utils/logger';

/**
 * Represents a link captured from a web page with target URL and page context.
 */
export class LinkModel extends BaseModel {
    href: string | undefined;
    pageUrl: string | undefined;
    faviconUrl: string | undefined;
    title: string | undefined;

    constructor(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        super();
        this.type = ContentType.LINK;
        this.create(info, tab);
    }

    /** Populates link data from context menu info and tab. */
    private create(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) {
        this.href = info.linkUrl;
        this.pageUrl = tab?.url;
        if (this.isSameDomainAsPage()) this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }

    /** Checks if link domain matches page domain for favicon usage. */
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
