import { EventManager } from '@/models/eventManager';
import { TextModel } from '@/models/textModel';
import { getFaviconUrl } from '@/utils/helpers/getFavicon';
import { getValidSelection } from '@/utils/helpers/getValidTextSelection';
import { logger } from '@/utils/helpers/logger';
import { ARROW_KEYS, TOOLBAR_DELAY_SHORTCUT } from '@/utils/values/constants';
import type { KEYS } from '@/utils/values/enums';
// eslint-disable-next-line no-duplicate-imports
import { EVENTS } from '@/utils/values/enums';
import type { SelectionState, SelectionCallback } from '@/utils/values/types';
import { TextSelectionAnalyzer } from '../helpers/textSelectionAnalyzer';

export class SelectionManager {
    private static readonly TAG = '[SelectionManager]';
    private static instance: SelectionManager | null = null;

    private isDestroyed = false;
    private isDetectionInitialized = false;
    private currentSelection: SelectionState | null = null;
    private onSelectionCallbacks: SelectionCallback[] = [];
    private selectionDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly eventManager = new EventManager();

    // --- Singleton & Lifecycle ---

    private constructor() {
        this.initSelectionDetection();
    }

    public static getInstance(): SelectionManager {
        SelectionManager.instance ??= new SelectionManager();
        return SelectionManager.instance;
    }

    /** Cleans up all resources and event listeners. */
    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        try {
            if (this.selectionDebounceTimer) {
                clearTimeout(this.selectionDebounceTimer);
                this.selectionDebounceTimer = null;
            }
            this.eventManager.cleanup();
            this.onSelectionCallbacks.length = 0;
            this.currentSelection = null;
            SelectionManager.instance = null;
            logger.debug(`${SelectionManager.TAG} destroyed successfully`);
        } catch (error) {
            logger.error(`${SelectionManager.TAG} Error during destruction:`, error);
        }
    }

    // --- Public API: Selection State & Callbacks ---

    public registerSelectionCallback(callback: SelectionCallback): void {
        if (this.isDestroyed) return;
        this.onSelectionCallbacks.push(callback);
    }

    public unregisterSelectionCallback(callback: SelectionCallback): void {
        if (this.isDestroyed) return;
        this.onSelectionCallbacks = this.onSelectionCallbacks.filter(cb => cb !== callback);
    }

    public getCurrentSelection(): SelectionState | null {
        return this.isDestroyed ? null : this.currentSelection;
    }

    public hasSelection(): boolean {
        return !this.isDestroyed && this.currentSelection !== null;
    }

    // --- Selection Detection & Event Handling ---

    /** Initializes selection detection event handlers. */
    private initSelectionDetection(): void {
        if (this.isDetectionInitialized) return;

        this.eventManager.addEventHandlers([
            {
                target: document,
                event: EVENTS.MOUSEUP,
                handler: this.updateCurrentSelection.bind(this),
            },
            {
                target: document,
                event: EVENTS.KEYUP,
                handler: this.createKeyboardSelectionHandler() as EventListener,
            },
        ]);

        this.isDetectionInitialized = true;
        logger.debug(`${SelectionManager.TAG} Selection event handlers registered`);
    }

    /** Returns a debounced keyboard event handler for selection changes. */
    private createKeyboardSelectionHandler(): (event: KeyboardEvent) => void {
        return (event: KeyboardEvent) => {
            if (this.isDestroyed) return;

            const isArrowKey = ARROW_KEYS.has(event.key as KEYS);
            const modifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;

            if (!isArrowKey || !modifierPressed) return;

            if (this.selectionDebounceTimer) {
                clearTimeout(this.selectionDebounceTimer);
            }

            this.selectionDebounceTimer = setTimeout(() => {
                this.updateCurrentSelection();
                this.selectionDebounceTimer = null;
            }, TOOLBAR_DELAY_SHORTCUT);
        };
    }

    /** Updates the current selection state and notifies registered callbacks if changed. */
    private updateCurrentSelection(): void {
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
                this.executeSelectionCallbacks(newSelection);
                logger.debug(`${SelectionManager.TAG} New selection processed:`, newSelection.textModel);
            }
        } catch (error) {
            logger.error(`${SelectionManager.TAG} No valid selection found:`, error);
        }
    }

    // --- Selection Processing & Model Creation ---

    /** Returns a SelectionState if the selection is valid, otherwise null. */
    private processSelection(selection: Selection): SelectionState | null {
        try {
            const range = selection.getRangeAt(0);
            const selectionRect = range.getBoundingClientRect();
            const textContent = selection.toString().trim();

            if (!textContent || selectionRect.width === 0 || selectionRect.height === 0) {
                return null;
            }

            const selectionId = this.generateSelectionId(textContent);
            const textModel = this.assembleTextModel(selection, range);

            return {
                textModel,
                selectionRect,
                selectionId,
            };
        } catch (error) {
            logger.error(`${SelectionManager.TAG} Error processing selection:`, error);
            return null;
        }
    }

    /** Assembles a TextModel from the selection and range information. */
    private assembleTextModel(selection: Selection, range: Range): TextModel {
        const analyzer = new TextSelectionAnalyzer();
        const currentTab = {
            url: window.location.href,
            title: document.title,
            favIconUrl: getFaviconUrl(),
        } as chrome.tabs.Tab;

        return new TextModel(selection.toString().trim(), analyzer.getFormattedSelection(range), currentTab);
    }

    // --- Utilities ---

    /** Generates a unique selection ID based on text content and timestamp. */
    private generateSelectionId(textContent: string): string {
        return `selection_${this.simpleHash(textContent)}`;
    }

    /** Simple hash function for generating IDs from a string. */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36) + Date.now().toString(36);
    }

    /** Executes all registered selection callbacks with the current state, catching errors. */
    private executeSelectionCallbacks(state: SelectionState): void {
        this.onSelectionCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                logger.error(`${SelectionManager.TAG} Error in selection callback:`, error);
            }
        });
    }
}
