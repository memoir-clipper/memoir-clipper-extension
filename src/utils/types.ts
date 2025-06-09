import type { TextModel } from '@/models/textModel';

export interface SelectionState {
    textModel: TextModel;
    selectionRect: DOMRect;
    selectionId: string;
}

export interface MenuPosition {
    x: number;
    y: number;
}

export type SelectionCallback = (state: SelectionState) => void;

export type ShortcutCallback = (event: KeyboardEvent) => void;
