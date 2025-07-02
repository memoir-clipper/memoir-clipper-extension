import { TEXT_SELECTION_EXCLUSIONS } from '@/utils/values/htmlTags';

/**
 * Utility for validating and retrieving the current text selection.
 */
export class TextSelectionHelper {
    /**
     * Returns a valid text selection if it exists and is not within excluded elements.
     * @returns The current Selection object or null if invalid.
     */
    public static getValidSelection(): Selection | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return null;
        }

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element = container.nodeType === Node.ELEMENT_NODE ? (container as Element) : container.parentElement;

        if (!element) return null;

        // Exclude selections inside certain elements (inputs, buttons, etc.)
        for (const selector of TEXT_SELECTION_EXCLUSIONS) {
            if (element.closest(selector)) {
                return null;
            }
        }

        return selection;
    }
}

export function getValidSelection(): Selection | null {
    return TextSelectionHelper.getValidSelection();
}
