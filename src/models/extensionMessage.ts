export class ExtensionMessage<T = unknown> {
    public readonly action: string;
    public readonly data?: T;
    public readonly requestId?: string;
    public readonly timestamp: number;

    constructor(action: string, data?: T, requestId?: string) {
        this.action = action;
        this.data = data;
        this.requestId = requestId ?? crypto.randomUUID();
        this.timestamp = Date.now();
    }

    static create<T>(action: string, data?: T): ExtensionMessage<T> {
        return new ExtensionMessage(action, data);
    }

    static withId<T>(action: string, data: T, requestId: string): ExtensionMessage<T> {
        return new ExtensionMessage(action, data, requestId);
    }

    toJSON() {
        return {
            action: this.action,
            data: this.data,
            requestId: this.requestId,
            timestamp: this.timestamp,
        };
    }

    toString(): string {
        return `ExtensionMessage[${this.action}]${this.requestId ? `(${this.requestId})` : ''}`;
    }
}
