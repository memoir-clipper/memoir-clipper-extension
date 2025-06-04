import type { TextModel } from '@/models/textModel';

export type HandleTextSelectionCallback = (model: TextModel, position: MenuPosition, selectionRect: DOMRect) => void;

export type SelectionCallback = (state: SelectionState) => void;

export type MenuPosition = {
    x: number;
    y: number;
};

export type SelectionState = {
    textModel: TextModel;
    position: MenuPosition;
    selectionRect: DOMRect;
    selectionId: string;
};
