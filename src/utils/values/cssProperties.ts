/**
 * CSS property name and value constants.
 */
export const CSS_PROPS = {
    FONT_WEIGHT: 'fontWeight',
    FONT_STYLE: 'fontStyle',
    TEXT_DECORATION: 'textDecoration',
    BOLD: 'bold',
    BOLDER: 'bolder',
    ITALIC: 'italic',
    UNDERLINE: 'underline',
    LINE_THROUGH: 'line-through',
    STRIKETHROUGH: 'strikethrough',
    BACKGROUND_COLOR: 'background-color',
    TEXT_CONTENT: 'textContent',
    CLASS_NAME: 'className',
} as const;

/**
 * Font weight threshold for bold text.
 */
export const BOLD_FONT_WEIGHT_THRESHOLD = 600;

/**
 * Regex pattern for extracting essential style properties.
 */
export const ESSENTIAL_STYLES_PATTERN = /(color|background-color|font-weight|font-style|text-decoration):[^;]+/g;

/**
 * Class prefixes to preserve for syntax highlighting and code blocks.
 */
export const ESSENTIAL_CLASS_PREFIXES = ['code', 'language-', 'lang-', 'syntax-', 'highlight'];
