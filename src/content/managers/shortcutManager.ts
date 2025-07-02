import { logger } from '@/utils/helpers/logger';
import type { ShortcutCallback, ShortcutConfig } from '@/utils/values/types';

/**
 * Manages keyboard shortcuts for the content script.
 * Allows registration, unregistration, and handling of keyboard shortcuts.
 * Shortcuts can be triggered by specific key combinations.
 */
export class ShortcutManager {
    private shortcuts = new Map<string, { config: ShortcutConfig; callback: ShortcutCallback }>();
    private keyDownHandler: (event: KeyboardEvent) => void;
    private isDestroyed = false;

    // --- Lifecycle ---

    constructor() {
        this.keyDownHandler = this.handleKeyDown.bind(this);
        this.setupEventListeners();
    }

    /**
     * Destroys the ShortcutManager, removing all event listeners and clearing shortcuts.
     */
    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        try {
            document.removeEventListener('keydown', this.keyDownHandler);
            const shortcutCount = this.shortcuts.size;
            this.shortcuts.clear();
            logger.debug(`ShortcutManager destroyed. Cleaned up ${shortcutCount} shortcuts`);
        } catch (error) {
            logger.error('Error during ShortcutManager destruction:', error);
        }
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', this.keyDownHandler);
    }

    // --- Registration ---

    /**
     * Register a new keyboard shortcut.
     */
    public register(id: string, config: ShortcutConfig, callback: ShortcutCallback): void {
        if (this.isDestroyed) {
            logger.warn('Cannot register shortcut: ShortcutManager is destroyed');
            return;
        }
        if (!id || typeof callback !== 'function') {
            logger.error('Invalid shortcut registration: ID and callback are required');
            return;
        }
        if (this.shortcuts.has(id)) {
            logger.warn(`Shortcut with ID '${id}' already exists, overriding`);
        }
        this.shortcuts.set(id, { config, callback });
    }

    /**
     * Unregister an existing keyboard shortcut.
     */
    public unregister(id: string): void {
        if (this.isDestroyed) {
            logger.warn('Cannot unregister shortcut: ShortcutManager is destroyed');
            return;
        }
        if (!this.shortcuts.delete(id)) {
            logger.warn(`Shortcut with ID '${id}' not found`);
        }
    }

    /**
     * Remove all registered shortcuts.
     */
    public clearAll(): void {
        if (this.isDestroyed) {
            logger.warn('Cannot clear shortcuts: ShortcutManager is destroyed');
            return;
        }
        this.shortcuts.clear();
    }

    // --- Query ---

    public getShortcutCount(): number {
        return this.isDestroyed ? 0 : this.shortcuts.size;
    }

    public hasShortcut(id: string): boolean {
        return !this.isDestroyed && this.shortcuts.has(id);
    }

    // --- Event Handling ---

    private handleKeyDown(event: KeyboardEvent): void {
        if (this.isDestroyed) return;
        for (const [id, { config, callback }] of this.shortcuts) {
            if (this.matchesShortcut(event, config)) {
                event.preventDefault();
                event.stopPropagation();
                try {
                    callback(event);
                } catch (error) {
                    logger.error(`Error in shortcut callback for ${id}:`, error);
                }
                break;
            }
        }
    }

    // --- Matching Logic ---

    private matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
        return (
            event.ctrlKey === config.ctrlKey &&
            event.shiftKey === config.shiftKey &&
            event.altKey === config.altKey &&
            (event.key === config.key || event.key === config.key.toLowerCase())
        );
    }
}
