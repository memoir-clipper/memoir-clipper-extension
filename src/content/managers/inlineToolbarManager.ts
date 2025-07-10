import type { InlineToolbarPosition } from '@/utils/values/types';
import { EventManager } from '@/models/eventManager';
import { EVENTS, KEYS, ToolbarHideReason } from '@/utils/values/enums';
import { logger } from '@/utils/helpers/logger';
import type { InlineToolbarInstance } from '@/utils/ui/inlineToolbarFactory';
// eslint-disable-next-line no-duplicate-imports
import { InlineToolbarFactory } from '@/utils/ui/inlineToolbarFactory';
import { ToolbarPositioningUtil } from '@/content/helpers/positionCalculator';
import type { ToolbarSelectedData } from '@/utils/ui/uiConfig';
import { CLASS_INLINE_TOOLBAR_VISIBLE } from '@/utils/values/ids';

export class InlineToolbarManager {
    private static readonly TAG = '[InlineToolbarManager]';

    private toolbarInstance: InlineToolbarInstance | null = null;
    private isDestroyed = false;

    private readonly eventManager = new EventManager();
    private toolbarContainer: HTMLElement | null = null;
    private onHideCallback: (reason: ToolbarHideReason, toolbarSelectedData: ToolbarSelectedData | null) => void =
        () => {};

    constructor() {
        this.setupGlobalEventListeners();
        this.createPersistentToolbar();
    }

    // --- Public API ---

    /** Shows toolbar at optimal position for given selection. */
    public show(selectionRect: DOMRect): void {
        if (this.isDestroyed || !this.toolbarInstance) {
            logger.warn(
                InlineToolbarManager.TAG,
                'Cannot show toolbar: Manager is destroyed or toolbar not initialized',
            );
            return;
        }

        this.positionAndShow(selectionRect, null);
        logger.debug(InlineToolbarManager.TAG, 'Toolbar shown with default data');
    }

    /** Shows toolbar with cached selection data. */
    public showWithData(selectionRect: DOMRect, cachedData: ToolbarSelectedData): void {
        if (this.isDestroyed || !this.toolbarInstance) {
            logger.warn(
                InlineToolbarManager.TAG,
                'Cannot show toolbar: Manager is destroyed or toolbar not initialized',
            );
            return;
        }

        this.positionAndShow(selectionRect, cachedData);
        logger.debug(InlineToolbarManager.TAG, 'Toolbar shown with cached data', cachedData);
    }

    /** Hides toolbar. */
    public hide(reason: ToolbarHideReason): void {
        if (this.isDestroyed || !this.toolbarInstance) return;

        const currentData = this.toolbarInstance.getSelectionData();

        this.toolbarInstance.hide();
        this.onHideCallback(reason, currentData);

        logger.debug(InlineToolbarManager.TAG, 'Toolbar hidden:', reason, currentData);
    }

    /** Sets callback for hide events. */
    public onHide(callback: (reason: ToolbarHideReason, selectionData: ToolbarSelectedData | null) => void): void {
        this.onHideCallback = callback;
    }

    /** Destroys the toolbar and cleans up resources. */
    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        this.hide(ToolbarHideReason.MANUAL);
        this.eventManager.cleanup();
        this.toolbarInstance?.cleanup();
        this.toolbarInstance = null;
        this.toolbarContainer = null;
        logger.debug(InlineToolbarManager.TAG, 'destroyed successfully');
    }

    // --- State Queries ---

    /** Returns true if the toolbar contains the given element. */
    public containsElement(element: Element | null): boolean {
        if (this.isDestroyed || !element) return false;

        return this.toolbarContainer?.contains(element) ?? false;
    }

    /** Returns true if the toolbar is currently hovered. */
    public isHovered(): boolean {
        if (this.isDestroyed || !this.toolbarContainer) return false;

        return this.toolbarContainer.matches(':hover');
    }

    /** Returns true if the toolbar is visible. */
    public isVisible(): boolean {
        if (this.isDestroyed || !this.toolbarContainer) return false;

        return this.toolbarContainer.classList.contains(CLASS_INLINE_TOOLBAR_VISIBLE);
    }

    // --- Toolbar Lifecycle & Initialization ---

    /** Creates toolbar once and keeps it in memory. */
    private createPersistentToolbar(): void {
        if (this.isDestroyed) return;

        this.toolbarInstance = InlineToolbarFactory.create({
            onSave: data => this.handleSave(data),
            onCopy: html => this.handleCopy(html),
            onClose: () => this.hide(ToolbarHideReason.MANUAL),
        });

        this.toolbarContainer = this.toolbarInstance.getElement();
        document.body.appendChild(this.toolbarContainer as HTMLElement);

        logger.debug(InlineToolbarManager.TAG, 'Persistent toolbar created');
    }

    /** Sets up global event listeners for toolbar interactions. */
    private setupGlobalEventListeners(): void {
        this.eventManager.addEventHandlers([
            {
                target: document,
                event: EVENTS.KEYDOWN,
                handler: this.handleGlobalEscapeKey.bind(this) as EventListener,
            },
            {
                target: document,
                event: EVENTS.MOUSEDOWN,
                handler: this.handleClickOutside.bind(this) as EventListener,
            },
            {
                target: document,
                event: EVENTS.SCROLL,
                handler: () => this.isVisible() && this.hide(ToolbarHideReason.SCROLL),
                options: { capture: true, passive: true },
            },
            {
                target: window,
                event: EVENTS.RESIZE,
                handler: () => this.isVisible() && this.hide(ToolbarHideReason.RESIZE),
                options: { passive: true },
            },
        ]);
    }

    // --- Toolbar Positioning ---

    /** Calculates and applies optimal position, then shows the toolbar. */
    private positionAndShow(selectionRect: DOMRect, cachedData: ToolbarSelectedData | null): void {
        if (this.isDestroyed || !this.toolbarContainer || !this.toolbarInstance) {
            logger.error(InlineToolbarManager.TAG, 'Toolbar element not ready for positioning');
            return;
        }

        const toolbarRect = this.toolbarContainer.getBoundingClientRect();
        const optimalPosition = ToolbarPositioningUtil.calculatePosition(toolbarRect, selectionRect);

        this.applyPosition(optimalPosition);

        // Set cached data BEFORE showing the toolbar
        if (cachedData) {
            this.toolbarInstance.setSelectionData(cachedData);
            this.toolbarInstance.show(false); // Don't reset since we just set the data
        } else {
            this.toolbarInstance.show(true); // Reset to defaults
        }

        logger.debug(InlineToolbarManager.TAG, 'Toolbar positioned at:', optimalPosition);
    }

    /** Applies the given position to the toolbar container. */
    private applyPosition(position: InlineToolbarPosition): void {
        this.toolbarContainer!.style.left = `${position.x}px`;
        this.toolbarContainer!.style.top = `${position.y}px`;
    }

    // --- Toolbar Event Handlers ---

    /** Handles Escape key to close toolbar or dropdowns. */
    private handleGlobalEscapeKey(e: KeyboardEvent): void {
        if (e.key === KEYS.ESCAPE && this.isVisible()) {
            const hasOpenDropdowns = this.toolbarInstance?.hasOpenDropdowns();

            if (hasOpenDropdowns) {
                this.toolbarInstance?.closeAllOpenDropdowns();
                e.preventDefault();
                e.stopPropagation();
            } else {
                this.hide(ToolbarHideReason.ESCAPE_KEY);
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    /** Hides toolbar if click is outside the toolbar. */
    private handleClickOutside(e: MouseEvent): void {
        const target = e.target as Element | null;
        if (this.isVisible() && target && !this.containsElement(target)) {
            this.hide(ToolbarHideReason.CLICK_OUTSIDE);
        }
    }

    /** Handles save action from the toolbar. */
    private handleSave(data: ToolbarSelectedData): void {
        logger.debug('Save action:', data);
        // TODO: Implement save logic here
        this.hide(ToolbarHideReason.SAVE);
    }

    /** Handles copy action from the toolbar. */
    private handleCopy(html: string): void {
        logger.debug('Copy action:', html);
        // TODO: Implement copy logic here
    }
}
