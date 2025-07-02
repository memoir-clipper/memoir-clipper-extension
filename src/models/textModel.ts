import { ContentType } from '@/utils/values/enums';
import { BaseModel } from './baseModel';

/**
 * Represents text selected from a web page with plain text and semantic HTML.
 */
export class TextModel extends BaseModel {
    text: string;
    html: string;
    pageUrl?: string;
    faviconUrl?: string;
    title?: string;

    constructor(text: string, html: string, tab?: chrome.tabs.Tab) {
        super();
        this.type = ContentType.TEXT;
        this.text = text;
        this.html = html;
        this.pageUrl = tab?.url;
        this.faviconUrl = tab?.favIconUrl;
        this.title = tab?.title;
    }

    /**
     * Extracts clean text from HTML with optional link URLs and structure preservation.
     * @param options.includeLinks - Whether to append URLs to link text.
     * @param options.preserveStructure - Whether to preserve block structure.
     * @returns Extracted plain text.
     */
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
            doc.querySelectorAll('a[href]').forEach(link => {
                const url = link.getAttribute('data-absolute-url') ?? link.getAttribute('href');
                if (url) {
                    link.textContent = `${link.textContent} [${url}]`;
                }
            });
        }

        if (preserveStructure) {
            // Add line breaks after block-level elements for readability
            const blockElements = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, br');
            blockElements.forEach(el => {
                el.after(document.createTextNode('\n'));
            });

            // Add extra line breaks after major block elements for paragraph separation
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
