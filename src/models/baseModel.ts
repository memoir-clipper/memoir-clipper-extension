import { ContentType } from '@/utils/enums';

/**
 * Abstract base class for model objects in the application.
 * Provides common functionality for all models including unique ID generation
 * and timestamp tracking.
 *
 * @abstract
 * @class BaseModel
 *
 * @property {string} id - Unique identifier for the model instance, automatically generated
 * @property {string} timestamp - ISO string representation of the creation time
 * @property {ContentType | undefined} type - Type of content represented by the model
 *
 * @example
 * class MyModel extends BaseModel {
 *   // Additional model properties and methods
 * }
 *
 * const model = new MyModel();
 * console.log(model.id); // Unique UUID v4-like identifier
 * console.log(model.timestamp); // ISO timestamp of creation
 */
export abstract class BaseModel {
    id: string;
    timestamp: string;
    type: ContentType | undefined;

    /**
     * Creates an instance of the BaseModel class.
     * Automatically generates a unique ID and sets the timestamp to the current time.
     */
    constructor() {
        this.id = this.generateUniqueId();
        this.timestamp = new Date().toISOString();
    }

    /**
     * Generates a unique identifier for the model instance.
     * The identifier is a UUID v4-like string.
     *
     * @returns {string} A unique identifier
     */
    private generateUniqueId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Converts the model instance to a JSON object.
     * This method can be overridden in subclasses to include additional properties.
     *
     * @returns {Record<string, any>} A JSON representation of the model instance
     */
    toJSON(): Record<string, any> {
        return { ...this };
    }
}
