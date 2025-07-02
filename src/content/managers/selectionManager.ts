import { TextModel } from '@/models/textModel';
import type { SelectionState, SelectionCallback } from '@/utils/values/types';
import { EVENTS } from '@/utils/values/enums';
import { EventManager } from '@/models/eventManager';
import { logger } from '@/utils/helpers/logger';
import { getFaviconUrl } from '@/utils/helpers/getFavicon';
import { TextSelectionAnalyzer } from '@/content/helpers/textSelectionAnalyzer';
import { getValidSelection } from '@/utils/helpers/getValidTextSelection';

export class SelectionManager {
    private readonly eventManager = new EventManager();
    private isDetectionInitialized = false;
    private currentSelection: SelectionState | null = null;
    private onSelectionCallbacks: SelectionCallback[] = [];
    private isDestroyed = false;

    // --- Lifecycle ---

    constructor() {
        this.initSelectionDetection();
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

    // --- Public API ---

    public onSelection(callback: SelectionCallback): void {
        if (this.isDestroyed) return;
        this.onSelectionCallbacks.push(callback);
    }

    public removeCallback(callback: SelectionCallback): void {
        if (this.isDestroyed) return;
        this.onSelectionCallbacks = this.onSelectionCallbacks.filter(cb => cb !== callback);
    }

    public getCurrentSelection(): SelectionState | null {
        return this.isDestroyed ? null : this.currentSelection;
    }

    public hasSelection(): boolean {
        return !this.isDestroyed && this.currentSelection !== null;
    }

    // --- Event Handling & Detection ---

    private initSelectionDetection(): void {
        if (this.isDetectionInitialized) return;

        this.eventManager.addEventHandlers([
            {
                target: document,
                event: EVENTS.MOUSEUP,
                handler: this.handleSelectionChange.bind(this),
            },
            {
                target: document,
                event: EVENTS.KEYDOWN,
                handler: this.createKeyboardSelectionHandler() as EventListener,
            },
        ]);

        this.isDetectionInitialized = true;
        logger.debug('Selection event handlers registered');
    }

    private createKeyboardSelectionHandler(): (event: KeyboardEvent) => void {
        return (event: KeyboardEvent) => {
            if (this.isDestroyed) return;
            const isArrowKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key);
            const hasModifier = event.shiftKey || event.ctrlKey || event.metaKey;
            if (isArrowKey && hasModifier) {
                setTimeout(() => this.handleSelectionChange(), 10);
            }
        };
    }

    private handleSelectionChange(): void {
        if (this.isDestroyed) return;
        try {
            const selection = getValidSelection();
            if (!selection) {
                this.currentSelection = null;
                return;
            }
            const newSelection = this.analyzeSelection(selection);
            if (newSelection && newSelection.selectionId !== this.currentSelection?.selectionId) {
                this.currentSelection = newSelection;
                this.notifyCallbacks(newSelection);
                logger.debug('New selection processed:', newSelection.textModel);
            }
        } catch (error) {
            logger.error('Error handling selection event:', error);
        }
    }

    // --- Selection Analysis & Model Creation ---

    /**
     * Returns a SelectionState if the selection is valid, otherwise null.
     */
    private analyzeSelection(selection: Selection): SelectionState | null {
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

    private createTextModel(selection: Selection, range: Range): TextModel {
        const analyzer = new TextSelectionAnalyzer();
        const currentTab = {
            url: window.location.href,
            title: document.title,
            favIconUrl: getFaviconUrl(),
        } as chrome.tabs.Tab;

        return new TextModel(selection.toString().trim(), analyzer.getFormattedSelection(range), currentTab);
    }

    // --- Utilities ---

    private generateSelectionId(textContent: string): string {
        return `selection_${this.simpleHash(textContent)}`;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    private notifyCallbacks(state: SelectionState): void {
        this.onSelectionCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                logger.error('Error in selection callback:', error);
            }
        });
    }
}
