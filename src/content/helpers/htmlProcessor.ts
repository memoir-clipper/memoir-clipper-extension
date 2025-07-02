import { ATTRS, LINK_ATTRS, IMG_ATTRS, TEXT_SELECTION_ESSENTIAL_ATTRS } from '@/utils/values/htmlAttributes';
import { ESSENTIAL_STYLES_PATTERN, ESSENTIAL_CLASS_PREFIXES } from '@/utils/values/cssProperties';
import { TAGS } from '@/utils/values/htmlTags';
import { ListType, TextContentType } from '@/utils/values/enums';
import { logger } from '@/utils/helpers/logger';
import type { TextContextData } from '@/utils/values/types';

export class HtmlProcessor {
    private static readonly URL_PARSE_ERROR_MESSAGE = 'Failed to parse URL';

    // --- Public API ---

    cleanupHtml(container: HTMLElement): void {
        const elements = Array.from(container.querySelectorAll('*'));
        for (const element of elements) {
            if (element instanceof HTMLElement) {
                this.cleanupElement(element);
            }
        }
    }

    addContextAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        this.addFormattingAttributes(wrapper, contextData);
        this.addContentTypeAttributes(wrapper, contextData);
        this.addStructuralAttributes(wrapper, contextData);
    }

    // --- Cleanup helpers ---

    private cleanupElement(element: HTMLElement): void {
        const tagName = element.tagName.toLowerCase();
        this.cleanupAttributes(element, tagName);
        this.processAnchorUrls(element, tagName);
        this.cleanupStyles(element);
        this.cleanupClasses(element);
    }

    private cleanupAttributes(element: HTMLElement, tagName: string): void {
        const attributes = Array.from(element.attributes);
        for (const attr of attributes) {
            if (attr.name.startsWith(ATTRS.DATA)) continue;
            if (!this.isEssentialAttribute(tagName, attr)) {
                element.removeAttribute(attr.name);
            }
        }
    }

    private cleanupStyles(element: HTMLElement): void {
        const styleAttr = element.getAttribute(ATTRS.STYLE);
        if (!styleAttr) return;
        const essentialStyles = styleAttr.match(ESSENTIAL_STYLES_PATTERN);
        if (essentialStyles && essentialStyles.length > 0) {
            element.setAttribute(ATTRS.STYLE, essentialStyles.join(';'));
        } else {
            element.removeAttribute(ATTRS.STYLE);
        }
    }

    private cleanupClasses(element: HTMLElement): void {
        if (element.classList.length === 0) return;
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

    // --- Attribute adders ---

    private addFormattingAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        if (contextData.isBold) wrapper.setAttribute(ATTRS.DATA_FORMAT_BOLD, 'true');
        if (contextData.isItalic) wrapper.setAttribute(ATTRS.DATA_FORMAT_ITALIC, 'true');
        if (contextData.isUnderlined) wrapper.setAttribute(ATTRS.DATA_FORMAT_UNDERLINE, 'true');
        if (contextData.isStrikethrough) wrapper.setAttribute(ATTRS.DATA_FORMAT_STRIKETHROUGH, 'true');
    }

    private addContentTypeAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        if (contextData.contentType !== TextContentType.UNKNOWN) {
            wrapper.setAttribute(ATTRS.DATA_CONTENT_TYPE, contextData.contentType);
        }
        if (contextData.contentType === TextContentType.HEADING && contextData.headingLevel) {
            wrapper.setAttribute(ATTRS.DATA_HEADING_LEVEL, contextData.headingLevel.toString());
        }
        if (contextData.contentType === TextContentType.CODE && contextData.codeLanguage) {
            wrapper.setAttribute(ATTRS.DATA_CODE_LANGUAGE, contextData.codeLanguage);
        }
    }

    private addStructuralAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        this.addListAttributes(wrapper, contextData);
        this.addTableAttributes(wrapper, contextData);
    }

    private addListAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        const isListContent =
            contextData.contentType === TextContentType.LIST || contextData.contentType === TextContentType.LIST_ITEM;
        if (!isListContent) return;
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

    private addTableAttributes(wrapper: HTMLElement, contextData: TextContextData): void {
        if (!contextData.inTable) return;
        wrapper.setAttribute(ATTRS.DATA_IN_TABLE, 'true');
        if (contextData.tableStructure) {
            const { rows, cols, hasHeader } = contextData.tableStructure;
            wrapper.setAttribute(ATTRS.DATA_TABLE_ROWS, rows.toString());
            wrapper.setAttribute(ATTRS.DATA_TABLE_COLS, cols.toString());
            wrapper.setAttribute(ATTRS.DATA_TABLE_HAS_HEADER, hasHeader.toString());
        }
    }

    // --- Url & attribute utilities ---

    private processAnchorUrls(element: HTMLElement, tagName: string): void {
        if (tagName !== TAGS.A || !element.hasAttribute(ATTRS.HREF)) return;
        const href = element.getAttribute(ATTRS.HREF);
        if (!href) return;
        try {
            const absoluteUrl = this.toAbsoluteUrl(href);
            element.setAttribute(ATTRS.DATA_ABSOLUTE_URL, absoluteUrl);
        } catch (error) {
            logger.warn(`${HtmlProcessor.URL_PARSE_ERROR_MESSAGE}: ${href}`, error);
        }
    }

    private isEssentialAttribute(tagName: string, attr: Attr): boolean {
        if (TEXT_SELECTION_ESSENTIAL_ATTRS.includes(attr.name)) return true;
        const tagSpecificAttrs: Record<string, string[]> = {
            [TAGS.A]: LINK_ATTRS,
            [TAGS.IMG]: IMG_ATTRS,
            [TAGS.OL]: [ATTRS.START],
        };
        const allowedAttrs = tagSpecificAttrs[tagName];
        return allowedAttrs?.includes(attr.name) ?? false;
    }

    /**
     * Converts a relative URL to an absolute URL.
     */
    private toAbsoluteUrl(relativeUrl: string): string {
        if (!relativeUrl) {
            logger.warn(HtmlProcessor.URL_PARSE_ERROR_MESSAGE, 'URL is empty');
        }
        return new URL(relativeUrl, window.location.href).href;
    }
}
