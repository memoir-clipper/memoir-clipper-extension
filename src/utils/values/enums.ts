/** Enum representing different levels of logging. */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

/** Enum for the different types of content supported by the application. */
export enum ContentType {
    IMAGE = 'image',
    LINK = 'link',
    PAGE = 'page',
    TEXT = 'text',
}

/** Enum for the different types of text content elements. */
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

/** Enum for the different types of lists. */
export enum ListType {
    ORDERED = 'ordered',
    UNORDERED = 'unordered',
    NONE = '',
}

/** Enum for the types of reasons for hiding a menu. */
export enum ToolbarHideReason {
    MANUAL = 'manual',
    CLICK_OUTSIDE = 'clickOutside',
    ESCAPE_KEY = 'escapeKey',
    SCROLL = 'scroll',
    RESIZE = 'resize',
    SAVE = 'save',
    NO_SELECTION = 'noSelection',
}

/** Enum for available context types used within the application. */
export enum CONTEXTS {
    IMAGE = 'image',
    LINK = 'link',
    PAGE = 'page',
    SELECTION = 'selection',
}

/** Enum for the different types of keys that can be used in keyboard shortcuts. */
export enum KEYS {
    TAB = 'Tab',
    ENTER = 'Enter',
    SPACE = 'Space',
    ESCAPE = 'Escape',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_RIGHT = 'ArrowRight',
    ARROW_DOWN = 'ArrowDown',
    ARROW_UP = 'ArrowUp',
    B = 'B',
    C = 'C',
    F = 'F',
    M = 'M',
    Y = 'Y',
    P = 'P',
    O = 'O',
    G = 'G',
}

/** Enum for the different types of events that can be handled in the application. */
export enum EVENTS {
    KEYUP = 'keyup',
    KEYDOWN = 'keydown',
    MOUSEUP = 'mouseup',
    MOUSEDOWN = 'mousedown',
    SCROLL = 'scroll',
    RESIZE = 'resize',
    CLICK = 'click',
    INPUT = 'input',
    CHANGE = 'change',
    FOCUS = 'focus',
}
