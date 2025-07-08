import type { InlineToolbarPosition } from '@/utils/values/types';

export class ToolbarPositioningUtil {
    private static readonly GAP = 5;
    private static readonly MARGIN = 10;

    // --- Public API ---

    /** Calculates the optimal position for the context toolbar. */
    public static calculatePosition(toolbarRect: DOMRect, selectionRect: DOMRect): InlineToolbarPosition {
        const viewport = this.getViewportInfo();
        const x = this.calculateHorizontalPosition(toolbarRect, selectionRect, viewport);
        const y = this.calculateVerticalPosition(toolbarRect, selectionRect, viewport);

        return {
            x: x + viewport.scrollX,
            y: y + viewport.scrollY,
        };
    }

    // --- Viewport Helpers ---

    private static getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.pageXOffset || document.documentElement.scrollLeft,
            scrollY: window.pageYOffset || document.documentElement.scrollTop,
        };
    }

    // --- Horizontal Positioning ---

    private static calculateHorizontalPosition(
        toolbarRect: DOMRect,
        selectionRect: DOMRect,
        viewport: { width: number; scrollX: number },
    ): number {
        const centeredX = selectionRect.left + selectionRect.width / 2 - toolbarRect.width / 2;
        return Math.max(this.MARGIN, Math.min(viewport.width - toolbarRect.width - this.MARGIN, centeredX));
    }

    // --- Vertical Positioning ---

    private static calculateVerticalPosition(
        toolbarRect: DOMRect,
        selectionRect: DOMRect,
        viewport: { height: number; scrollY: number },
    ): number {
        const abovePosition = selectionRect.top - toolbarRect.height - this.GAP;
        const belowPosition = selectionRect.bottom + this.GAP;

        if (this.canFitAbove(abovePosition)) return abovePosition;
        if (this.canFitBelow(belowPosition, toolbarRect.height, viewport.height)) return belowPosition;

        return this.getBestFitPosition(selectionRect, abovePosition, belowPosition, viewport.height);
    }

    private static canFitAbove(abovePosition: number): boolean {
        return abovePosition >= 0;
    }

    private static canFitBelow(belowPosition: number, toolbarHeight: number, viewportHeight: number): boolean {
        return belowPosition + toolbarHeight <= viewportHeight;
    }

    /** Chooses the best fit position if the toolbar can't fully fit above or below. */
    private static getBestFitPosition(
        selectionRect: DOMRect,
        abovePosition: number,
        belowPosition: number,
        viewportHeight: number,
    ): number {
        const spaceAbove = selectionRect.top;
        const spaceBelow = viewportHeight - selectionRect.bottom;
        return spaceAbove > spaceBelow ? abovePosition : belowPosition;
    }
}
