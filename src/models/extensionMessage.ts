export class ExtensionMessage<T = unknown> {
    public readonly action: string;
    public readonly data?: T;
    public readonly requestId: string;
    public readonly timestamp: number;

    /**
     * Create a new ExtensionMessage.
     */
    constructor(action: string, data?: T, requestId?: string) {
        this.action = action;
        this.data = data;
        this.requestId = requestId ?? crypto.randomUUID();
        this.timestamp = Date.now();
    }

    // --- Static Factory Methods ---

    static create<T>(action: string, data?: T): ExtensionMessage<T> {
        return new ExtensionMessage(action, data);
    }

    static withId<T>(action: string, data: T, requestId: string): ExtensionMessage<T> {
        return new ExtensionMessage(action, data, requestId);
    }

    /**
     * Converts the message to a JSON object.
     */
    toJSON(): Record<string, unknown> {
        return {
            action: this.action,
            data: this.data,
            requestId: this.requestId,
            timestamp: this.timestamp,
        };
    }

    /**
     * Converts the message to a string representation.
     */
    toString(): string {
        return `ExtensionMessage[${this.action}]${this.requestId ? `(${this.requestId})` : ''}`;
    }
}
