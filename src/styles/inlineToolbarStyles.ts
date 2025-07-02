import { CLASS_INLINE_TOOLBAR, CLASS_INLINE_TOOLBAR_VISIBLE, CLASS_INLINE_TOOLBAR_SHORTCUT } from '@/utils/values/ids';

/**
 * Provides default inline toolbar CSS styles as a string.
 * Styles are scoped to toolbar classnames for isolation.
 */
export class InlineToolbarStyles {
    static get defaultToolbarStyle(): string {
        return `
            .${CLASS_INLINE_TOOLBAR} {
                position: absolute;
                z-index: 999999;
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 8px;
                backdrop-filter: blur(10px);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
                padding: 8px 12px;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                transform-origin: top center;
                animation: memoir-menu-enter 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            @keyframes memoir-menu-enter {
                from { opacity: 0; transform: translateY(-4px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .${CLASS_INLINE_TOOLBAR}.${CLASS_INLINE_TOOLBAR_VISIBLE} {
                opacity: 1;
                transform: scale(1);
                pointer-events: auto;
            }
            .${CLASS_INLINE_TOOLBAR_SHORTCUT} {
                padding: 2px 5px;
                border-radius: 4px;
                font-size: 11px;
                font-family: 'SFMono-Regular', Consolas, monospace;
            }
        `;
    }
}
