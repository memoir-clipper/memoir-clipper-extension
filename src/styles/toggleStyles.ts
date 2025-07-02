import {
    CLASS_TOGGLE_CONTAINER,
    CLASS_TOGGLE_BUTTON,
    CLASS_TOGGLE_LABEL,
    CLASS_TOGGLE_TRACK,
    CLASS_TOGGLE_THUMB,
    CLASS_TOGGLE_ACTIVE,
    CLASS_TOGGLE_SHORTCUT,
} from '@/utils/values/ids';

/**
 * Provides default toggle CSS styles as a string.
 * Styles are scoped to toggle classnames for isolation.
 */
export class ToggleStyles {
    static get defaultToggleStyle(): string {
        return `
            .${CLASS_TOGGLE_CONTAINER} {
                display: inline-block;
            }
            .${CLASS_TOGGLE_BUTTON} {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border: 1px solid;
                border-radius: 8px;
                cursor: pointer;
                font: inherit;
                transition: all 0.15s ease;
            }
            .${CLASS_TOGGLE_BUTTON}:focus {
                outline: 2px solid rgba(59, 130, 246, 0.5);
                outline-offset: 1px;
            }
            .${CLASS_TOGGLE_LABEL} {
                font-size: 13px;
                white-space: nowrap;
            }
            .${CLASS_TOGGLE_TRACK} {
                position: relative;
                width: 36px;
                height: 20px;
                border-radius: 10px;
                transition: background 0.2s ease;
            }
            .${CLASS_TOGGLE_THUMB} {
                position: absolute;
                left: 2px;
                top: 2px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease;
            }
            .${CLASS_TOGGLE_ACTIVE} .${CLASS_TOGGLE_THUMB} {
                transform: translateX(16px);
            }
            .${CLASS_TOGGLE_SHORTCUT} {
                padding: 2px 5px;
                border-radius: 4px;
                font-size: 11px;
                font-family: 'SFMono-Regular', Consolas, monospace;
            }
        `;
    }
}
