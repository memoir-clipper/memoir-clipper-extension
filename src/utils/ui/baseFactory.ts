import { EventManager } from '@/models/eventManager';
import { TAGS } from '../values/htmlTags';
import { logger } from '@/utils/helpers/logger';

// --- BaseFactory: Style Management ---

export abstract class BaseFactory {
    protected static stylesInjected = new Map<string, boolean>();

    /**
     * Injects a style block with the given ID only once.
     */
    protected static ensureStyles(styleId: string, styles: string): void {
        if (this.stylesInjected.get(styleId)) return;

        const styleSheet = document.createElement(TAGS.STYLE);
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        this.stylesInjected.set(styleId, true);

        logger.debug('BaseFactory: Styles injected', styleId);
    }

    /**
     * Returns the style string for a given variant, or the default if not found.
     */
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
    protected container!: HTMLElement;

    /** Returns the root element for this instance. */
    public abstract getElement(): HTMLElement;

    /**
     * Cleans up event listeners and removes the root element from the DOM.
     */
    public cleanup(): void {
        this.eventManager.cleanup();
        if (this.container) {
            this.container.remove();
        }
    }
}
