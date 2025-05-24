/**
 * Enum representing different levels of logging.
 *
 * @enum {string}
 * @readonly
 *
 * @property {string} DEBUG - For detailed debugging information.
 * @property {string} INFO - For general information messages.
 * @property {string} WARN - For warning messages.
 * @property {string} ERROR - For error messages.
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

/**
 * Represents the different types of content supported by the application.
 *
 * @enum {string}
 * @property {string} IMAGE - Content that is an image
 * @property {string} LINK - Content that is a link/URL
 * @property {string} PAGE - Content that is a page
 * @property {string} TEXT - Content that is plain text
 */
export enum ContentType {
    IMAGE = 'image',
    LINK = 'link',
    PAGE = 'page',
    TEXT = 'text',
}

/**
 * Represents the different types of text content elements that can be processed or rendered.
 *
 * @enum {string}
 */
export enum TextContentType {
    PARAGRAPH = 'paragraph',
    HEADING = 'heading',
    LIST = 'list',
    LIST_ITEM = 'list-item',
    CODE = 'code',
    QUOTE = 'quote',
    TABLE = 'table',
    UNKNOWN = '',
}

/**
 * Enum representing the different types of lists that can be used.
 *
 * @enum {string}
 */
export enum ListType {
    ORDERED = 'ordered',
    UNORDERED = 'unordered',
    NONE = '',
}
