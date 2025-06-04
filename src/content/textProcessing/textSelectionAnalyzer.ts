import type { TextContextData } from '@/models/textContextData';
import { TextContentType, ListType } from '@/utils/enums';
import { TextFormattingDetector } from '@/content/textProcessing/textFormattingDetector';
import { ContentTypeDetector } from '@/content/textProcessing/contentTypeDetector';
import { HtmlProcessor } from '@/content/textProcessing/htmlProcessor';
import { TAGS } from '@/utils/htmlTags';

/**
 * TextSelectionAnalyzer class provides methods to analyze and capture formatted text selections
 * from the DOM, including formatting, content type, and structural context.
 */
export class TextSelectionAnalyzer {
    private contextData: TextContextData;
    private readonly formattingDetector: TextFormattingDetector;
    private readonly contentTypeDetector: ContentTypeDetector;
    private readonly htmlProcessor: HtmlProcessor;

    constructor() {
        this.contextData = this.createEmptyContext();
        this.formattingDetector = new TextFormattingDetector();
        this.contentTypeDetector = new ContentTypeDetector();
        this.htmlProcessor = new HtmlProcessor();
    }

    /**
     * Captures the formatted selection from a given range and returns it as HTML
     * @param range - The Range object representing the selected text
     * @returns The formatted HTML string of the selection
     */
    public getFormattedSelection(range: Range): string {
        const container = document.createElement(TAGS.DIV);
        const contents = range.cloneContents();

        if (!contents) {
            return '';
        }

        container.appendChild(contents);

        this.reset();
        this.analyzeSelectionContext(range);
        this.htmlProcessor.cleanupHtml(container);
        this.addContextWrapper(container);

        return container.innerHTML;
    }

    /**
     * Analyzes the selection context of a given range and updates the context data
     * @param range - The Range object representing the selected text
     * @returns The updated TextContextData object
     */
    public analyzeSelectionContext(range: Range): TextContextData {
        this.reset();

        let node = range.commonAncestorContainer;
        if (!node) {
            return this.contextData;
        }

        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            node = node.parentElement;
        }

        const styleCache = new Map<Element, CSSStyleDeclaration>();

        while (node && node !== document.body && node instanceof Element) {
            if (node instanceof HTMLElement) {
                this.analyzeElementWithCache(node as HTMLElement, styleCache);
            }
            node = node.parentNode as HTMLElement;
        }

        return this.contextData;
    }

    /**
     * Analyzes a single HTML element using all detector classes with caching for styles
     * @param element - The HTML element to analyze
     * @param styleCache - A cache for computed styles to avoid redundant calculations
     */
    private analyzeElementWithCache(element: HTMLElement, styleCache: Map<Element, CSSStyleDeclaration>): void {
        const tagName = element.tagName.toLowerCase();

        let computedStyle = styleCache.get(element);
        if (!computedStyle) {
            computedStyle = window.getComputedStyle(element);
            styleCache.set(element, computedStyle);
        }

        this.formattingDetector.detectFromTags(element, tagName, this.contextData);
        this.formattingDetector.detectFromStyles(computedStyle, this.contextData);
        this.contentTypeDetector.detect(element, tagName, this.contextData);
    }

    /**
     * Returns the current context data
     */
    public getContextData(): TextContextData {
        return this.contextData;
    }

    /**
     * Resets the context data to its initial state
     */
    public reset(): void {
        this.contextData = this.createEmptyContext();
    }

    /**
     * Adds a wrapper with context attributes around the container
     * @param container - The container element to wrap
     */
    private addContextWrapper(container: HTMLElement): void {
        if (!container) {
            return;
        }

        const wrapper = document.createElement(TAGS.DIV);
        this.htmlProcessor.addContextAttributes(wrapper, this.contextData);

        const fragment = document.createDocumentFragment();
        while (container.firstChild) {
            fragment.appendChild(container.firstChild);
        }
        wrapper.appendChild(fragment);
        container.appendChild(wrapper);
    }

    /**
     * Creates an empty context data object with default values
     * @returns A new TextContextData object with default values
     */
    private createEmptyContext(): TextContextData {
        return {
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            isStrikethrough: false,
            contentType: TextContentType.UNKNOWN,
            headingLevel: 0,
            listType: ListType.NONE,
            listNestingLevel: 0,
            listItemIndex: 0,
            codeLanguage: '',
            inTable: false,
            tableStructure: { rows: 0, cols: 0, hasHeader: false },
        };
    }
}
