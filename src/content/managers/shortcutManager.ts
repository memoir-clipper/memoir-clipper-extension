import { logger } from '@/utils/helpers/logger';
import type { ShortcutCallback, ShortcutConfig } from '@/utils/values/types';

export class ShortcutManager {
    private static readonly TAG = '[ShortcutManager]';
    private static instance: ShortcutManager | null = null;

    private isDestroyed = false;
    private shortcuts = new Map<string, { config: ShortcutConfig; callback: ShortcutCallback }>();
    private keyDownHandler: (event: KeyboardEvent) => void;

    // --- Constructor & Singleton ---

    private constructor() {
        this.keyDownHandler = this.handleKeyDown.bind(this);
        this.setupEventListeners();
    }

    public static getInstance(): ShortcutManager {
        ShortcutManager.instance ??= new ShortcutManager();
        return ShortcutManager.instance;
    }

    // --- Lifecycle Management ---

    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        try {
            document.removeEventListener('keydown', this.keyDownHandler);
            const shortcutCount = this.shortcuts.size;
            this.shortcuts.clear();
            ShortcutManager.instance = null;
            logger.debug(`${ShortcutManager.TAG} destroyed. Cleaned up ${shortcutCount} shortcuts`);
        } catch (error) {
            logger.error(`${ShortcutManager.TAG} Error during destruction:`, error);
        }
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', this.keyDownHandler);
    }

    // --- Shortcut Registration & Management ---

    public register(id: string, config: ShortcutConfig, callback: ShortcutCallback): void {
        if (this.isDestroyed) {
            logger.warn(`${ShortcutManager.TAG} Cannot register shortcut: ShortcutManager is destroyed`);
            return;
        }

        if (!id || typeof callback !== 'function') {
            logger.error(`${ShortcutManager.TAG} Invalid shortcut registration: ID and callback are required`);
            return;
        }

        if (this.shortcuts.has(id)) {
            logger.warn(`${ShortcutManager.TAG} Shortcut with ID '${id}' already exists, overriding`);
        }

        this.shortcuts.set(id, { config, callback });
    }

    public unregister(id: string): void {
        if (this.isDestroyed) {
            logger.warn(`${ShortcutManager.TAG} Cannot unregister shortcut: ShortcutManager is destroyed`);
            return;
        }

        if (!this.shortcuts.delete(id)) {
            logger.warn(`${ShortcutManager.TAG} Shortcut with ID '${id}' not found`);
        }
    }

    public clearAll(): void {
        if (this.isDestroyed) {
            logger.warn(`${ShortcutManager.TAG} Cannot clear shortcuts: ShortcutManager is destroyed`);
            return;
        }
        this.shortcuts.clear();
    }

    // --- Query Methods ---

    public getShortcutCount(): number {
        return this.isDestroyed ? 0 : this.shortcuts.size;
    }

    public hasShortcut(id: string): boolean {
        return !this.isDestroyed && this.shortcuts.has(id);
    }

    // --- Event Handling ---

    /** Handles keydown events and triggers the appropriate shortcut callbacks. */
    private handleKeyDown(event: KeyboardEvent): void {
        if (this.isDestroyed) return;

        for (const [id, { config, callback }] of this.shortcuts) {
            if (this.matchesShortcut(event, config)) {
                event.preventDefault();
                event.stopPropagation();
                try {
                    callback(event);
                } catch (error) {
                    logger.error(`${ShortcutManager.TAG} Error in shortcut callback for ${id}:`, error);
                }
                break;
            }
        }
    }

    /** Checks if the given keyboard event matches the shortcut configuration. */
    private matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
        return (
            event.ctrlKey === config.ctrlKey &&
            event.shiftKey === config.shiftKey &&
            event.altKey === config.altKey &&
            event.metaKey === config.metaKey &&
            (event.key === config.key || event.key.toLowerCase() === config.key.toLowerCase())
        );
    }
}
