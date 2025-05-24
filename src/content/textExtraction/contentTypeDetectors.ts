import { TAGS, isHeadingTag, getHeadingLevel, CODE_TAGS, QUOTE_TAGS, LIST_TAGS, TABLE_CELL_TAGS } from '@/utils/htmlTags';
import { TextContextData } from '@/models/textContextData';
import { TextContentType, ListType } from '@/utils/enums';

/**
 * Analyzes an HTML element to determine its text content type by running through
 * various detection functions. Populates the contextData object with information about
 * detected content types such as headings, code blocks, quotes, lists, tables, etc.
 *
 * @param element - The HTML element to analyze
 * @param tagName - The tag name of the element
 * @param contextData - Object to be populated with detected text content information
 */
export function detectTextContentType(element: HTMLElement, tagName: string, contextData: TextContextData): void {
    detectHeading(element, tagName, contextData);
    detectCodeBlock(element, tagName, contextData);
    detectQuote(element, tagName, contextData);
    detectList(element, tagName, contextData);
    detectListItem(element, tagName, contextData);
    detectTable(element, tagName, contextData);
    detectTableCell(element, tagName, contextData);
}

// Detect heading elements (h1-h6)
function detectHeading(_element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (isHeadingTag(tagName)) {
        contextData.contentType = TextContentType.HEADING;
        contextData.headingLevel = getHeadingLevel(tagName);
    }
}

// Detect code blocks (code, pre)
function detectCodeBlock(element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (!CODE_TAGS.includes(tagName)) return;

    contextData.contentType = TextContentType.CODE;

    // Find language-specific class if present
    const languageClass = Array.from(element.classList).find(cls => cls.startsWith('language-') || cls.startsWith('lang-'));

    if (languageClass) {
        contextData.codeLanguage = languageClass.replace(/^(language-|lang-)/, '');
    }
}

// Detect blockquotes and quotes
function detectQuote(_element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (QUOTE_TAGS.includes(tagName)) {
        contextData.contentType = TextContentType.QUOTE;
    }
}

// Detect lists (ul, ol)
function detectList(element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (!LIST_TAGS.includes(tagName)) return;

    contextData.contentType = TextContentType.LIST;
    contextData.listType = tagName === TAGS.UL ? ListType.UNORDERED : ListType.ORDERED;
    contextData.listNestingLevel = calculateListNestingLevel(element);
}

// Detect list items (li)
function detectListItem(element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (tagName !== TAGS.LI) return;

    if (contextData.contentType === TextContentType.UNKNOWN) {
        contextData.contentType = TextContentType.LIST_ITEM;
    }

    contextData.listItemIndex = getElementIndex(element);
}

// Detect tables
function detectTable(element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (tagName !== TAGS.TABLE) return;

    contextData.contentType = TextContentType.TABLE;
    contextData.inTable = true;

    // Analyze table structure
    const rows = element.querySelectorAll(TAGS.TR).length;
    const firstRowCells = element.querySelector(TAGS.TR)?.querySelectorAll(`${TAGS.TD}, ${TAGS.TH}`).length || 0;
    const hasHeader = element.querySelector(TAGS.TH) !== null;

    contextData.tableStructure = {
        rows,
        cols: firstRowCells,
        hasHeader,
    };
}

// Detect table cells
function detectTableCell(_element: HTMLElement, tagName: string, contextData: TextContextData): void {
    if (TABLE_CELL_TAGS.includes(tagName)) {
        contextData.inTable = true;
    }
}

/**
 * Calculates how deeply nested a list element is
 * @param element The list element to check
 * @returns Nesting level (0 for top-level lists)
 */
function calculateListNestingLevel(element: HTMLElement): number {
    let nestingLevel = 0;
    let parent = element.parentElement;

    while (parent && parent !== document.body) {
        if ([TAGS.UL, TAGS.OL].includes(parent.tagName.toLowerCase())) {
            nestingLevel++;
        }
        parent = parent.parentElement;
    }

    return nestingLevel;
}

/**
 * Gets the index of an element among its siblings
 * @param element Element to find the index for
 * @returns 1-based index of the element among siblings of the same type
 */
function getElementIndex(element: HTMLElement): number {
    if (!element.parentElement) return 0;

    const siblings = Array.from(element.parentElement.children);
    return siblings.indexOf(element) + 1;
}
