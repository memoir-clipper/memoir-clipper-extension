import { ACTION_GET_SELECTED_TEXT } from '@/utils/values/actions';
import { logger } from '@/utils/helpers/logger';
import type { SelectionState } from '@/utils/values/types';
import { ContextMenuManager } from '@/content/managers/contextMenuManager';
import { ShortcutManager } from '@/content/managers//shortcutManager';
import { SelectionManager } from '@/content/managers//selectionManager';
import { ID_SHORTCUT_SHOW_MENU } from '@/utils/values/ids';
import type { ExtensionMessage } from '@/models/extensionMessage';
import { ExtensionResponse } from '@/models/extensionReponse';
import { KEYS } from '@/utils/values/enums';

export class TextSelectionOrchestrator {
    // --- Singleton State ---

    private static instance: TextSelectionOrchestrator | null = null;
    private isDestroyed = false;

    // --- Managers ---

    private selectionManager!: SelectionManager;
    private contextMenuManager!: ContextMenuManager;
    private shortcutManager!: ShortcutManager;

    // --- Listeners ---

    private messageListener:
        | ((
              message: ExtensionMessage,
              sender: chrome.runtime.MessageSender,
              sendResponse: (response?: ExtensionResponse) => void,
          ) => boolean)
        | null = null;

    // --- Constructor & Singleton API ---

    private constructor() {
        logger.debug('TextSelectionOrchestrator: Constructor called');
        this.initializeManagers();
        this.setupInteractions();
        this.setupMessageHandling();
        this.setupCleanupOnUnload();
        logger.debug('TextSelectionOrchestrator: Constructor completed');
    }

    public static init(): TextSelectionOrchestrator {
        if (this.instance && !this.instance.isDestroyed) return this.instance;
        if (this.instance) this.instance.destroy();
        this.instance = new this();
        return this.instance;
    }

    public static getInstance(): TextSelectionOrchestrator | null {
        return this.instance && !this.instance.isDestroyed ? this.instance : null;
    }

    public static destroy(): void {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
    }

    // --- Public API ---

    public getCurrentSelection() {
        return this.isDestroyed ? null : (this.selectionManager?.getCurrentSelection() ?? null);
    }

    public isMenuVisible() {
        return this.isDestroyed ? false : (this.contextMenuManager?.isMenuVisible() ?? false);
    }

    // --- Initialization ---

    private initializeManagers(): void {
        this.selectionManager = new SelectionManager();
        this.contextMenuManager = new ContextMenuManager();
        this.shortcutManager = new ShortcutManager();
    }

    private setupInteractions(): void {
        this.handleTextSelection();
        this.handleMenuHide();
        this.registerKeyboardShortcut();
    }

    private setupMessageHandling(): void {
        this.messageListener = (message, _sender, sendResponse) => {
            if (this.isDestroyed) {
                sendResponse(new ExtensionResponse(false, undefined, 'Orchestrator destroyed'));
                return false;
            }
            if (message.action === ACTION_GET_SELECTED_TEXT) {
                return this.handleTextSelectionRequest(sendResponse, message);
            }
            return false;
        };
        chrome.runtime.onMessage.addListener(this.messageListener);
    }

    private setupCleanupOnUnload(): void {
        window.addEventListener('beforeunload', () => {
            TextSelectionOrchestrator.destroy();
        });
    }

    // --- Cleanup ---

    private destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
            this.messageListener = null;
        }

        try {
            this.contextMenuManager?.destroy();
            this.shortcutManager?.destroy();
            this.selectionManager?.destroy();
        } catch (error) {
            logger.error('Error during orchestrator cleanup:', error);
        }
    }

    // --- Selection & Context Menu Logic ---

    private handleTextSelection() {
        this.selectionManager.onSelection((state: SelectionState) => {
            if (this.isDestroyed || this.contextMenuManager.isMenuVisible()) return;
            this.showMenu(state);
        });
    }

    private handleMenuHide() {
        this.contextMenuManager.onHide(() => {
            logger.info('Context menu hidden');
        });
    }

    private showMenu(state: SelectionState): void {
        if (this.isDestroyed) return;
        this.contextMenuManager.render(state.textModel, state.selectionRect);
    }

    // --- Keyboard Shortcut Logic ---

    private registerKeyboardShortcut() {
        this.shortcutManager.register(
            ID_SHORTCUT_SHOW_MENU,
            {
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                key: KEYS.M,
            },
            () => {
                if (!this.isDestroyed) {
                    this.triggerMenuViaShortcut();
                }
            },
        );
    }

    private triggerMenuViaShortcut(): void {
        if (this.isDestroyed) return;
        const currentSelection = this.selectionManager.getCurrentSelection();
        if (currentSelection) {
            logger.info('Triggering inline menu via shortcut');
            this.showMenu(currentSelection);
        } else {
            logger.warn('No text selection available for shortcut trigger');
        }
    }

    // --- Extension Message Handlers ---

    /**
     * Handles Chrome extension message requesting current selected text.
     */
    private handleTextSelectionRequest(
        sendResponse: (response?: ExtensionResponse) => void,
        message: ExtensionMessage,
    ): boolean {
        const currentSelection = this.selectionManager.getCurrentSelection();
        if (currentSelection) {
            sendResponse(ExtensionResponse.success(currentSelection.textModel, message.requestId));
            logger.debug('Sending text selection:', currentSelection.textModel);
            return true;
        } else {
            sendResponse(ExtensionResponse.error('No text selection available', message.requestId));
            logger.warn('No text selection available to send');
            return false;
        }
    }
}
