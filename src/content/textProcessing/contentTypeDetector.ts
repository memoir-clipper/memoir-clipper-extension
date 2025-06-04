import {
    TAGS,
    isHeadingTag,
    getHeadingLevel,
    CODE_TAGS,
    QUOTE_TAGS,
    LIST_TAGS,
    TABLE_CELL_TAGS,
} from '@/utils/htmlTags';
import type { TextContextData } from '@/models/textContextData';
import { TextContentType, ListType } from '@/utils/enums';

/**
 * ContentTypeDetector class analyzes HTML elements to determine their content type
 * and structural context, such as headings, code blocks, quotes, tables, lists, and list items.
 */
export class ContentTypeDetector {
    private static readonly LANGUAGE_CLASS_PATTERN = /^(?:language-|lang-)(.+)$/;

    /**
     * Analyzes an element to determine its content type
     */
    public detect(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!element || !tagName || !contextData) {
            return;
        }

        this.detectHeading(tagName, contextData);
        this.detectCodeBlock(element, tagName, contextData);
        this.detectQuote(tagName, contextData);
        this.detectTable(element, tagName, contextData);
        this.detectTableCell(tagName, contextData);
        this.detectList(element, tagName, contextData);
        this.detectListItem(element, tagName, contextData);
    }

    /**
     * Detects the content type of a heading element
     */
    private detectHeading(tagName: string, contextData: TextContextData): void {
        if (isHeadingTag(tagName)) {
            contextData.contentType = TextContentType.HEADING;
            contextData.headingLevel = getHeadingLevel(tagName);
        }
    }

    /**
     * Detects if the element is a code block and updates the context data accordingly
     */
    private detectCodeBlock(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!CODE_TAGS.has(tagName)) {
            return;
        }

        contextData.contentType = TextContentType.CODE;
        contextData.codeLanguage = this.extractCodeLanguage(element);
    }

    /**
     * Extracts the programming language from the class attribute of a code block element
     * @param element - The HTML element to analyze
     * @returns The programming language as a string, or an empty string if not found
     */
    private extractCodeLanguage(element: HTMLElement): string {
        const classArray = Array.from(element.classList);

        for (const className of classArray) {
            const match = className.match(ContentTypeDetector.LANGUAGE_CLASS_PATTERN);
            if (match?.[1]) {
                return match[1];
            }
        }

        return '';
    }

    /**
     * Detects if the element is a quote and updates the context data accordingly
     */
    private detectQuote(tagName: string, contextData: TextContextData): void {
        if (QUOTE_TAGS.has(tagName)) {
            contextData.contentType = TextContentType.QUOTE;
        }
    }

    /**
     * Detects if the element is a table and updates the context data accordingly
     */
    private detectTable(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (tagName !== TAGS.TABLE) {
            return;
        }

        contextData.contentType = TextContentType.TABLE;
        contextData.inTable = true;
        contextData.tableStructure = this.analyzeTableStructure(element);
    }

    /**
     * Analyzes the structure of a table to determine its rows, columns, and header presence
     * @param table - The HTML table element to analyze
     * @returns An object containing the number of rows, columns, and whether it has a header
     */
    private analyzeTableStructure(table: HTMLElement) {
        const rowElements = table.getElementsByTagName('tr');
        const rows = rowElements.length;

        let cols = 0;
        let hasHeader = false;

        if (rows > 0) {
            const firstRow = rowElements[0];
            cols = firstRow?.children.length ?? 0;
            hasHeader = table.getElementsByTagName('th').length > 0;
        }

        return { rows, cols, hasHeader };
    }

    /**
     * Detects if the element is a table cell and updates the context data accordingly
     */
    private detectTableCell(tagName: string, contextData: TextContextData): void {
        if (TABLE_CELL_TAGS.has(tagName)) {
            contextData.inTable = true;
        }
    }

    /**
     * Detects if the element is a list and updates the context data accordingly
     */
    private detectList(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!LIST_TAGS.has(tagName)) {
            return;
        }

        contextData.contentType = TextContentType.LIST;
        contextData.listType = tagName === TAGS.UL ? ListType.UNORDERED : ListType.ORDERED;
        contextData.listNestingLevel = this.calculateListNestingLevel(element);
    }

    /**
     * Detects if the element is a list item and updates the context data accordingly
     */
    private detectListItem(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (tagName !== TAGS.LI) {
            return;
        }

        if (contextData.contentType === TextContentType.UNKNOWN) {
            contextData.contentType = TextContentType.LIST_ITEM;
        }

        contextData.listItemIndex = this.getElementIndex(element);
    }

    /**
     * Calculates the nesting level of a list item based on its parent elements
     * @param element - The HTML element to analyze
     * @returns The nesting level of the list item
     */
    private calculateListNestingLevel(element: HTMLElement): number {
        let nestingLevel = 0;
        let parent = element.parentElement;

        while (parent && parent !== document.body) {
            const parentTag = parent.tagName.toLowerCase();
            if (parentTag === TAGS.UL || parentTag === TAGS.OL) {
                nestingLevel++;
            }
            parent = parent.parentElement;
        }

        return nestingLevel;
    }

    /**
     * Returns the index of the element among its siblings, starting from 1
     * @param element - The HTML element to find the index for
     */
    private getElementIndex(element: HTMLElement): number {
        const parent = element.parentElement;
        if (!parent) {
            return 0;
        }

        const siblings = Array.from(parent.children);
        return siblings.indexOf(element) + 1;
    }
}
