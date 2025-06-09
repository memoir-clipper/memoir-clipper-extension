/**
 * Utility class for managing event listeners with automatic cleanup
 */
export class EventManager {
    private cleanupFunctions: Array<() => void> = [];

    /**
     * Add an event listener and track it for cleanup
     */
    public addEventHandler(
        target: EventTarget,
        event: string,
        handler: EventListener,
        options?: AddEventListenerOptions,
    ): void {
        target.addEventListener(event, handler, options);
        this.cleanupFunctions.push(() => target.removeEventListener(event, handler, options));
    }

    /**
     * Add multiple event handlers at once
     */
    public addEventHandlers(
        handlers: Array<{
            target: EventTarget;
            event: string;
            handler: EventListener;
            options?: AddEventListenerOptions;
        }>,
    ): void {
        handlers.forEach(({ target, event, handler, options }) => {
            this.addEventHandler(target, event, handler, options);
        });
    }

    /**
     * Remove all tracked event listeners
     */
    public cleanup(): void {
        this.cleanupFunctions.forEach(cleanup => {
            try {
                cleanup();
            } catch (error) {
                console.warn('Error during event cleanup:', error);
            }
        });
        this.cleanupFunctions.length = 0;
    }

    /**
     * Get the number of tracked event handlers
     */
    public getHandlerCount(): number {
        return this.cleanupFunctions.length;
    }
}
