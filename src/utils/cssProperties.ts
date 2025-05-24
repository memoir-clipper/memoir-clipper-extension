/**
 * Constants for CSS property names and values
 */
export const CSS_PROPS = {
    FONT_WEIGHT: 'fontWeight',
    FONT_STYLE: 'fontStyle',
    TEXT_DECORATION: 'textDecoration',
    BOLD: 'bold',
    ITALIC: 'italic',
    UNDERLINE: 'underline',
    LINE_THROUGH: 'line-through',
};

// Font weight threshold for bold text
export const BOLD_FONT_WEIGHT_THRESHOLD = 600;

// Essential style properties to preserve
export const ESSENTIAL_STYLE_PROPS = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration'];

// Style property pattern for extraction
export const ESSENTIAL_STYLES_PATTERN = /(color|background-color|font-weight|font-style|text-decoration):[^;]+/g;

// Class prefixes to preserve
export const ESSENTIAL_CLASS_PREFIXES = ['code', 'language-', 'lang-', 'syntax-', 'highlight'];
