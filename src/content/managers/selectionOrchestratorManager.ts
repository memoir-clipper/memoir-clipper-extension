import { ACTION_GET_SELECTED_TEXT } from '@/utils/values/actions';
import { logger } from '@/utils/helpers/logger';
import type { SelectionState } from '@/utils/values/types';
import { InlineToolbarManager } from '@/content/managers/inlineToolbarManager';
import { ShortcutManager } from '@/content/managers/shortcutManager';
import { SelectionManager } from '@/content/managers/selectionManager';
import { ID_SHORTCUT_SHOW_TOOLBAR } from '@/utils/values/ids';
import type { ExtensionMessage } from '@/models/extensionMessage';
import { ExtensionResponse } from '@/models/extensionResponse';
import { INLINE_TOOLBAR_SHORTCUT } from '@/utils/values/constants';
import { ToolbarHideReason } from '@/utils/values/enums';

export class SelectionOrchestratorManager {
    private static readonly TAG = '[SelectionOrchestratorManager]';

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
        this.setupKeyboardShortcut();
        this.setupMessageHandling();
        this.setupCleanupOnUnload();
    }

    private initializeManagers(): void {
        this.shortcutManager = ShortcutManager.getInstance();
        this.selectionManager = SelectionManager.getInstance();
        this.toolbarManager = new InlineToolbarManager();
    }

    /** Registers callback to show/hide toolbar based on selection state. */
    private bindSelectionToToolbar(): void {
        this.selectionManager.registerSelectionCallback((state: SelectionState | null) => {
            if (this.isDestroyed) return;

            if (state) {
                this.toolbarManager.show(state.selectionRect);
            } else {
                this.toolbarManager.hide(ToolbarHideReason.NO_SELECTION);
            }
        });
    }

    /** Registers keyboard shortcut to trigger the inline toolbar. */
    private setupKeyboardShortcut(): void {
        const shortcutCallback = () => {
            if (!this.isDestroyed) {
                const currentSelection = this.getCurrentSelection();

                if (currentSelection) {
                    logger.info(SelectionOrchestratorManager.TAG, 'Triggering inline toolbar via shortcut');
                    this.toolbarManager.show(currentSelection.selectionRect);
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
