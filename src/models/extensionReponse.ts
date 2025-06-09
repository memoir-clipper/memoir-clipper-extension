export class ExtensionResponse<T = unknown> {
    public readonly success: boolean;
    public readonly data?: T;
    public readonly error?: string;
    public readonly requestId?: string;
    public readonly timestamp: number;

    constructor(success: boolean, data?: T, error?: string, requestId?: string) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.requestId = requestId;
        this.timestamp = Date.now();
    }

    static success<T>(data: T, requestId?: string): ExtensionResponse<T> {
        return new ExtensionResponse(true, data, undefined, requestId);
    }

    static error<T = never>(error: string, requestId?: string): ExtensionResponse<T> {
        return new ExtensionResponse(false, undefined, error, requestId) as ExtensionResponse<T>;
    }

    static fromMessage<T>(message: { requestId?: string }, data?: T, error?: string): ExtensionResponse<T> {
        return new ExtensionResponse(!error, data, error, message.requestId);
    }

    isSuccess(): this is ExtensionResponse<T> & { success: true; data: T } {
        return this.success && this.data !== undefined;
    }

    isError(): this is ExtensionResponse<T> & { success: false; error: string } {
        return !this.success;
    }

    toJSON() {
        return {
            success: this.success,
            data: this.data,
            error: this.error,
            requestId: this.requestId,
            timestamp: this.timestamp,
        };
    }

    toString(): string {
        return `ExtensionResponse[${this.success ? 'SUCCESS' : 'ERROR'}]${this.requestId ? `(${this.requestId})` : ''}`;
    }
}
