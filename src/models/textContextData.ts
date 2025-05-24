import { ListType, TextContentType } from '@/utils/enums';

/**
 * Represents the formatting and structural context data for a text selection.
 * This interface captures the state of text including its formatting attributes,
 * content type, list properties, code block information, and table structure details.
 *
 * @interface SelectionContextData
 *
 * @property {boolean} isBold - Indicates whether the selected text has bold formatting
 * @property {boolean} isItalic - Indicates whether the selected text has italic formatting
 * @property {boolean} isUnderlined - Indicates whether the selected text has underline formatting
 * @property {boolean} isStrikethrough - Indicates whether the selected text has strikethrough formatting
 *
 * @property {TextContentType} contentType - The type of content the selection represents
 * @property {number} headingLevel - The heading level (1-6 for h1-h6) if the content is a heading
 *
 * @property {ListType} listType - The type of list if the selection is part of a list
 * @property {number} listNestingLevel - The nesting depth level of the list item
 * @property {number} listItemIndex - The index of the item within its list
 *
 * @property {string} codeLanguage - The programming language if the selection is within a code block
 *
 * @property {boolean} inTable - Indicates whether the selection is within a table
 * @property {Object} tableStructure - Structure information if the selection is within a table
 * @property {number} tableStructure.rows - Number of rows in the table
 * @property {number} tableStructure.cols - Number of columns in the table
 * @property {boolean} tableStructure.hasHeader - Indicates whether the table has a header row
 */
export interface TextContextData {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    contentType: TextContentType;
    headingLevel: number; // 1-6 for h1-h6
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
