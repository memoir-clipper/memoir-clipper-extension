import { TEXT_SELECTION_EXCLUSIONS } from './htmlTags';

export function getValidSelection(): Selection | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE ? (container as Element) : container.parentElement;

    if (!element) return null;

    // Check for excluded elements
    if (TEXT_SELECTION_EXCLUSIONS.some(selector => element.closest(selector))) {
        return null;
    }

    return selection;
}
