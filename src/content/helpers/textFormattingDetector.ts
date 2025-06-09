import { TEXT_FORMATTING_TAGS } from '@/utils/htmlTags';
import { CSS_PROPS, BOLD_FONT_WEIGHT_THRESHOLD } from '@/utils/cssProperties';
import type { TextContextData } from '@/models/textContextData';

/**
 * TextFormattingDetector class analyzes HTML elements to detect text formatting
 * such as bold, italic, underline, and strikethrough based on HTML tags,
 * CSS classes, and computed styles.
 */
export class TextFormattingDetector {
    /**
     * Detects text formatting from HTML tags and CSS classes
     * @param element - The HTML element to analyze
     * @param tagName - The tag name of the element
     * @param contextData - The context data object to update with formatting information
     */
    public detectFromTags(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (!element || !tagName || !contextData) {
            return;
        }

        this.detectBold(element, tagName, contextData);
        this.detectItalic(element, tagName, contextData);
        this.detectUnderline(element, tagName, contextData);
        this.detectStrikethrough(element, tagName, contextData);
    }

    /**
     * Detects text formatting from computed CSS styles
     * @param style - The CSSStyleDeclaration object containing computed styles
     * @param contextData - The context data object to update with formatting information
     */
    public detectFromStyles(style: CSSStyleDeclaration, contextData: TextContextData): void {
        if (!style || !contextData) {
            return;
        }

        this.detectBoldFromStyle(style, contextData);
        this.detectItalicFromStyle(style, contextData);
        this.detectTextDecorationFromStyle(style, contextData);
    }

    /**
     * Detects bold formatting from HTML tags and CSS classes
     */
    private detectBold(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.BOLD.has(tagName) || element.classList.contains(CSS_PROPS.BOLD)) {
            contextData.isBold = true;
        }
    }

    /**
     * Detects italic formatting from HTML tags and CSS classes
     */
    private detectItalic(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.ITALIC.has(tagName) || element.classList.contains(CSS_PROPS.ITALIC)) {
            contextData.isItalic = true;
        }
    }

    /**
     * Detects underline formatting from HTML tags and CSS classes
     */
    private detectUnderline(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.UNDERLINE.has(tagName) || element.classList.contains(CSS_PROPS.UNDERLINE)) {
            contextData.isUnderlined = true;
        }
    }

    /**
     * Detects strikethrough formatting from HTML tags and CSS classes
     */
    private detectStrikethrough(element: HTMLElement, tagName: string, contextData: TextContextData): void {
        if (TEXT_FORMATTING_TAGS.STRIKETHROUGH.has(tagName) || element.classList.contains(CSS_PROPS.STRIKETHROUGH)) {
            contextData.isStrikethrough = true;
        }
    }

    /**
     * Detects text formatting from computed CSS styles
     */
    private detectBoldFromStyle(style: CSSStyleDeclaration, contextData: TextContextData): void {
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

    /**
     * Detects italic formatting from computed CSS styles
     */
    private detectItalicFromStyle(style: CSSStyleDeclaration, contextData: TextContextData): void {
        if (style.getPropertyValue(CSS_PROPS.FONT_STYLE) === CSS_PROPS.ITALIC) {
            contextData.isItalic = true;
        }
    }

    /**
     * Detects underline and strikethrough formatting from computed CSS styles
     */
    private detectTextDecorationFromStyle(style: CSSStyleDeclaration, contextData: TextContextData): void {
        const textDecoration = style.getPropertyValue(CSS_PROPS.TEXT_DECORATION);

        if (textDecoration.includes(CSS_PROPS.UNDERLINE)) {
            contextData.isUnderlined = true;
        }

        if (textDecoration.includes(CSS_PROPS.LINE_THROUGH)) {
            contextData.isStrikethrough = true;
        }
    }
}
