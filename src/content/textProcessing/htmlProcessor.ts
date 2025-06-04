import { ATTRS, LINK_ATTRS, IMG_ATTRS, TEXT_SELECTION_ESSENTIAL_ATTRS } from '@/utils/htmlAttributes';
import { ESSENTIAL_STYLES_PATTERN, ESSENTIAL_CLASS_PREFIXES } from '@/utils/cssProperties';
import { TAGS } from '@/utils/htmlTags';
import type { TextContextData } from '@/models/textContextData';
import { ListType, TextContentType } from '@/utils/enums';
import { logger } from '@/utils/logger';

/**
 * HtmlProcessor class provides methods to clean up HTML content,
 * add context attributes, and process URLs.
 */
export class HtmlProcessor {
    private static readonly URL_PARSE_ERROR_MESSAGE = 'Failed to parse URL';

    /**
     * Cleans up HTML by removing unnecessary attributes and styles
     */
    public cleanupHtml(container: HTMLElement): void {
        const elements = container.querySelectorAll('*');
        const elementsArray = Array.from(elements);

        for (const element of elementsArray) {
            if (element instanceof HTMLElement) {
                this.cleanupElement(element);
            }
        }
    }

    /**
     * Adds context attributes to a wrapper element
     */
    public addContextAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        this.addFormattingAttributes(wrapper, contextData);
        this.addContentTypeAttributes(wrapper, contextData);
        this.addStructuralAttributes(wrapper, contextData);
    }

    /**
     * Analyzes an element to determine its content type and context
     */
    private cleanupElement(element: HTMLElement): void {
        const tagName = element.tagName.toLowerCase();

        this.cleanupAttributes(element, tagName);
        this.processAnchorUrls(element, tagName);
        this.cleanupStyles(element);
        this.cleanupClasses(element);
    }

    /**
     * Cleans up attributes based on the tag name and essential attributes
     */
    private cleanupAttributes(element: HTMLElement, tagName: string): void {
        const attributes = Array.from(element.attributes);

        for (const attr of attributes) {
            if (attr.name.startsWith(ATTRS.DATA)) {
                continue;
            }

            if (!this.isEssentialAttribute(tagName, attr)) {
                element.removeAttribute(attr.name);
            }
        }
    }

    /**
     * Processes anchor URLs to convert relative URLs to absolute
     */
    private processAnchorUrls(element: HTMLElement, tagName: string): void {
        if (tagName !== TAGS.A || !element.hasAttribute(ATTRS.HREF)) {
            return;
        }

        const href = element.getAttribute(ATTRS.HREF);
        if (!href) {
            return;
        }

        try {
            const absoluteUrl = this.toAbsoluteUrl(href);
            element.setAttribute(ATTRS.DATA_ABSOLUTE_URL, absoluteUrl);
        } catch (error) {
            console.warn(`${HtmlProcessor.URL_PARSE_ERROR_MESSAGE}: ${href}`, error);
        }
    }

    /**
     * Cleans up inline styles and classes
     */
    private cleanupStyles(element: HTMLElement): void {
        const styleAttr = element.getAttribute(ATTRS.STYLE);
        if (!styleAttr) {
            return;
        }

        const essentialStyles = styleAttr.match(ESSENTIAL_STYLES_PATTERN);

        if (essentialStyles && essentialStyles.length > 0) {
            element.setAttribute(ATTRS.STYLE, essentialStyles.join(';'));
        } else {
            element.removeAttribute(ATTRS.STYLE);
        }
    }

    /**
     * Cleans up classes by retaining only essential classes
     */
    private cleanupClasses(element: HTMLElement): void {
        if (element.classList.length === 0) {
            return;
        }

        const classArray = Array.from(element.classList);
        const essentialClasses = classArray.filter(cls =>
            ESSENTIAL_CLASS_PREFIXES.some(prefix => cls === prefix || cls.startsWith(prefix)),
        );

        if (essentialClasses.length > 0) {
            element.className = essentialClasses.join(' ');
        } else {
            element.removeAttribute(ATTRS.CLASS);
        }
    }

    /**
     * Adds formatting and content type attributes to the wrapper element
     */
    private addFormattingAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        const formatMap = [
            [contextData.isBold, ATTRS.DATA_FORMAT_BOLD],
            [contextData.isItalic, ATTRS.DATA_FORMAT_ITALIC],
            [contextData.isUnderlined, ATTRS.DATA_FORMAT_UNDERLINE],
            [contextData.isStrikethrough, ATTRS.DATA_FORMAT_STRIKETHROUGH],
        ] as const;

        for (const [condition, attribute] of formatMap) {
            if (condition) {
                wrapper.setAttribute(attribute, 'true');
            }
        }
    }

    /**
     * Adds content type and structural attributes to the wrapper element
     */
    private addContentTypeAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        if (contextData.contentType !== TextContentType.UNKNOWN) {
            wrapper.setAttribute(ATTRS.DATA_CONTENT_TYPE, contextData.contentType);
        }

        const attributeMap = {
            [TextContentType.HEADING]: () => {
                if (contextData.headingLevel) {
                    wrapper.setAttribute(ATTRS.DATA_HEADING_LEVEL, contextData.headingLevel.toString());
                }
            },
            [TextContentType.CODE]: () => {
                if (contextData.codeLanguage) {
                    wrapper.setAttribute(ATTRS.DATA_CODE_LANGUAGE, contextData.codeLanguage);
                }
            },
        };

        const handler = attributeMap[contextData.contentType as keyof typeof attributeMap];
        if (handler) {
            handler();
        }
    }

    /**
     * Adds structural attributes like list and table information to the wrapper element
     */
    private addStructuralAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        this.addListAttributes(wrapper, contextData);
        this.addTableAttributes(wrapper, contextData);
    }

    /**
     * Adds list-specific attributes to the wrapper element
     */
    private addListAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        const isListContent =
            contextData.contentType === TextContentType.LIST || contextData.contentType === TextContentType.LIST_ITEM;

        if (!isListContent) {
            return;
        }

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

    /**
     * Adds table-specific attributes to the wrapper element
     */
    private addTableAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        if (!contextData.inTable) {
            return;
        }

        wrapper.setAttribute(ATTRS.DATA_IN_TABLE, 'true');

        if (contextData.tableStructure) {
            const { rows, cols, hasHeader } = contextData.tableStructure;
            wrapper.setAttribute(ATTRS.DATA_TABLE_ROWS, rows.toString());
            wrapper.setAttribute(ATTRS.DATA_TABLE_COLS, cols.toString());
            wrapper.setAttribute(ATTRS.DATA_TABLE_HAS_HEADER, hasHeader.toString());
        }
    }

    /**
     * Checks if an attribute is essential based on the tag name and attribute name
     */
    private isEssentialAttribute(tagName: string, attr: Attr): boolean {
        if (TEXT_SELECTION_ESSENTIAL_ATTRS.includes(attr.name)) {
            return true;
        }

        const tagSpecificAttrs = {
            [TAGS.A]: LINK_ATTRS,
            [TAGS.IMG]: IMG_ATTRS,
            [TAGS.OL]: [ATTRS.START],
        };

        const allowedAttrs = tagSpecificAttrs[tagName as keyof typeof tagSpecificAttrs];
        return allowedAttrs?.includes(attr.name) ?? false;
    }

    /**
     * Converts a relative URL to an absolute URL
     */
    private toAbsoluteUrl(relativeUrl: string): string {
        if (!relativeUrl) {
            logger.warn(HtmlProcessor.URL_PARSE_ERROR_MESSAGE, 'URL is empty');
        }

        return new URL(relativeUrl, window.location.href).href;
    }
}
