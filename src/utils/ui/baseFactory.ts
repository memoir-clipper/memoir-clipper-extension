import { EventManager } from '@/models/eventManager';
import { TAGS } from '../values/htmlTags';
import { logger } from '@/utils/helpers/logger';

// --- BaseFactory: Style Management ---

export abstract class BaseFactory {
    protected static stylesInjected = new Map<string, boolean>();

    /** Injects a style block with the given ID only once. */
    protected static ensureStyles(styleId: string, styles: string): void {
        if (this.stylesInjected.get(styleId)) return;

        const styleSheet = document.createElement(TAGS.STYLE);
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        this.stylesInjected.set(styleId, true);
    }

    /** Returns the style string for a given variant, or the default if not found. */
    protected static getStylesForVariant<V extends string>(
        variant: V,
        stylesMap: Record<V, string>,
        defaultStyle: string,
    ): string {
        return stylesMap[variant] ?? defaultStyle;
    }
}

// --- BaseInstance: Lifecycle & DOM ---

export abstract class BaseInstance {
    protected eventManager = new EventManager();
    protected container: HTMLElement | null = null;

    /** Returns the root element for this instance. */
    public abstract getElement(): HTMLElement | null;

    /** Cleans up event listeners and removes the root element from the DOM. */
    public cleanup(): void {
        try {
            // Remove element from DOM if it exists
            if (this.container?.parentNode) {
                this.container.remove();
            }

            // Cleanup event manager
            this.eventManager.cleanup();

            // Clear container reference
            this.container = null;
        } catch (error) {
            logger.warn('Error during cleanup:', error);
        }
    }
}
