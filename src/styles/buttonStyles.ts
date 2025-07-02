import {
    CLASS_BUTTON_CONTAINER,
    CLASS_BUTTON_BASE,
    CLASS_BUTTON_PRIMARY,
    CLASS_BUTTON_SECONDARY,
    CLASS_BUTTON_CLICKED,
    CLASS_BUTTON_ICON,
    CLASS_BUTTON_LABEL,
} from '@/utils/values/ids';

/**
 * Provides default button CSS styles as a string.
 * Styles are scoped to button classnames for isolation.
 */
export class ButtonStyles {
    static get defaultButtonStyle(): string {
        return `
            .${CLASS_BUTTON_CONTAINER} {
                display: inline-block;
            }
            .${CLASS_BUTTON_BASE} {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                border-radius: 8px;
                font: inherit;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
                border: none;
            }
            .${CLASS_BUTTON_BASE}:focus {
                outline: 2px solid rgba(59, 130, 246, 0.5);
                outline-offset: 1px;
            }
            .${CLASS_BUTTON_PRIMARY} {
                background: #3b82f6;
                color: white;
            }
            .${CLASS_BUTTON_PRIMARY}:hover {
                background: #2563eb;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
            }
            .${CLASS_BUTTON_PRIMARY}:active {
                transform: translateY(0);
            }
            .${CLASS_BUTTON_SECONDARY}:hover {
                transform: translateY(-1px);
            }
            .${CLASS_BUTTON_SECONDARY}:active {
                transform: translateY(0);
            }
            .${CLASS_BUTTON_CLICKED} {
                transform: scale(0.95);
            }
            .${CLASS_BUTTON_ICON} {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .${CLASS_BUTTON_LABEL} {
                display: inline-block;
            }
        `;
    }
}
