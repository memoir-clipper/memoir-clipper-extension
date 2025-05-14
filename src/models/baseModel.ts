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

    constructor() {
        this.id = this.generateUniqueId();
        this.timestamp = new Date().toISOString();
    }

    private generateUniqueId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    toJSON(): Record<string, any> {
        return { ...this };
    }
}
