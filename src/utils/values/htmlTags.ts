/**
 * HTML tag name constants to avoid string literals throughout the codebase.
 */
export const TAGS = {
    // Text formatting
    STRONG: 'strong',
    BOLD: 'b',
    ITALIC: 'i',
    EMPHASIS: 'em',
    UNDERLINE: 'u',
    INS: 'ins',
    STRIKETHROUGH: 's',
    STRIKE: 'strike',
    DEL: 'del',

    // Block elements
    PARAGRAPH: 'p',
    DIV: 'div',

    // Headings
    H1: 'h1',
    H2: 'h2',
    H3: 'h3',
    H4: 'h4',
    H5: 'h5',
    H6: 'h6',

    // Lists
    UL: 'ul',
    OL: 'ol',
    LI: 'li',

    // Code
    CODE: 'code',
    PRE: 'pre',

    // Quotes
    BLOCKQUOTE: 'blockquote',
    QUOTE: 'q',

    // Tables
    TABLE: 'table',
    TR: 'tr',
    TD: 'td',
    TH: 'th',

    // Other
    A: 'a',
    IMG: 'img',
    BR: 'br',

    // Input elements
    INPUT: 'input',
    TEXTAREA: 'textarea',
    BUTTON: 'button',
    SELECT: 'select',

    STYLE: 'style',
} as const;

/**
 * CSS selectors for elements to exclude from text selection.
 */
export const TEXT_SELECTION_EXCLUSIONS: string[] = [
    TAGS.INPUT,
    TAGS.TEXTAREA,
    '[contenteditable="true"]',
    TAGS.BUTTON,
    TAGS.IMG,
    TAGS.SELECT,
    '[role="button"]',
];

/**
 * Common tag groups for formatting and semantic checks.
 */
export const TEXT_FORMATTING_TAGS: Record<string, Set<string>> = {
    BOLD: new Set([TAGS.STRONG, TAGS.BOLD]),
    ITALIC: new Set([TAGS.EMPHASIS, TAGS.ITALIC]),
    UNDERLINE: new Set([TAGS.UNDERLINE, TAGS.INS]),
    STRIKETHROUGH: new Set([TAGS.STRIKETHROUGH, TAGS.STRIKE, TAGS.DEL]),
};

export const CODE_TAGS: Set<string> = new Set([TAGS.CODE, TAGS.PRE]);
export const QUOTE_TAGS: Set<string> = new Set([TAGS.BLOCKQUOTE, TAGS.QUOTE]);
export const LIST_TAGS: Set<string> = new Set([TAGS.UL, TAGS.OL]);
export const TABLE_CELL_TAGS: Set<string> = new Set([TAGS.TD, TAGS.TH]);

/**
 * Checks if a tag is a heading (h1-h6).
 * @param tag - The tag name to check.
 * @returns True if the tag is a heading, false otherwise.
 */
export function isHeadingTag(tag: string): boolean {
    return /^h[1-6]$/.test(tag);
}

/**
 * Gets the heading level from a heading tag (h1-h6).
 * @param tag - The tag name.
 * @returns The heading level (1-6), or 0 if not a heading.
 */
export function getHeadingLevel(tag: string): number {
    return isHeadingTag(tag) ? parseInt(tag.substring(1), 10) : 0;
}
