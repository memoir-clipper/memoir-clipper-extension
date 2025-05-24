import { CSS_PROPS, BOLD_FONT_WEIGHT_THRESHOLD } from '@/utils/cssProperties';
import { TextContextData } from '@/models/textContextData';
import { TEXT_FORMATTING_TAGS } from '@/utils/htmlTags';

/**
 * Detects text formatting from element tags and classes
 */
export function detectTextFormatting(element: HTMLElement, tagName: string, contextData: TextContextData): void {
    // Bold
    if (TEXT_FORMATTING_TAGS.BOLD.includes(tagName) || element.classList.contains('bold')) {
        contextData.isBold = true;
    }

    // Italic
    if (TEXT_FORMATTING_TAGS.ITALIC.includes(tagName) || element.classList.contains('italic')) {
        contextData.isItalic = true;
    }

    // Underline
    if (TEXT_FORMATTING_TAGS.UNDERLINE.includes(tagName) || element.classList.contains('underline')) {
        contextData.isUnderlined = true;
    }

    // Strikethrough
    if (TEXT_FORMATTING_TAGS.STRIKETHROUGH.includes(tagName) || element.classList.contains('strikethrough')) {
        contextData.isStrikethrough = true;
    }
}

/**
 * Detects and updates text formatting information based on computed CSS styles.
 */
export function detectComputedFormatting(style: CSSStyleDeclaration, contextData: TextContextData): void {
    if (
        style.getPropertyValue(CSS_PROPS.FONT_WEIGHT) === CSS_PROPS.BOLD ||
        parseInt(style.getPropertyValue(CSS_PROPS.FONT_WEIGHT)) >= BOLD_FONT_WEIGHT_THRESHOLD
    ) {
        contextData.isBold = true;
    }

    if (style.getPropertyValue(CSS_PROPS.FONT_STYLE) === CSS_PROPS.ITALIC) {
        contextData.isItalic = true;
    }

    if (style.getPropertyValue(CSS_PROPS.TEXT_DECORATION).includes(CSS_PROPS.UNDERLINE)) {
        contextData.isUnderlined = true;
    }

    if (style.getPropertyValue(CSS_PROPS.TEXT_DECORATION).includes(CSS_PROPS.LINE_THROUGH)) {
        contextData.isStrikethrough = true;
    }
}
