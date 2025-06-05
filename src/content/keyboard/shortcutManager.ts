import { logger } from '@/utils/logger';
import type { ShortcutCallback } from '@/utils/types';

/**
 * Manages keyboard shortcuts for the application.
 * Allows registering, unregistering, and handling keyboard shortcuts.
 */
export class ShortcutManager {
    private shortcuts: Map<string, { config: ShortcutConfig; callback: ShortcutCallback }> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Registers a new keyboard shortcut.
     */
    public register(id: string, config: ShortcutConfig, callback: ShortcutCallback): void {
        this.shortcuts.set(id, { config, callback });
        logger.debug(`Registered shortcut: ${id}`, config);
    }

    /**
     * Unregisters an existing keyboard shortcut.
     */
    public unregister(id: string): void {
        this.shortcuts.delete(id);
        logger.debug(`Unregistered shortcut: ${id}`);
    }

    /**
     * Clears all registered shortcuts.
     */
    private setupEventListeners(): void {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handles the keydown event and checks if it matches any registered shortcuts.
     * If a match is found, it executes the corresponding callback.
     */
    private handleKeyDown(e: KeyboardEvent): void {
        for (const [id, { config, callback }] of this.shortcuts) {
            if (this.matchesShortcut(e, config)) {
                logger.debug(`Shortcut triggered: ${id}`);
                e.preventDefault();
                e.stopPropagation();

                try {
                    callback(e);
                } catch (error) {
                    logger.error(`Error in shortcut callback for ${id}:`, error);
                }
                break;
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

/**
 * Configuration for a keyboard shortcut.
 */
export interface ShortcutConfig {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    key: string;
}
