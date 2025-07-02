import { TEXT_FORMATTING_TAGS } from '@/utils/values/htmlTags';
import { CSS_PROPS, BOLD_FONT_WEIGHT_THRESHOLD } from '@/utils/values/cssProperties';
import type { TextContextData } from '@/utils/values/types';

export class TextFormattingDetector {
    // --- Public Detection Methods ---

    public detectFromTags(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!element || !tagName || !contextData) return;

        this.detectBoldTag(element, tagName, contextData);
        this.detectItalicTag(element, tagName, contextData);
        this.detectUnderlineTag(element, tagName, contextData);
        this.detectStrikethroughTag(element, tagName, contextData);
    }

    public detectFromStyles(style: CSSStyleDeclaration, contextData: TextContextData): void {
        if (!style || !contextData) return;

        this.detectBoldStyle(style, contextData);
        this.detectItalicStyle(style, contextData);
        this.detectTextDecorationStyle(style, contextData);
    }

    // --- Tag/Class Detection ---

    private detectBoldTag(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.BOLD.has(tagName) || element.classList.contains(CSS_PROPS.BOLD)) {
            contextData.isBold = true;
        }
    }

    private detectItalicTag(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.ITALIC.has(tagName) || element.classList.contains(CSS_PROPS.ITALIC)) {
            contextData.isItalic = true;
        }
    }

    private detectUnderlineTag(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.UNDERLINE.has(tagName) || element.classList.contains(CSS_PROPS.UNDERLINE)) {
            contextData.isUnderlined = true;
        }
    }

    private detectStrikethroughTag(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.STRIKETHROUGH.has(tagName) || element.classList.contains(CSS_PROPS.STRIKETHROUGH)) {
            contextData.isStrikethrough = true;
        }
    }

    // --- Computed Style Detection ---

    /**
     * Detects bold formatting from computed CSS styles.
     */
    private detectBoldStyle(style: CSSStyleDeclaration, contextData: TextContextData): void {
        const fontWeight = style.fontWeight;

        if (fontWeight === CSS_PROPS.BOLD || fontWeight === CSS_PROPS.BOLDER) {
            contextData.isBold = true;
            return;
        }

        const numericWeight = parseInt(fontWeight, 10);
        if (!isNaN(numericWeight) && numericWeight >= BOLD_FONT_WEIGHT_THRESHOLD) {
            contextData.isBold = true;
        }
    }

    private detectItalicStyle(style: CSSStyleDeclaration, contextData: TextContextData): void {
        if (style.getPropertyValue(CSS_PROPS.FONT_STYLE) === CSS_PROPS.ITALIC) {
            contextData.isItalic = true;
        }
    }

    private detectTextDecorationStyle(style: CSSStyleDeclaration, contextData: TextContextData): void {
        const textDecoration = style.getPropertyValue(CSS_PROPS.TEXT_DECORATION);

        if (textDecoration.includes(CSS_PROPS.UNDERLINE)) {
            contextData.isUnderlined = true;
        }

        if (textDecoration.includes(CSS_PROPS.LINE_THROUGH)) {
            contextData.isStrikethrough = true;
        }
    }
}
