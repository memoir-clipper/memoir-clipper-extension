import { ContentType } from '@/utils/values/enums';
import { BaseModel } from './baseModel';
import { logger } from '@/utils/helpers/logger';

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
        this.populateFromContextMenu(info, tab);
    }

    private populateFromContextMenu(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined): void {
        this.href = info.linkUrl;
        this.pageUrl = tab?.url;
        this.title = tab?.title;

        if (this.isSameDomainAsPage()) {
            this.faviconUrl = tab?.favIconUrl;
        }
    }

    private isSameDomainAsPage(): boolean {
        if (!this.pageUrl || !this.href) {
            return false;
        }

        try {
            const pageUrlDomain = new URL(this.pageUrl).hostname;
            const hrefDomain = new URL(this.href).hostname;
            return pageUrlDomain === hrefDomain;
        } catch (error) {
            logger.error('LinkModel: Error comparing domains', {
                pageUrl: this.pageUrl,
                href: this.href,
                error,
            });
            return false;
        }
    }
}
