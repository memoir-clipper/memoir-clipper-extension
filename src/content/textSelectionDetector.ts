import { getFaviconUrl } from '@/utils/getFavicon';
import { TextModel } from '@/models/textModel';
import { TEXT_SELECTION_EXCLUSIONS } from '@/utils/htmlTags';
import { captureFormattedSelection } from './selectionHtmlBuilders';

/**
 * Sets up event listeners to detect text selections made by the user via mouse or keyboard,
 * and triggers a callback when a valid selection is made.
 *
 * @param callback - Function called when a valid text selection is detected
 *
 * @remarks
 * - Adds event listeners for 'mouseup' and 'keyup' events
 * - Ignores empty selections and those within excluded elements (TEXT_SELECTION_EXCLUSIONS)
 * - Adds a small delay (10ms) before processing selections
 * - For keyboard selections, only detects those made using Shift+Arrow keys
 * - Position coordinates include scroll offsets and the y-coordinate is offset slightly above the selection
 */
export function detectTextSelection(callback: (model: TextModel, position: { x: number; y: number }, selectionRect: DOMRect) => void): void {
    const POSITION_OFFSET_Y = 5;
    const SELECTION_DELAY_MS = 10;

    // Helper function to process selection and avoid code duplication
    const processSelection = () => {
        setTimeout(() => {
            const selection = window.getSelection();

            if (!selection || selection.isCollapsed || !selection.toString().trim()) {
                return;
            }

            const anchorNode = selection.anchorNode;
            if (!anchorNode?.parentElement) {
                return;
            }

            const closestExcluded = anchorNode.parentElement.closest(TEXT_SELECTION_EXCLUSIONS);
            if (closestExcluded) {
                return;
            }

            const range = selection.getRangeAt(0);
            const selectionRect = range.getBoundingClientRect();

            if (selectionRect.width === 0 && selectionRect.height === 0) {
                return;
            }

            const selectedText = selection.toString().trim();
            const formattedContent = captureFormattedSelection(range);

            const position = {
                x: selectionRect.left + selectionRect.width / 2 + window.scrollX,
                y: selectionRect.top - POSITION_OFFSET_Y + window.scrollY,
            };

            const tabInfo = {
                url: window.location.href,
                title: document.title,
                favIconUrl: getFaviconUrl(),
            };

            const textModel = new TextModel(selectedText, formattedContent, tabInfo as chrome.tabs.Tab);
            callback(textModel, position, selectionRect);
        }, SELECTION_DELAY_MS);
    };

    // Detect mouse selections
    document.addEventListener('mouseup', processSelection);

    // Detect keyboard selections (Shift+Arrow keys)
    document.addEventListener('keyup', event => {
        if (event.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            processSelection();
        }
    });
}
