import {
    TAGS,
    isHeadingTag,
    getHeadingLevel,
    CODE_TAGS,
    QUOTE_TAGS,
    LIST_TAGS,
    TABLE_CELL_TAGS,
} from '@/utils/values/htmlTags';
import { TextContentType, ListType } from '@/utils/values/enums';
import type { TextContextData } from '@/utils/values/types';

export class ContentTypeDetector {
    private static readonly LANGUAGE_CLASS_PATTERN = /^(?:language-|lang-)(.+)$/;

    // --- Main Detection Entrypoint ---

    public detect(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!element || !tagName || !contextData) return;

        // Headings
        this.detectHeading(tagName, contextData);

        // Code
        this.detectCodeBlock(element, tagName, contextData);

        // Quotes
        this.detectQuote(tagName, contextData);

        // Tables
        this.detectTable(element, tagName, contextData);
        this.detectTableCell(tagName, contextData);

        // Lists
        this.detectList(element, tagName, contextData);
        this.detectListItem(element, tagName, contextData);
    }

    // --- Heading Detection ---

    private detectHeading(tagName: string, contextData: TextContextData): void {
        if (isHeadingTag(tagName)) {
            contextData.contentType = TextContentType.HEADING;
            contextData.headingLevel = getHeadingLevel(tagName);
        }
    }

    // --- Code Block Detection ---

    private detectCodeBlock(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!CODE_TAGS.has(tagName)) return;

        contextData.contentType = TextContentType.CODE;
        contextData.codeLanguage = this.extractCodeLanguage(element);
    }

    /**
     * Extracts the programming language from the class attribute of a code block element.
     */
    private extractCodeLanguage(element: HTMLElement): string {
        for (const className of Array.from(element.classList)) {
            const match = className.match(ContentTypeDetector.LANGUAGE_CLASS_PATTERN);
            if (match?.[1]) return match[1];
        }
        return '';
    }

    // --- Quote Detection ---

    private detectQuote(tagName: string, contextData: TextContextData): void {
        if (QUOTE_TAGS.has(tagName)) {
            contextData.contentType = TextContentType.QUOTE;
        }
    }

    // --- Table Detection ---

    private detectTable(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (tagName !== TAGS.TABLE) return;

        contextData.contentType = TextContentType.TABLE;
        contextData.inTable = true;
        contextData.tableStructure = this.analyzeTableStructure(element);
    }

    /**
     * Returns table structure info: rows, columns, header presence.
     */
    private analyzeTableStructure(table: HTMLElement): {
        rows: number;
        cols: number;
        hasHeader: boolean;
    } {
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

    private detectTableCell(tagName: string, contextData: TextContextData): void {
        if (TABLE_CELL_TAGS.has(tagName)) {
            contextData.inTable = true;
        }
    }

    // --- List & List Item Detection ---

    private detectList(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!LIST_TAGS.has(tagName)) return;

        contextData.contentType = TextContentType.LIST;
        contextData.listType = tagName === TAGS.UL ? ListType.UNORDERED : ListType.ORDERED;
        contextData.listNestingLevel = this.calculateListNestingLevel(element);
    }

    private detectListItem(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (tagName !== TAGS.LI) return;

        if (contextData.contentType === TextContentType.UNKNOWN) {
            contextData.contentType = TextContentType.LIST_ITEM;
        }

        contextData.listItemIndex = this.getElementIndex(element);
    }

    /**
     * Calculates the nesting level of a list item based on its parent elements.
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
     * Returns the index of the element among its siblings, starting from 1.
     */
    private getElementIndex(element: HTMLElement): number {
        const parent = element.parentElement;
        if (!parent) return 0;

        const siblings = Array.from(parent.children);
        return siblings.indexOf(element) + 1;
    }
}
