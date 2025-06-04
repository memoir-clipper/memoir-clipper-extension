import { getFaviconUrl } from '@/utils/getFavicon';
import { TextModel } from '@/models/textModel';
import { TEXT_SELECTION_EXCLUSIONS } from '@/utils/htmlTags';
import { logger } from '@/utils/logger';
import type { MenuPosition, SelectionCallback, SelectionState } from '@/utils/types';
import { TextSelectionAnalyzer } from './textSelectionAnalyzer';

/**
 * Manages text selection detection and callbacks in the content script.
 * This class listens for text selection events, captures the selected text along with its
 * formatting, and notifies registered callbacks with the selection state.
 * It handles both mouse and keyboard-based selections, ensuring that
 * selections are valid and not empty, and that they do not originate from excluded elements.
 */
export class SelectionManager {
    private isDetectionInitialized = false;

    private currentSelection: SelectionState | null = null;
    private onSelectionCallbacks: SelectionCallback[] = [];

    private readonly POSITION_OFFSET_Y = 5;

    private mouseUpHandler: (event: MouseEvent) => void;
    private keyUpHandler: (event: KeyboardEvent) => void;

    constructor() {
        this.mouseUpHandler = this.handleSelectionEvent.bind(this);
        this.keyUpHandler = this.createKeyUpHandler();
    }

    /**
     * Initializes the SelectionManager and sets up event listeners for text selection.
     * @param callback
     */
    public onSelection(callback: SelectionCallback): void {
        this.onSelectionCallbacks.push(callback);

        if (!this.isDetectionInitialized) {
            this.registerSelectionEventHandlers();
            this.isDetectionInitialized = true;
        }
    }

    /**
     * Retrieves the current text selection state.
     */
    public getCurrentSelection(): SelectionState | null {
        return this.currentSelection;
    }

    /**
     * Checks if there is an active text selection.
     */
    public hasSelection(): boolean {
        return this.currentSelection !== null;
    }

    /**
     * Removes a previously registered selection callback.
     * @param {SelectionCallback} callback - The callback to remove.
     */
    public removeCallback(callback: SelectionCallback): void {
        const index = this.onSelectionCallbacks.indexOf(callback);
        if (index > -1) {
            this.onSelectionCallbacks.splice(index, 1);
        }
    }

    /**
     * Destroys the SelectionManager instance, clearing all callbacks and resetting state.
     * This should be called when the content script is unloaded or no longer needed.
     */
    public destroy(): void {
        if (this.isDetectionInitialized) {
            document.removeEventListener('mouseup', this.mouseUpHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
        }

        this.onSelectionCallbacks = [];
        this.currentSelection = null;
        this.isDetectionInitialized = false;

        logger.debug('SelectionManager destroyed and cleaned up');
    }

    /**
     * Creates a keyup event handler that listens for Shift + Arrow keys to trigger selection.
     * This allows users to extend or modify their text selection using keyboard shortcuts.
     */
    private createKeyUpHandler(): (event: KeyboardEvent) => void {
        return (event: KeyboardEvent) => {
            if (event.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                this.handleSelectionEvent();
            }
        };
    }

    /**
     * Registers event handlers for text selection events.
     * This includes mouse events and keyboard shortcuts for selection.
     */
    private registerSelectionEventHandlers(): void {
        document.addEventListener('mouseup', this.mouseUpHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        logger.debug('Text selection detection initialized');
    }

    /**
     * Handles the text selection event by processing the current selection,
     * generating a unique selection ID, and notifying all registered callbacks.
     * This method is called on mouse up or when Shift + Arrow keys are pressed.
     */
    private handleSelectionEvent(): void {
        const selection = this.getValidSelection();
        if (!selection) return;

        const selectionData = this.processSelection(selection);
        if (!selectionData) return;

        if (this.currentSelection?.selectionId === selectionData.selectionId) {
            return;
        }

        this.currentSelection = selectionData;
        this.notifySelectionCallbacks(selectionData);

        logger.debug('Text selection detected:', selectionData.textModel.text);
    }

    /**
     * Processes the current text selection to extract relevant data.
     * This includes the selected text, its position, bounding rectangle, and a unique ID.
     * @param {Selection} selection - The current text selection object.
     * @returns {SelectionState | null} The processed selection state or null if invalid.
     */
    private processSelection(selection: Selection): SelectionState | null {
        const range = selection.getRangeAt(0);
        const selectionRect = range.getBoundingClientRect();
        const textContent = selection.toString().trim();

        const position = this.calculatePosition(selectionRect);
        const selectionId = this.generateSelectionId(textContent, position);
        const textModel = this.createTextModel(selection, range);

        return {
            textModel,
            position,
            selectionRect,
            selectionId,
        };
    }

    /**
     * Validates the current text selection to ensure it is not empty and does not originate from excluded elements.
     */
    private getValidSelection(): Selection | null {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed) {
            return null;
        }

        const textContent = selection.toString().trim();
        if (!textContent) {
            return null;
        }

        const anchorNode = selection.anchorNode;
        const parentElement =
            anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : (anchorNode as HTMLElement);

        if (!parentElement || parentElement.closest(TEXT_SELECTION_EXCLUSIONS)) {
            return null;
        }

        const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
        if (selectionRect.width === 0 && selectionRect.height === 0) {
            return null;
        }

        return selection;
    }

    /**
     * Calculates the position for the context menu based on the selection rectangle.
     */
    private calculatePosition(selectionRect: DOMRect): MenuPosition {
        return {
            x: selectionRect.left + selectionRect.width / 2 + window.scrollX,
            y: selectionRect.top - this.POSITION_OFFSET_Y + window.scrollY,
        };
    }

    /**
     * Creates a TextModel instance from the current selection and its range.
     * This model includes the selected text, formatted HTML, and metadata about the current page.
     */
    private createTextModel(selection: Selection, range: Range): TextModel {
        const analyzer = new TextSelectionAnalyzer();
        const currentTab = {
            url: window.location.href,
            title: document.title,
            favIconUrl: getFaviconUrl(),
        } as chrome.tabs.Tab;

        return new TextModel(selection.toString().trim(), analyzer.getFormattedSelection(range), currentTab);
    }

    /**
     * Generates a unique selection ID based on the selected text content and its position.
     */
    private generateSelectionId(textContent: string, position: MenuPosition): string {
        const contentHash = this.simpleHash(textContent);
        const positionKey = `${Math.round(position.x)}_${Math.round(position.y)}`;
        return `sel_${contentHash}_${positionKey}`;
    }

    /**
     * Generates a simple hash for a given string.
     * This is used to create a unique identifier for the selection based on its content.
     * @param {string} str - The string to hash.
     * @returns {string} A simple hash representation of the input string.
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Notifies all registered selection callbacks with the current selection state.
     * This method is called whenever a new selection is detected or an existing selection is updated.
     */
    private notifySelectionCallbacks(state: SelectionState): void {
        this.onSelectionCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                logger.error('Error in selection callback:', error);
            }
        });
    }
}
