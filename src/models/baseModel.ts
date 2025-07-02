import type { ContentType } from '@/utils/values/enums';

/**
 * Base class for all model objects with automatic ID generation and timestamps.
 * Provides common functionality for serialization and unique identification.
 */
export abstract class BaseModel {
    id: string;
    timestamp: string;
    type: ContentType | undefined;

    constructor() {
        this.id = this.generateUniqueId();
        this.timestamp = new Date().toISOString();
    }

    /** Generates UUID v4-like unique identifier. */
    private generateUniqueId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /** Converts model to JSON object - override to include additional properties. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON(): Record<string, any> {
        return { ...this };
    }
}
