import { logger } from '@/utils/logger';
import type { ShortcutCallback } from '@/utils/types';

/**
 * Configuration for a keyboard shortcut.
 */
export interface ShortcutConfig {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    key: string;
}

/**
 * Manages keyboard shortcuts for the application.
 * Allows registering, unregistering, and handling keyboard shortcuts.
 */
export class ShortcutManager {
    private shortcuts: Map<string, { config: ShortcutConfig; callback: ShortcutCallback }> = new Map();
    private keyDownHandler: (event: KeyboardEvent) => void;
    private isDestroyed = false;

    constructor() {
        this.keyDownHandler = this.handleKeyDown.bind(this);
        this.setupEventListeners();
    }

    /**
     * Registers a new keyboard shortcut.
     * @param id - Unique identifier for the shortcut
     * @param config - Keyboard shortcut configuration
     * @param callback - Function to call when shortcut is triggered
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
        logger.debug(`Registered shortcut: ${id}`, config);
    }

    /**
     * Unregisters an existing keyboard shortcut.
     * @param id - The ID of the shortcut to remove
     */
    public unregister(id: string): void {
        if (this.isDestroyed) {
            logger.warn('Cannot unregister shortcut: ShortcutManager is destroyed');
            return;
        }

        if (this.shortcuts.delete(id)) {
            logger.debug(`Unregistered shortcut: ${id}`);
        } else {
            logger.warn(`Shortcut with ID '${id}' not found`);
        }
    }

    /**
     * Gets the count of registered shortcuts (useful for debugging).
     */
    public getShortcutCount(): number {
        return this.isDestroyed ? 0 : this.shortcuts.size;
    }

    /**
     * Checks if a shortcut with the given ID exists.
     * @param id - The shortcut ID to check
     */
    public hasShortcut(id: string): boolean {
        return !this.isDestroyed && this.shortcuts.has(id);
    }

    /**
     * Clears all registered shortcuts without destroying the manager.
     */
    public clearAll(): void {
        if (this.isDestroyed) {
            logger.warn('Cannot clear shortcuts: ShortcutManager is destroyed');
            return;
        }

        const count = this.shortcuts.size;
        this.shortcuts.clear();
        logger.debug(`Cleared ${count} shortcuts`);
    }

    /**
     * Destroys the ShortcutManager, removing all event listeners and clearing shortcuts.
     * This should be called when the manager is no longer needed.
     */
    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }

        this.isDestroyed = true;

        try {
            // Remove event listener
            document.removeEventListener('keydown', this.keyDownHandler);

            // Clear all shortcuts
            const shortcutCount = this.shortcuts.size;
            this.shortcuts.clear();

            logger.debug(`ShortcutManager destroyed. Cleaned up ${shortcutCount} shortcuts`);
        } catch (error) {
            logger.error('Error during ShortcutManager destruction:', error);
        }
    }

    /**
     * Sets up the keydown event listener.
     */
    private setupEventListeners(): void {
        document.addEventListener('keydown', this.keyDownHandler);
        logger.debug('ShortcutManager event listeners initialized');
    }

    /**
     * Handles the keydown event and checks if it matches any registered shortcuts.
     * If a match is found, it executes the corresponding callback.
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (this.isDestroyed) {
            return;
        }

        for (const [id, { config, callback }] of this.shortcuts) {
            if (this.matchesShortcut(event, config)) {
                logger.debug(`Shortcut triggered: ${id}`);

                event.preventDefault();
                event.stopPropagation();

                try {
                    callback(event);
                } catch (error) {
                    logger.error(`Error in shortcut callback for ${id}:`, error);
                }
                break; // Only trigger the first matching shortcut
            }
        }
    }

    /**
     * Checks if the given keyboard event matches the specified shortcut configuration.
     */
    private matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
        return (
            event.ctrlKey === config.ctrlKey &&
            event.shiftKey === config.shiftKey &&
            event.altKey === config.altKey &&
            (event.key === config.key || event.key === config.key.toLowerCase())
        );
    }
}
