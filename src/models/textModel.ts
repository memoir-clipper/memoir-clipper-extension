import { ContentType } from '@/utils/enums';
import { BaseModel } from './baseModel';

/**
 * Represents text selected from a web page.
 * Extends the BaseModel class with additional properties specific to captured text.
 */
export class TextModel extends BaseModel {
    /** The selected plain text content */
    text: string;

    /** The selected text with its semantic HTML structure */
    html: string;

    /** The URL of the page where the text was captured */
    pageUrl: string | undefined;

    /** The URL of the favicon of the page */
    faviconUrl: string | undefined;

    /** The title of the page */
    title: string | undefined;

    /**
     * Creates a new instance of the text model.
     * @param text - The selected plain text
     * @param html - The selected HTML with semantic structure
     * @param tab - The tab where the selection occurred
     */
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
     * Extracts clean text from the HTML with options for formatting control
     * @param options - Configuration options for text extraction
     * @returns Extracted text according to specified options
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
            const links = doc.querySelectorAll('a[href]');
            links.forEach(link => {
                const url = link.getAttribute('data-absolute-url') || link.getAttribute('href');
                if (url) {
                    link.textContent = `${link.textContent} [${url}]`;
                }
            });
        }

        if (preserveStructure) {
            // Replace block elements with line breaks
            const blockElements = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, br');
            blockElements.forEach(el => {
                el.after(document.createTextNode('\n'));
            });

            // Double line break after certain elements
            const majorBlockElements = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, table');
            majorBlockElements.forEach(el => {
                el.after(document.createTextNode('\n'));
            });
        }

        let extractedText = doc.body.textContent || '';
        extractedText = extractedText
            .replace(/\n{3,}/g, '\n\n') // Replace 3+ line breaks with 2
            .trim();

        return extractedText;
    }
}
