import type { MenuPosition } from '@/utils/types';

/**
 * Calculates the optimal position for a context menu based on the selection rectangle and viewport dimensions.
 * The menu will be positioned either above or below the selection, ensuring it fits within the viewport.
 * If neither position is suitable, it will be centered horizontally and placed in the best available vertical space.
 */
export class MenuPositionCalculator {
    private static readonly GAP = 5;
    private static readonly MARGIN = 10;

    /**
     * Calculates the optimal position for the context menu.
     */
    public static calculatePosition(menuRect: DOMRect, selectionRect: DOMRect): MenuPosition {
        const viewport = this.getViewportInfo();

        const x = this.calculateHorizontalPosition(menuRect, selectionRect, viewport);
        const y = this.calculateVerticalPosition(menuRect, selectionRect, viewport);

        return {
            x: x + viewport.scrollX,
            y: y + viewport.scrollY,
        };
    }

    /**
     * Retrieves the current viewport dimensions and scroll positions.
     */
    private static getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.pageXOffset || document.documentElement.scrollLeft,
            scrollY: window.pageYOffset || document.documentElement.scrollTop,
        };
    }

    /**
     * Calculates the horizontal position for the menu, centering it relative to the selection.
     */
    private static calculateHorizontalPosition(
        menuRect: DOMRect,
        selectionRect: DOMRect,
        viewport: ReturnType<typeof this.getViewportInfo>,
    ) {
        const centeredX = selectionRect.left + selectionRect.width / 2 - menuRect.width / 2;
        return Math.max(this.MARGIN, Math.min(viewport.width - menuRect.width - this.MARGIN, centeredX));
    }

    /**
     * Calculates the vertical position for the menu, determining whether to place it above or below the selection.
     */
    private static calculateVerticalPosition(
        menuRect: DOMRect,
        selectionRect: DOMRect,
        viewport: ReturnType<typeof this.getViewportInfo>,
    ) {
        const abovePosition = selectionRect.top - menuRect.height - this.GAP;
        const belowPosition = selectionRect.bottom + this.GAP;

        if (this.canFitAbove(abovePosition)) {
            return abovePosition;
        }

        if (this.canFitBelow(belowPosition, menuRect.height, viewport.height)) {
            return belowPosition;
        }

        return this.getBestFitPosition(selectionRect, abovePosition, belowPosition, viewport.height);
    }

    /**
     * Checks if the menu can fit above the selection.
     */
    private static canFitAbove(abovePosition: number): boolean {
        return abovePosition >= 0;
    }

    /**
     * Checks if the menu can fit below the selection, considering the viewport height.
     */
    private static canFitBelow(belowPosition: number, menuHeight: number, viewportHeight: number): boolean {
        return belowPosition + menuHeight <= viewportHeight;
    }

    /**
     * Determines the best fit position for the menu based on available space above and below the selection.
     */
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
