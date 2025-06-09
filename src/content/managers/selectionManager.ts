import { TextModel } from '@/models/textModel';
import type { SelectionState, SelectionCallback } from '@/utils/types';
import { EVENTS } from '@/utils/constants';
import { EventManager } from '@/models/eventManager';
import { logger } from '@/utils/logger';
import { getFaviconUrl } from '@/utils/getFavicon';
import { TextSelectionAnalyzer } from '@/content/helpers/textSelectionAnalyzer';
import { getValidSelection } from '@/utils/getValidTextSelection';

/**
 * Detects text selections on web pages and notifies subscribers.
 * Handles both mouse and keyboard selection methods with validation.
 */
export class SelectionManager {
    private readonly eventManager = new EventManager();
    private isDetectionInitialized = false;
    private currentSelection: SelectionState | null = null;
    private onSelectionCallbacks: SelectionCallback[] = [];
    private isDestroyed = false;

    constructor() {
        this.registerSelectionEventHandlers();
    }

    /** Registers callback for new text selections. */
    public onSelection(callback: SelectionCallback): void {
        if (this.isDestroyed) return;
        this.onSelectionCallbacks.push(callback);
    }

    /** Returns current selection state or null if none/destroyed. */
    public getCurrentSelection(): SelectionState | null {
        return this.isDestroyed ? null : this.currentSelection;
    }

    /** Checks if valid selection exists. */
    public hasSelection(): boolean {
        return !this.isDestroyed && this.currentSelection !== null;
    }

    /** Removes specific selection callback. */
    public removeCallback(callback: SelectionCallback): void {
        if (this.isDestroyed) return;
        this.onSelectionCallbacks = this.onSelectionCallbacks.filter(cb => cb !== callback);
    }

    /** Cleans up all resources and event listeners. */
    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        try {
            this.eventManager.cleanup();
            this.onSelectionCallbacks.length = 0;
            this.currentSelection = null;
            logger.debug('SelectionManager destroyed successfully');
        } catch (error) {
            logger.error('Error during SelectionManager destruction:', error);
        }
    }

    /** Sets up mouse and keyboard selection event listeners. */
    private registerSelectionEventHandlers(): void {
        if (this.isDetectionInitialized) return;

        this.eventManager.addEventHandlers([
            {
                target: document,
                event: 'mouseup',
                handler: this.manageSelectionChange.bind(this),
            },
            {
                target: document,
                event: EVENTS.KEYDOWN,
                handler: this.createSelectionKeyEventHandler() as EventListener,
            },
        ]);

        this.isDetectionInitialized = true;
        logger.debug('Selection event handlers registered');
    }

    /** Creates keyboard handler for Shift+Arrow selection detection. */
    private createSelectionKeyEventHandler(): (event: KeyboardEvent) => void {
        return (event: KeyboardEvent) => {
            if (this.isDestroyed) return;

            const isSelectionKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key);
            const hasModifier = event.shiftKey || event.ctrlKey || event.metaKey;

            if (isSelectionKey && hasModifier) {
                setTimeout(() => this.manageSelectionChange(), 10);
            }
        };
    }

    /** Processes selection changes from mouse or keyboard events. */
    private manageSelectionChange(): void {
        if (this.isDestroyed) return;

        try {
            const selection = getValidSelection();
            if (!selection) {
                this.currentSelection = null;
                return;
            }

            const newSelection = this.processSelection(selection);
            if (newSelection && newSelection.selectionId !== this.currentSelection?.selectionId) {
                this.currentSelection = newSelection;
                this.notifySelectionCallbacks(newSelection);
                logger.debug('New selection processed:', newSelection.textModel);
            }
        } catch (error) {
            logger.error('Error handling selection event:', error);
        }
    }

    /** Converts DOM Selection to SelectionState with rich text analysis. */
    private processSelection(selection: Selection): SelectionState | null {
        try {
            const range = selection.getRangeAt(0);
            const selectionRect = range.getBoundingClientRect();
            const textContent = selection.toString().trim();

            if (!textContent || selectionRect.width === 0 || selectionRect.height === 0) {
                return null;
            }

            const selectionId = this.generateSelectionId(textContent);
            const textModel = this.createTextModel(selection, range);

            return {
                textModel,
                selectionRect,
                selectionId,
            };
        } catch (error) {
            logger.error('Error processing selection:', error);
            return null;
        }
    }

    /** Creates TextModel with formatting analysis and page context. */
    private createTextModel(selection: Selection, range: Range): TextModel {
        const analyzer = new TextSelectionAnalyzer();
        const currentTab = {
            url: window.location.href,
            title: document.title,
            favIconUrl: getFaviconUrl(),
        } as chrome.tabs.Tab;

        return new TextModel(selection.toString().trim(), analyzer.getFormattedSelection(range), currentTab);
    }

    /** Generates unique ID for selection duplicate detection. */
    private generateSelectionId(textContent: string): string {
        return `selection_${this.simpleHash(textContent)}`;
    }

    /** Fast hash function for selection IDs. */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    /** Safely notifies all selection callbacks with error isolation. */
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
