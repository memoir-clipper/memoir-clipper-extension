import { TextContextData } from '@/models/textContextData';
import { TextContentType, ListType } from '@/utils/enums';
import { detectTextFormatting, detectComputedFormatting } from '@/content/textFormattingDetectors';
import { detectTextContentType } from './contentTypeDetectors';
import { TAGS } from '@/utils/htmlTags';
import { TEXT_SELECTION_ESSENTIAL_ATTRS } from '@/utils/htmlAttributes';
import { ESSENTIAL_STYLES_PATTERN, ESSENTIAL_CLASS_PREFIXES } from '@/utils/cssProperties';
import { ATTRS, LINK_ATTRS, IMG_ATTRS } from '@/utils/htmlAttributes';

/**
 * Captures the current selection and formats it as HTML with context attributes.
 *
 * This function takes a DOM Range object, extracts its contents, analyzes the
 * formatting context (such as bold, italic, list structure, etc.), cleans up
 * unnecessary HTML attributes, and adds standardized context attributes to the
 * resulting HTML.
 *
 * @param range - The DOM Range object representing the user's selection
 * @returns The formatted HTML string with context attributes representing the selection
 */
export function captureFormattedSelection(range: Range): string {
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());

    const contextData: TextContextData = {
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

    analyzeSelectionContext(range, contextData); // Analyze the selection context
    cleanupHtml(container); // Clean up the HTML to remove unnecessary attributes
    addContextAttributes(container, contextData); // Add context attributes based on the analysis

    return container.innerHTML;
}

/**
 * Analyzes the DOM context of a text selection and populates the provided context data object.
 *
 * This function traverses up the DOM tree from the selection's common ancestor container,
 * examining each parent element for text formatting, content type, and computed styles.
 * The results are stored in the provided contextData object.
 *
 * @param range - The DOM Range object representing the current text selection
 * @param contextData - The TextContextData object to be populated with formatting and content type information
 */
function analyzeSelectionContext(range: Range, contextData: TextContextData): void {
    let node = range.commonAncestorContainer;

    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement as HTMLElement;
    }

    // Walk up the tree to analyze parent elements
    while (node && node !== document.body) {
        if (node instanceof HTMLElement) {
            const element = node;
            const tagName = element.tagName.toLowerCase();

            detectTextFormatting(element, tagName, contextData);
            detectTextContentType(element, tagName, contextData);

            // Check computed styles for additional formatting
            const computedStyle = window.getComputedStyle(element);
            detectComputedFormatting(computedStyle, contextData);
        }
        node = node.parentNode as HTMLElement;
    }
}

/**
 * Cleans up HTML content by removing non-essential attributes, styles, and classes
 * from all elements within the provided container.
 *
 * This function:
 * - Preserves essential attributes defined in TEXT_SELECTION_ESSENTIAL_ATTRS
 * - Maintains specific attributes for links, images, and ordered lists
 * - Converts relative URLs to absolute in anchor tags and stores them in data-absolute-url
 * - Filters styles to keep only those matching ESSENTIAL_STYLES_PATTERN
 * - Preserves only classes matching ESSENTIAL_CLASS_PREFIXES
 *
 * @param container - The HTML element whose contents need to be cleaned
 *
 * @example
 * // Clean up a selected portion of the document
 * const selection = document.querySelector('.article-content');
 * cleanupHtml(selection);
 */
function cleanupHtml(container: HTMLElement): void {
    const elements = container.querySelectorAll('*');

    elements.forEach(el => {
        if (el instanceof HTMLElement) {
            const tagName = el.tagName.toLowerCase();

            // Clean up non-essential data attributes
            Array.from(el.attributes).forEach(attr => {
                // Skip data-* attributes
                if (attr.name.startsWith(ATTRS.DATA)) {
                    return;
                }

                // Remove non-essential attributes
                if (!isEssentialAttribute(tagName, attr)) {
                    el.removeAttribute(attr.name);
                }
            });

            // Ensure href are converted to absolute URLs for anchor tags
            if (tagName === TAGS.A && el.hasAttribute(ATTRS.HREF)) {
                const href = el.getAttribute(ATTRS.HREF);
                if (href) {
                    try {
                        const absoluteUrl = toAbsoluteUrl(href, window.location.href);
                        el.setAttribute(ATTRS.DATA_ABSOLUTE_URL, absoluteUrl);
                    } catch (e) {
                        // If URL parsing fails, just keep original href
                    }
                }
            }

            // Clean up style attributes - keep only essential ones
            if (el.hasAttribute(ATTRS.STYLE)) {
                const style = el.getAttribute(ATTRS.STYLE) || '';
                const essentialStyles = style.match(ESSENTIAL_STYLES_PATTERN);

                if (essentialStyles) {
                    el.setAttribute(ATTRS.STYLE, essentialStyles.join(';'));
                } else {
                    el.removeAttribute(ATTRS.STYLE);
                }
            }

            // Clean up classes - keep only essential ones
            if (el.classList.length > 0) {
                const essentialClasses = Array.from(el.classList).filter(cls =>
                    ESSENTIAL_CLASS_PREFIXES.some(prefix => cls === prefix || cls.startsWith(prefix)),
                );

                if (essentialClasses.length > 0) {
                    el.className = essentialClasses.join(' ');
                } else {
                    el.removeAttribute(ATTRS.CLASS);
                }
            }
        }
    });
}

/**
 * Checks if an attribute is essential for text selection.
 *
 * This function determines whether a given attribute is essential based on the tag name
 * and the attribute's name. It considers attributes that are necessary for text selection
 * and formatting, such as href for links, src for images, and specific styles.
 *
 * @param tagName - The name of the HTML tag (e.g., 'a', 'img', 'ol')
 * @param attr - The attribute to check
 * @returns True if the attribute is essential, false otherwise
 */
function isEssentialAttribute(tagName: string, attr: Attr): boolean {
    return (
        TEXT_SELECTION_ESSENTIAL_ATTRS.includes(attr.name) ||
        (tagName === TAGS.A && LINK_ATTRS.includes(attr.name)) ||
        (tagName === TAGS.IMG && IMG_ATTRS.includes(attr.name)) ||
        (tagName === TAGS.OL && attr.name === ATTRS.START)
    );
}

/**
 * Converts a relative URL to an absolute URL
 * @param relativeUrl Relative URL to convert
 * @param baseUrl Base URL to use for conversion
 * @returns Absolute URL or the original URL if conversion fails
 */
function toAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
    try {
        return new URL(relativeUrl, baseUrl).href;
    } catch (e) {
        return relativeUrl;
    }
}

/**
 * Adds context-specific attributes to an HTML element based on provided text context data.
 * This function creates a wrapper div inside the container, adds appropriate attributes
 * to represent text formatting and structural properties, then moves the container's
 * content into this wrapper.
 *
 * @param container - The HTML element that will contain the wrapper with context attributes
 * @param contextData - Data object containing formatting and structural information about the text
 *                      such as bold/italic styling, content type, heading level, list properties,
 *                      code language, or table structure
 *
 * @remarks
 * This function handles various types of content structures including:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Headings with levels
 * - Lists with type, nesting level, and item index
 * - Code blocks with language identification
 * - Table structures with dimension information
 */
function addContextAttributes(container: HTMLElement, contextData: TextContextData): void {
    const wrapper = document.createElement('div');

    // Add formatting attributes
    if (contextData.isBold) wrapper.setAttribute(ATTRS.DATA_FORMAT_BOLD, 'true');
    if (contextData.isItalic) wrapper.setAttribute(ATTRS.DATA_FORMAT_ITALIC, 'true');
    if (contextData.isUnderlined) wrapper.setAttribute(ATTRS.DATA_FORMAT_UNDERLINE, 'true');
    if (contextData.isStrikethrough) wrapper.setAttribute(ATTRS.DATA_FORMAT_STRIKETHROUGH, 'true');

    // Add content type
    if (contextData.contentType !== TextContentType.UNKNOWN) {
        wrapper.setAttribute(ATTRS.DATA_CONTENT_TYPE, contextData.contentType);
    }

    // Add heading info
    if (contextData.contentType === TextContentType.HEADING && contextData.headingLevel) {
        wrapper.setAttribute(ATTRS.DATA_HEADING_LEVEL, contextData.headingLevel.toString());
    }

    // Add list info
    if (contextData.contentType === TextContentType.LIST || contextData.contentType === TextContentType.LIST_ITEM) {
        if (contextData.listType !== ListType.NONE) {
            wrapper.setAttribute(ATTRS.DATA_LIST_TYPE, contextData.listType);
        }

        if (contextData.listNestingLevel) {
            wrapper.setAttribute(ATTRS.DATA_LIST_NESTING_LEVEL, contextData.listNestingLevel.toString());
        }

        if (contextData.listItemIndex) {
            wrapper.setAttribute(ATTRS.DATA_LIST_ITEM_INDEX, contextData.listItemIndex.toString());
        }
    }

    // Add code info
    if (contextData.contentType === TextContentType.CODE && contextData.codeLanguage) {
        wrapper.setAttribute(ATTRS.DATA_CODE_LANGUAGE, contextData.codeLanguage);
    }

    // Add table info
    if (contextData.inTable) {
        wrapper.setAttribute(ATTRS.DATA_IN_TABLE, 'true');

        if (contextData.tableStructure) {
            wrapper.setAttribute(ATTRS.DATA_TABLE_ROWS, contextData.tableStructure.rows.toString());
            wrapper.setAttribute(ATTRS.DATA_TABLE_COLS, contextData.tableStructure.cols.toString());
            wrapper.setAttribute(ATTRS.DATA_TABLE_HAS_HEADER, contextData.tableStructure.hasHeader.toString());
        }
    }

    // Move all content into the wrapper
    while (container.firstChild) {
        wrapper.appendChild(container.firstChild);
    }

    container.appendChild(wrapper);
}
