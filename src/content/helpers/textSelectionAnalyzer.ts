import { TextContentType, ListType } from '@/utils/values/enums';
import { TextFormattingDetector } from '@/content/helpers/textFormattingDetector';
import { ContentTypeDetector } from '@/content/helpers/contentTypeDetector';
import { HtmlProcessor } from '@/content/helpers/htmlProcessor';
import { TAGS } from '@/utils/values/htmlTags';
import type { TextContextData } from '@/utils/values/types';

export class TextSelectionAnalyzer {
    private contextData: TextContextData;
    private readonly formattingDetector: TextFormattingDetector;
    private readonly contentTypeDetector: ContentTypeDetector;
    private readonly htmlProcessor: HtmlProcessor;

    // --- Initialization & Context Management ---

    constructor() {
        this.contextData = this.createEmptyContext();
        this.formattingDetector = new TextFormattingDetector();
        this.contentTypeDetector = new ContentTypeDetector();
        this.htmlProcessor = new HtmlProcessor();
    }

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

    private resetContext(): void {
        this.contextData = this.createEmptyContext();
    }

    public getContextData(): TextContextData {
        return this.contextData;
    }

    // --- Selection Analysis ---

    /**
     * Analyzes the selection context of a given range and updates the context data.
     */
    public analyzeSelectionContext(range: Range): TextContextData {
        this.resetContext();

        let node = range.commonAncestorContainer;
        if (!node) return this.contextData;

        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            node = node.parentElement;
        }

        const styleCache = new Map<Element, CSSStyleDeclaration>();

        while (node && node !== document.body && node instanceof Element) {
            if (node instanceof HTMLElement) {
                this.analyzeElement(node, styleCache);
            }
            node = node.parentNode as HTMLElement;
        }

        return this.contextData;
    }

    private analyzeElement(element: HTMLElement, styleCache: Map<Element, CSSStyleDeclaration>): void {
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

    // --- Selection Extraction & HTML Processing ---

    /**
     * Captures the formatted selection from a given range and returns it as HTML.
     */
    public getFormattedSelection(range: Range): string {
        const container = document.createElement(TAGS.DIV);
        const contents = range.cloneContents();

        if (!contents) return '';

        container.appendChild(contents);

        this.resetContext();
        this.analyzeSelectionContext(range);
        this.htmlProcessor.cleanupHtml(container);
        this.wrapWithContextAttributes(container);

        return container.innerHTML;
    }

    private wrapWithContextAttributes(container: HTMLElement): void {
        if (!container) return;

        const wrapper = document.createElement(TAGS.DIV);
        this.htmlProcessor.addContextAttributes(wrapper, this.contextData);

        const fragment = document.createDocumentFragment();
        while (container.firstChild) {
            fragment.appendChild(container.firstChild);
        }
        wrapper.appendChild(fragment);
        container.appendChild(wrapper);
    }
}
