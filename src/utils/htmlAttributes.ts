/**
 * Constants for HTML attribute names
 */
export const ATTRS = {
    // Common attributes
    HREF: 'href',
    SRC: 'src',
    ALT: 'alt',
    TITLE: 'title',
    CLASS: 'class',
    STYLE: 'style',
    ID: 'id',
    TARGET: 'target',
    REL: 'rel',
    START: 'start',

    // Accessibility and roles
    ROLE: 'role',
    ARIA_LABEL: 'aria-label',

    // Content editing
    CONTENTEDITABLE: 'contenteditable',

    // Data attributes prefix
    DATA: 'data-',

    // Custom data attributes
    DATA_ABSOLUTE_URL: 'data-absolute-url',

    // Format data attributes
    DATA_FORMAT_BOLD: 'data-format-bold',
    DATA_FORMAT_ITALIC: 'data-format-italic',
    DATA_FORMAT_UNDERLINE: 'data-format-underline',
    DATA_FORMAT_STRIKETHROUGH: 'data-format-strikethrough',

    // Content type data attributes
    DATA_CONTENT_TYPE: 'data-content-type',
    DATA_HEADING_LEVEL: 'data-heading-level',
    DATA_LIST_TYPE: 'data-list-type',
    DATA_LIST_NESTING_LEVEL: 'data-list-nesting-level',
    DATA_LIST_ITEM_INDEX: 'data-list-item-index',
    DATA_CODE_LANGUAGE: 'data-code-language',
    DATA_IN_TABLE: 'data-in-table',
    DATA_TABLE_ROWS: 'data-table-rows',
    DATA_TABLE_COLS: 'data-table-cols',
    DATA_TABLE_HAS_HEADER: 'data-table-has-header',
};

// Groups of attributes
export const LINK_ATTRS = [ATTRS.HREF, ATTRS.TARGET, ATTRS.TITLE, ATTRS.REL];
export const IMG_ATTRS = [ATTRS.SRC, ATTRS.ALT, ATTRS.TITLE];

export const TEXT_SELECTION_ESSENTIAL_ATTRS = [
    ATTRS.HREF,
    ATTRS.SRC,
    ATTRS.ALT,
    ATTRS.TITLE,
    ATTRS.START,
    ATTRS.TARGET,
];
