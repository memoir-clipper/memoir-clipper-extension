import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';

/**
 * Represents text selected from a web page with plain text and semantic HTML.
 */
export class TextModel extends BaseModel {
    text: string;
    html: string;
    pageUrl: string | undefined;
    faviconUrl: string | undefined;
    title: string | undefined;

    constructor(text: string, html: string, tab?: chrome.tabs.Tab) {
        super();
        this.type = ContentType.TEXT;
        this.text = text;
        this.html = html;
        this.pageUrl = tab?.url;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }

    /** Extracts clean text from HTML with optional link URLs and structure preservation. */
    extractTextFromHTML(
        options: {
            includeLinks?: boolean;
            preserveStructure?: boolean;
        } = {},
    ): string {
        const { includeLinks = false, preserveStructure = true } = options;

        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${this.html}</div>`, 'text/html');

        if (includeLinks) {
            const links = doc.querySelectorAll('a[href]');
            links.forEach(link => {
                const url = link.getAttribute('data-absolute-url') ?? link.getAttribute('href');
                if (url) {
                    link.textContent = `${link.textContent} [${url}]`;
                }
            });
        }

        if (preserveStructure) {
            const blockElements = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, br');
            blockElements.forEach(el => {
                el.after(document.createTextNode('\n'));
            });

            const majorBlockElements = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, table');
            majorBlockElements.forEach(el => {
                el.after(document.createTextNode('\n'));
            });
        }

        let extractedText = doc.body.textContent ?? '';
        extractedText = extractedText.replace(/\n{3,}/g, '\n\n').trim();

        return extractedText;
    }
}
