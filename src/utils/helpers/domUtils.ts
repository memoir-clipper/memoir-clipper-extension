/**
 * Utility functions for DOM manipulation and querying.
 */
export const DOM_UTILS = {
    /**
     * Creates an HTML element with the specified tag and class name.
     * @param tag - The tag name of the element.
     * @param className - The class name(s) to assign.
     * @returns The created HTMLElement.
     */
    createElement: (tag: string, className: string): HTMLElement => {
        const element = document.createElement(tag);
        element.className = className;
        return element;
    },

    /**
     * Queries for a single element matching the selector within the parent.
     * @param parent - The parent element or document.
     * @param selector - The CSS selector.
     * @returns The first matching element or null.
     */
    querySelector: <T extends Element>(parent: Element | Document, selector: string): T | null => {
        return parent.querySelector(selector) as T | null;
    },

    /**
     * Queries for all elements matching the selector within the parent.
     * @param parent - The parent element or document.
     * @param selector - The CSS selector.
     * @returns An array of matching elements.
     */
    querySelectorAll: <T extends Element>(parent: Element | Document, selector: string): T[] => {
        return Array.from(parent.querySelectorAll(selector)) as T[];
    },

    /**
     * Combines class names, filtering out falsy values.
     * @param classes - List of class names or falsy values.
     * @returns A space-separated string of valid class names.
     */
    combineClasses: (...classes: (string | false | undefined)[]): string => {
        return classes.filter(Boolean).join(' ');
    },
};
