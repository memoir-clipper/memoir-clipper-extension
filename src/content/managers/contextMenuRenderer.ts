import type { TextModel } from '@/models/textModel';
import {
    CLASS_CONTEXT_MENU,
    CLASS_CONTEXT_MENU_ITEM,
    CLASS_CONTEXT_MENU_VISIBLE,
    ID_STYLE_CONTEXT_MENU,
} from '@/utils/ids';
import { MENU_CONFIG } from '@/utils/constants';

interface MenuItem {
    readonly text: string;
    readonly action: string;
}

/**
 * Minimal context menu renderer with flexible styling for future UI development.
 * Uses placeholder content until final design is implemented.
 */
export class ContextMenuRenderer {
    private static stylesInjected = false;

    // Minimal placeholder - will be configurable when UI is finalized
    private static readonly PLACEHOLDER_ITEM: MenuItem = {
        text: 'Save',
        action: 'placeholder-action',
    };

    constructor() {
        this.ensureStyles();
    }

    /** Creates basic menu with placeholder content. */
    public createMenu(_textModel: TextModel): HTMLElement {
        const menu = this.createElement('div', CLASS_CONTEXT_MENU);
        menu.appendChild(this.createMenuItem(ContextMenuRenderer.PLACEHOLDER_ITEM));
        return menu;
    }

    /** Creates menu with interaction handling. */
    public createMenuWithInteractions(textModel: TextModel, onAction: (action: string) => void): HTMLElement {
        const menu = this.createMenu(textModel);

        menu.addEventListener('click', event => {
            const target = event.target as HTMLElement;
            const action = target.dataset.action;

            if (action && target.matches(`.${CLASS_CONTEXT_MENU_ITEM}`)) {
                event.preventDefault();
                event.stopPropagation();
                onAction(action);
            }
        });

        return menu;
    }

    /** Hides menu with animation. */
    public hideMenu(menuElement: HTMLElement, onComplete: () => void): void {
        menuElement.classList.remove(CLASS_CONTEXT_MENU_VISIBLE);

        setTimeout(() => {
            try {
                if (menuElement.parentNode) {
                    menuElement.remove();
                }
            } catch (error) {
                console.warn('Error removing menu:', error);
            } finally {
                onComplete();
            }
        }, MENU_CONFIG.ANIMATION.DURATION_MS);
    }

    /** Removes all menu instances. */
    public cleanup(): void {
        document.querySelectorAll(`.${CLASS_CONTEXT_MENU}`).forEach(menu => {
            try {
                menu.remove();
            } catch (error) {
                console.warn('Error cleaning up menu:', error);
            }
        });
    }

    /** Creates DOM element with class. */
    private createElement(tag: string, className: string): HTMLElement {
        const element = document.createElement(tag);
        element.className = className;
        return element;
    }

    /** Creates menu item button. */
    private createMenuItem(item: MenuItem): HTMLElement {
        const button = this.createElement('button', CLASS_CONTEXT_MENU_ITEM) as HTMLButtonElement;
        button.textContent = item.text;
        button.dataset.action = item.action;
        button.type = 'button';
        return button;
    }

    /** Injects minimal base styles - easily customizable. */
    private ensureStyles(): void {
        if (ContextMenuRenderer.stylesInjected || document.getElementById(ID_STYLE_CONTEXT_MENU)) {
            return;
        }

        const styleSheet = document.createElement('style');
        styleSheet.id = ID_STYLE_CONTEXT_MENU;
        styleSheet.textContent = this.getBaseStyles();

        document.head.appendChild(styleSheet);
        ContextMenuRenderer.stylesInjected = true;
    }

    /** Returns minimal base styles - designed for easy modification. */
    private getBaseStyles(): string {
        return `
            .${CLASS_CONTEXT_MENU} {
                position: absolute;
                z-index: 999999;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 4px 0;
                min-width: 120px;
                font-family: system-ui, sans-serif;
                font-size: 14px;
                opacity: 0;
                transform: scale(0.95);
                transition: all ${MENU_CONFIG.ANIMATION.DURATION_MS}ms ease;
                pointer-events: none;
            }

            .${CLASS_CONTEXT_MENU}.${CLASS_CONTEXT_MENU_VISIBLE} {
                opacity: 1;
                transform: scale(1);
                pointer-events: auto;
            }

            .${CLASS_CONTEXT_MENU_ITEM} {
                display: block;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                color: #333;
                font: inherit;
                transition: background-color 0.15s ease;
            }

            .${CLASS_CONTEXT_MENU_ITEM}:hover {
                background-color: #f0f0f0;
            }

            .${CLASS_CONTEXT_MENU_ITEM}:focus {
                outline: none;
                background-color: #e0e0e0;
            }
        `;
    }
}
