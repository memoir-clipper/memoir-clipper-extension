import { ACTION_GET_SELECTED_TEXT } from '@/utils/values/actions';
import { logger } from '@/utils/helpers/logger';
import type { SelectionState } from '@/utils/values/types';
import { InlineToolbarManager } from '@/content/managers/inlineToolbarManager';
import { ShortcutManager } from '@/content/managers/shortcutManager';
import { SelectionManager } from '@/content/managers/selectionManager';
import { ID_SHORTCUT_SHOW_TOOLBAR } from '@/utils/values/ids';
import type { ExtensionMessage } from '@/models/extensionMessage';
import { ExtensionResponse } from '@/models/extensionResponse';
import { INLINE_TOOLBAR_SHORTCUT, SECONDS } from '@/utils/values/constants';
import { ToolbarHideReason } from '@/utils/values/enums';
import type { CachedToolbarSelectedData, ToolbarSelectedData } from '@/utils/ui/uiConfig';

export class SelectionOrchestratorManager {
    private static readonly TAG = '[SelectionOrchestratorManager]';
    private static readonly CACHE_TIMEOUT_MS = 90 * SECONDS;

    private static instance: SelectionOrchestratorManager | null = null;
    private isDestroyed = false;

    private messageListener:
        | ((
              message: ExtensionMessage,
              sender: chrome.runtime.MessageSender,
              sendResponse: (response?: ExtensionResponse) => void,
          ) => boolean)
        | null = null;

    private selectionManager!: SelectionManager;
    private toolbarManager!: InlineToolbarManager;
    private shortcutManager!: ShortcutManager;

    private cachedToolbarData: CachedToolbarSelectedData | null = null;

    // --- Singleton API ---

    public static init(): SelectionOrchestratorManager {
        if (this.instance && !this.instance.isDestroyed) return this.instance;
        if (this.instance) this.instance.destroy();
        this.instance = new this();
        return this.instance;
    }

    public static getInstance(): SelectionOrchestratorManager | null {
        return this.instance && !this.instance.isDestroyed ? this.instance : null;
    }

    public static destroy(): void {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
    }

    private constructor() {
        this.initializeManagers();
        this.bindSelectionToToolbar();
        this.setupToolbarDataCaching();
        this.setupKeyboardShortcut();
        this.setupMessageHandling();
        this.setupCleanupOnUnload();
    }

    private initializeManagers(): void {
        this.shortcutManager = ShortcutManager.getInstance();
        this.toolbarManager = new InlineToolbarManager();
        this.selectionManager = SelectionManager.getInstance();

        this.selectionManager.setToolbarManager(this.toolbarManager);
    }

    /** Sets up toolbar data caching by listening to toolbar hide events. */
    private setupToolbarDataCaching(): void {
        this.toolbarManager.onHide((_: ToolbarHideReason, selectionData: ToolbarSelectedData | null) => {
            this.handleToolbarHide(_, selectionData);
        });
    }

    /** Handles toolbar hide events and caches selection data. */
    private handleToolbarHide(_: ToolbarHideReason, selectionData: ToolbarSelectedData | null): void {
        if (this.isDestroyed || !selectionData) return;

        const currentSelection = this.getCurrentSelection();
        if (!currentSelection) return;

        this.cachedToolbarData = {
            data: selectionData,
            timestamp: Date.now(),
            selectionId: currentSelection.selectionId,
        };
    }

    /** Registers callback to show/hide toolbar based on selection state. */
    private bindSelectionToToolbar(): void {
        this.selectionManager.registerSelectionCallback((state: SelectionState | null) => {
            if (this.isDestroyed) return;

            if (state) {
                this.showToolbarWithCache(state);
            } else {
                this.toolbarManager.hide(ToolbarHideReason.NO_SELECTION);
            }
        });
    }

    /** Shows toolbar with cached data if available and valid. */
    private showToolbarWithCache(state: SelectionState): void {
        const cachedData = this.getCachedDataForSelection(state.selectionId);

        if (cachedData) {
            logger.debug(`${SelectionOrchestratorManager.TAG}: Using cached toolbar data for selection`, {
                selectionId: state.selectionId,
                age: Date.now() - cachedData.timestamp,
                cachedData: cachedData.data,
            });
            this.toolbarManager.showWithData(state.selectionRect, cachedData.data);
        } else {
            logger.debug(`${SelectionOrchestratorManager.TAG}: No valid cached data, showing toolbar with defaults`, {
                selectionId: state.selectionId,
            });
            this.toolbarManager.show(state.selectionRect);
        }
    }

    /** Gets cached data for a selection if it exists and is still valid. */
    private getCachedDataForSelection(selectionId: string): CachedToolbarSelectedData | null {
        if (!this.cachedToolbarData) {
            logger.debug(`${SelectionOrchestratorManager.TAG}: No cached data available`);
            return null;
        }

        const { timestamp, selectionId: cachedSelectionId } = this.cachedToolbarData;
        const now = Date.now();
        const age = now - timestamp;

        if (cachedSelectionId === selectionId && age <= SelectionOrchestratorManager.CACHE_TIMEOUT_MS) {
            return this.cachedToolbarData;
        }

        this.cachedToolbarData = null;
        return null;
    }

    /** Registers keyboard shortcut to trigger the inline toolbar. */
    private setupKeyboardShortcut(): void {
        const shortcutCallback = () => {
            if (!this.isDestroyed) {
                const currentSelection = this.getCurrentSelection();

                if (currentSelection) {
                    logger.info(SelectionOrchestratorManager.TAG, 'Triggering inline toolbar via shortcut');
                    this.showToolbarWithCache(currentSelection);
                } else {
                    logger.warn(SelectionOrchestratorManager.TAG, 'No text selection available for shortcut trigger');
                }
            }
        };

        this.shortcutManager.register(ID_SHORTCUT_SHOW_TOOLBAR, INLINE_TOOLBAR_SHORTCUT, shortcutCallback);
    }

    /** Sets up message listener for extension communication. */
    private setupMessageHandling(): void {
        this.messageListener = (message, _sender, sendResponse) => {
            if (this.isDestroyed) {
                sendResponse(new ExtensionResponse(false, undefined, 'Orchestrator destroyed'));
                return false;
            }

            switch (message.action) {
                case ACTION_GET_SELECTED_TEXT:
                    return this.handleTextSelectionRequest(sendResponse, message);
                default:
                    logger.warn(SelectionOrchestratorManager.TAG, `Unknown action received: ${message.action}`);
                    sendResponse(new ExtensionResponse(false, undefined, `Unknown action: ${message.action}`));
                    return false;
            }
        };

        chrome.runtime.onMessage.addListener(this.messageListener);
    }

    private setupCleanupOnUnload(): void {
        window.addEventListener('beforeunload', () => {
            SelectionOrchestratorManager.destroy();
        });
    }

    public getCurrentSelection() {
        return this.isDestroyed ? null : (this.selectionManager?.getCurrentSelection() ?? null);
    }

    public isToolbarVisible() {
        return this.isDestroyed ? false : (this.toolbarManager?.isVisible() ?? false);
    }

    private destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
            this.messageListener = null;
        }

        this.toolbarManager?.destroy();
        this.shortcutManager?.destroy();
        this.selectionManager?.destroy();
    }

    /** Handles requests for the currently selected text. */
    private handleTextSelectionRequest(
        sendResponse: (response?: ExtensionResponse) => void,
        message: ExtensionMessage,
    ): boolean {
        const currentSelection = this.getCurrentSelection();

        if (currentSelection) {
            sendResponse(ExtensionResponse.success(currentSelection.textModel, message.requestId));
            logger.debug(SelectionOrchestratorManager.TAG, 'Sending text selection:', currentSelection.textModel);
            return true;
        } else {
            sendResponse(ExtensionResponse.error('No text selection available', message.requestId));
            logger.warn(SelectionOrchestratorManager.TAG, 'No text selection available to send');
            return false;
        }
    }
}
