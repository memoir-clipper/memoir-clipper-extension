import { ACTION_GET_SELECTED_TEXT } from '@/utils/actions';
import { logger } from '@/utils/logger';
import type { SelectionState } from '@/utils/types';
import { ContextMenuManager } from '@/content/managers/contextMenuManager';
import { ShortcutManager } from '@/content/managers//shortcutManager';
import { SelectionManager } from '@/content/managers//selectionManager';
import { ID_SHORTCUT_SHOW_MENU } from '@/utils/ids';
import type { ExtensionMessage } from '@/models/extensionMessage';
import { ExtensionResponse } from '@/models/extensionReponse';

/**
 * Orchestrates text selection functionality for the browser extension.
 * Coordinates between selection detection, context menu display, and keyboard shortcuts.
 *
 * Implements singleton pattern to ensure single instance per content script.
 * Handles Chrome extension messaging for external communication.
 */
export class TextSelectionOrchestrator {
    private static instance: TextSelectionOrchestrator | null = null;

    private selectionManager!: SelectionManager;
    private contextMenuManager!: ContextMenuManager;
    private shortcutManager!: ShortcutManager;
    private messageListener:
        | ((
              message: ExtensionMessage,
              sender: chrome.runtime.MessageSender,
              sendResponse: (response?: ExtensionResponse) => void,
          ) => boolean)
        | null = null;
    private isDestroyed = false;

    /**
     * Initializes or returns existing orchestrator instance.
     * Destroys any existing destroyed instance before creating new one.
     */
    public static init(): TextSelectionOrchestrator {
        if (this.instance && !this.instance.isDestroyed) {
            logger.warn('TextSelectionOrchestrator already initialized');
            return this.instance;
        }
        if (this.instance) {
            this.instance.destroy();
        }
        this.instance = new this();
        return this.instance;
    }

    /** Returns active instance or null if destroyed/non-existent. */
    public static getInstance(): TextSelectionOrchestrator | null {
        return this.instance && !this.instance.isDestroyed ? this.instance : null;
    }

    /** Destroys active instance and cleans up resources. */
    public static destroy(): void {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
    }

    constructor() {
        this.initializeManagers();
        this.setupInteractions();
        this.setupMessageHandling();
        this.setupCleanupOnUnload();
    }

    /** Returns current text selection or null if destroyed/none available. */
    public getCurrentSelection() {
        return this.isDestroyed ? null : (this.selectionManager?.getCurrentSelection() ?? null);
    }

    /** Returns whether context menu is currently visible. */
    public isMenuVisible() {
        return this.isDestroyed ? false : (this.contextMenuManager?.isMenuVisible() ?? false);
    }

    /** Creates manager instances for selection, context menu, and shortcuts. */
    private initializeManagers(): void {
        this.selectionManager = new SelectionManager();
        this.contextMenuManager = new ContextMenuManager();
        this.shortcutManager = new ShortcutManager();
    }

    /** Wires up event handlers between managers. */
    private setupInteractions(): void {
        this.manageTextSelection();
        this.executeMenuHideLogic();
        this.registerKeyboardShortcut();
    }

    /** Sets up Chrome extension message listener for external communication. */
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

    /** Registers cleanup on page unload. */
    private setupCleanupOnUnload(): void {
        window.addEventListener('beforeunload', () => {
            TextSelectionOrchestrator.destroy();
        });
    }

    /** Shows context menu when text is selected (unless menu already visible). */
    private manageTextSelection() {
        this.selectionManager.onSelection((state: SelectionState) => {
            if (this.isDestroyed || this.contextMenuManager.isMenuVisible()) {
                return;
            }
            this.showMenu(state);
        });
    }

    /** Handles context menu hide events (placeholder for future logic). */
    private executeMenuHideLogic() {
        this.contextMenuManager.onHide(() => {
            logger.info('Context menu hidden');
        });
    }

    /** Registers Ctrl+Shift+M shortcut to show menu for current selection. */
    private registerKeyboardShortcut() {
        this.shortcutManager.register(
            ID_SHORTCUT_SHOW_MENU,
            {
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                key: 'M',
            },
            () => {
                if (!this.isDestroyed) {
                    this.triggerMenuViaShortcut();
                }
            },
        );
    }

    /** Handles Chrome extension message requesting current selected text. */
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

    /** Renders context menu at selection position. */
    private showMenu(state: SelectionState): void {
        if (this.isDestroyed) return;
        // Simplified call - only pass what's needed
        this.contextMenuManager.render(state.textModel, state.selectionRect);
    }

    /** Shows menu for current selection via keyboard shortcut. */
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

    /** Cleans up all resources and event listeners. */
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
}
