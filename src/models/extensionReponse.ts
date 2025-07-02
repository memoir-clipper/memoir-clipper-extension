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

    // --- Static Factory Methods ---

    /** Create a successful response */
    public static success<T>(data: T, requestId?: string): ExtensionResponse<T> {
        return new ExtensionResponse(true, data, undefined, requestId);
    }

    /** Create an error response */
    public static error<T = never>(error: string, requestId?: string): ExtensionResponse<T> {
        return new ExtensionResponse(false, undefined as T, error, requestId);
    }

    /** Create a response from a message object */
    public static fromMessage<T>(message: { requestId?: string }, data?: T, error?: string): ExtensionResponse<T> {
        return new ExtensionResponse(!error, data, error, message.requestId);
    }

    // --- Type Guards ---

    /** Returns true if the response is successful and has data */
    public isSuccess(): this is ExtensionResponse<T> & { success: true; data: T } {
        return this.success && this.data !== undefined;
    }

    /** Returns true if the response is an error */
    public isError(): this is ExtensionResponse<T> & { success: false; error: string } {
        return !this.success;
    }

    // --- Serialization & Representation ---

    /** Serialize the response to a plain object */
    public toJSON(): Record<string, unknown> {
        return {
            success: this.success,
            data: this.data,
            error: this.error,
            requestId: this.requestId,
            timestamp: this.timestamp,
        };
    }

    /** String representation of the response */
    public toString(): string {
        return `ExtensionResponse[${this.success ? 'SUCCESS' : 'ERROR'}]${this.requestId ? `(${this.requestId})` : ''}`;
    }
}
