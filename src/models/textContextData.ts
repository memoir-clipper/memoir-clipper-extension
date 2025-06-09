import type { ListType, TextContentType } from '@/utils/enums';

/**
 * Represents the formatting and structural context data for a text selection.
 * This interface captures the state of text including its formatting attributes,
 * content type, list properties, code block information, and table structure details.
 **/
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
