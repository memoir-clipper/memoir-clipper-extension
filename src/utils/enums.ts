/**
 * Enum representing different levels of logging.
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

/**
 * Represents the different types of content supported by the application.
 */
export enum ContentType {
    IMAGE = 'image',
    LINK = 'link',
    PAGE = 'page',
    TEXT = 'text',
}

/**
 * Represents the different types of text content elements.
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
 * Enum representing the different types of lists.
 */
export enum ListType {
    ORDERED = 'ordered',
    UNORDERED = 'unordered',
    NONE = '',
}

// Validation utilities
export const isValidTextContentType = (value: string): value is TextContentType =>
    Object.values(TextContentType).includes(value as TextContentType);

export const isValidListType = (value: string): value is ListType =>
    Object.values(ListType).includes(value as ListType);
