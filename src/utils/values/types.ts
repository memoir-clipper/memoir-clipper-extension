import type { TextModel } from '@/models/textModel';
import type { KEYS, ListType, TextContentType } from './enums';

/** Represents the state of a text selection. */
export interface SelectionState {
    textModel: TextModel;
    selectionRect: DOMRect;
    selectionId: string;
}

/** Represents the position of the inline toolbar. */
export interface InlineToolbarPosition {
    x: number;
    y: number;
}

/** Configuration for keyboard shortcuts. */
export interface ShortcutConfig {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey?: boolean;
    key: keyof typeof KEYS;
}

/** Callback for handling selection state changes. */
export type SelectionCallback = (state: SelectionState) => void;

/** Callback for handling keyboard shortcuts. */
export type ShortcutCallback = (event: KeyboardEvent) => void;

/** Represents the contextual formatting and structural information for a segment of text. */
export interface TextContextData {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    contentType: TextContentType;
    headingLevel: number;
    listType: ListType;
    listNestingLevel: number;
    listItemIndex: number;
    codeLanguage: string;
    inTable: boolean;
    tableStructure: {
        rows: number;
        cols: number;
        hasHeader: boolean;
    };
}
