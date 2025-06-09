import type { TextModel } from '@/models/textModel';
import type { MenuPosition } from '@/utils/types';
import { MENU_CONFIG, EVENTS } from '@/utils/constants';
import { EventManager } from '@/models/eventManager';
import { MenuHideReason } from '@/utils/enums';
import { logger } from '@/utils/logger';
import { ContextMenuRenderer } from '@/content/managers/contextMenuRenderer';
import { MenuPositionCalculator } from '@/content/helpers/positionCalculator';
import { CLASS_CONTEXT_MENU_VISIBLE } from '@/utils/ids';

/**
 * Manages context menu lifecycle - creation, positioning, visibility, and interactions.
 * Handles all user dismissal patterns (ESC, click outside, scroll, resize).
 */
export class ContextMenuManager {
    private readonly menuRenderer = new ContextMenuRenderer();
    private readonly eventManager = new EventManager();

    private currentTextModel: TextModel | null = null;
    private menuElement: HTMLElement | null = null;
    private cachedMenuRect: DOMRect | null = null;
    private isVisible = false;
    private autoHideTimer: number | null = null;
    private isDestroyed = false;

    private readonly onHideCallbacks: Array<(reason: MenuHideReason) => void> = [];

    constructor() {
        this.setupEventListeners();
    }

    /** Creates and displays menu for given text selection. */
    public render(textModel: TextModel, selectionRect: DOMRect): void {
        if (this.isDestroyed) {
            logger.warn('Cannot render menu: ContextMenuManager is destroyed');
            return;
        }

        try {
            this.hide(MenuHideReason.MANUAL);
            this.createMenu(textModel);
            this.positionAndShow(selectionRect);
            logger.debug('Context menu rendered successfully');
        } catch (error) {
            logger.error('Failed to render context menu:', error);
            this.cleanup();
        }
    }

    /** Hides menu with specified reason and triggers callbacks. */
    public hide(reason: MenuHideReason = MenuHideReason.MANUAL): void {
        if (this.isDestroyed || !this.menuElement) return;

        try {
            this.clearAutoHideTimer();
            this.isVisible = false;
            this.menuRenderer.hideMenu(this.menuElement, () => {
                this.cleanup();
                this.notifyHideCallbacks(reason);
            });
        } catch (error) {
            logger.error('Error hiding menu:', error);
            this.forceCleanup();
        }
    }

    /** Checks if element is contained within menu. */
    public containsElement(element: Element | null): boolean {
        if (this.isDestroyed) return false;
        return element ? (this.menuElement?.contains(element) ?? false) : false;
    }

    /** Checks if menu is currently hovered by user. */
    public isHovered(): boolean {
        if (this.isDestroyed || !this.menuElement) return false;
        return this.menuElement.matches(':hover');
    }

    /** Returns whether menu is currently visible. */
    public isMenuVisible(): boolean {
        return !this.isDestroyed && this.isVisible;
    }

    /** Returns current text model associated with menu. */
    public getCurrentTextModel(): TextModel | null {
        return this.isDestroyed ? null : this.currentTextModel;
    }

    /** Registers callback for menu hide events. */
    public onHide(callback: (reason: MenuHideReason) => void): void {
        if (!this.isDestroyed) {
            this.onHideCallbacks.push(callback);
        }
    }

    /** Cleans up all resources and event listeners. */
    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        try {
            this.hide(MenuHideReason.MANUAL);
            this.clearAutoHideTimer();
            this.eventManager.cleanup();
            this.onHideCallbacks.length = 0;
            this.menuRenderer.cleanup();
            logger.debug('ContextMenuManager destroyed successfully');
        } catch (error) {
            logger.error('Error during ContextMenuManager destruction:', error);
        }
    }

    /** Creates menu element and adds interaction handlers. */
    private createMenu(textModel: TextModel): void {
        if (this.isDestroyed) return;

        this.currentTextModel = textModel;
        this.menuElement = this.menuRenderer.createMenuWithInteractions(textModel, action =>
            this.handleMenuAction(action),
        );

        document.body.appendChild(this.menuElement);
        this.cachedMenuRect = this.menuElement.getBoundingClientRect();
    }

    /** Positions menu optimally and shows with animation. */
    private positionAndShow(selectionRect: DOMRect): void {
        if (this.isDestroyed || !this.menuElement || !this.cachedMenuRect) {
            throw new Error('Menu element not ready for positioning');
        }

        const optimalPosition = MenuPositionCalculator.calculatePosition(this.cachedMenuRect, selectionRect);

        this.applyPosition(optimalPosition);
        this.showWithAnimation();
        logger.debug('Menu positioned at:', optimalPosition);
    }

    /** Applies position coordinates to menu element. */
    private applyPosition(position: MenuPosition): void {
        if (!this.menuElement) return;
        this.menuElement.style.left = `${position.x}px`;
        this.menuElement.style.top = `${position.y}px`;
    }

    /** Shows menu with CSS animation and sets up auto-hide. */
    private showWithAnimation(): void {
        if (!this.menuElement || this.isDestroyed) return;

        this.isVisible = true;
        this.setupAutoHideTimer();

        requestAnimationFrame(() => {
            if (this.menuElement && !this.isDestroyed) {
                this.menuElement.classList.add(CLASS_CONTEXT_MENU_VISIBLE);
            }
        });
    }

    /** Handles menu item clicks and executes corresponding actions. */
    private handleMenuAction(action: string): void {
        logger.debug('Menu action triggered:', action);
    }

    /** Sets up all event listeners for menu dismissal. */
    private setupEventListeners(): void {
        this.eventManager.addEventHandlers([
            {
                target: document,
                event: EVENTS.KEYDOWN,
                handler: this.handleEscapeKey.bind(this) as EventListener,
            },
            {
                target: document,
                event: EVENTS.MOUSEDOWN,
                handler: this.handleClickOutside.bind(this) as EventListener,
            },
            {
                target: document,
                event: EVENTS.SCROLL,
                handler: this.handleScroll.bind(this),
                options: { capture: true, passive: true },
            },
            {
                target: window,
                event: EVENTS.RESIZE,
                handler: this.handleResize.bind(this),
                options: { passive: true },
            },
        ]);
    }

    /** Handles ESC key to close menu. */
    private handleEscapeKey(e: KeyboardEvent): void {
        if (e.key === 'Escape' && this.isVisible) {
            this.hide(MenuHideReason.ESCAPE_KEY);
            e.preventDefault();
        }
    }

    /** Handles clicks outside menu to close it. */
    private handleClickOutside(e: MouseEvent): void {
        const target = e.target as Element | null;
        if (this.isVisible && target && !this.containsElement(target)) {
            this.hide(MenuHideReason.CLICK_OUTSIDE);
        }
    }

    /** Handles scroll events to close menu. */
    private handleScroll(): void {
        if (this.isVisible) {
            this.hide(MenuHideReason.SCROLL);
        }
    }

    /** Handles window resize to close menu. */
    private handleResize(): void {
        if (this.isVisible) {
            this.hide(MenuHideReason.RESIZE);
        }
    }

    /** Sets up automatic menu hiding after configured delay. */
    private setupAutoHideTimer(): void {
        if (!MENU_CONFIG.VISIBILITY.ENABLE_AUTO_HIDE) return;

        this.clearAutoHideTimer();
        this.autoHideTimer = window.setTimeout(() => {
            if (this.isVisible && !this.isHovered()) {
                this.hide(MenuHideReason.AUTO_HIDE);
            }
        }, MENU_CONFIG.VISIBILITY.AUTO_HIDE_DELAY_MS);
    }

    /** Clears auto-hide timer to prevent memory leaks. */
    private clearAutoHideTimer(): void {
        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
    }

    /** Removes menu from DOM and resets state. */
    private cleanup(): void {
        if (this.menuElement?.parentNode) {
            try {
                this.menuElement.remove();
            } catch (error) {
                logger.warn('Error removing menu element during cleanup:', error);
            }
        }

        this.menuElement = null;
        this.cachedMenuRect = null;
        this.currentTextModel = null;
    }

    /** Forces cleanup when normal cleanup fails. */
    private forceCleanup(): void {
        try {
            this.cleanup();
            this.notifyHideCallbacks(MenuHideReason.MANUAL);
        } catch (error) {
            logger.error('Error during force cleanup:', error);
        }
    }

    /** Notifies all hide callbacks with error isolation. */
    private notifyHideCallbacks(reason: MenuHideReason): void {
        this.onHideCallbacks.forEach(callback => {
            try {
                callback(reason);
            } catch (error) {
                logger.error('Error in hide callback:', error);
            }
        });
    }
}
