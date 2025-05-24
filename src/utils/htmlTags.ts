/**
 * Constants for HTML tag names to avoid string literals throughout the code
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
};

// These selectors are used to exclude certain elements from text selection
export const TEXT_SELECTION_EXCLUSIONS = `${TAGS.INPUT}, ${TAGS.TEXTAREA}, [contenteditable="true"], ${TAGS.BUTTON}, ${TAGS.IMG}, ${TAGS.SELECT}, [role="button"]`;

// Common tag groups
export const TEXT_FORMATTING_TAGS = {
    BOLD: [TAGS.STRONG, TAGS.BOLD],
    ITALIC: [TAGS.EMPHASIS, TAGS.ITALIC],
    UNDERLINE: [TAGS.UNDERLINE, TAGS.INS],
    STRIKETHROUGH: [TAGS.STRIKETHROUGH, TAGS.STRIKE, TAGS.DEL],
};

export const CODE_TAGS = [TAGS.CODE, TAGS.PRE];
export const QUOTE_TAGS = [TAGS.BLOCKQUOTE, TAGS.QUOTE];
export const LIST_TAGS = [TAGS.UL, TAGS.OL];
export const TABLE_CELL_TAGS = [TAGS.TD, TAGS.TH];

export const BLOCK_ELEMENTS = [TAGS.PARAGRAPH, TAGS.DIV, TAGS.H1, TAGS.H2, TAGS.H3, TAGS.H4, TAGS.H5, TAGS.H6, TAGS.LI, TAGS.TR, TAGS.BR];

export const MAJOR_BLOCK_ELEMENTS = [TAGS.PARAGRAPH, TAGS.DIV, TAGS.H1, TAGS.H2, TAGS.H3, TAGS.H4, TAGS.H5, TAGS.H6, TAGS.TABLE];

// Helper function to check if a tag is a heading
export const isHeadingTag = (tag: string): boolean => /^h[1-6]$/.test(tag);

// Helper function to get heading level from tag
export const getHeadingLevel = (tag: string): number => {
    return isHeadingTag(tag) ? parseInt(tag.substring(1)) : 0;
};
