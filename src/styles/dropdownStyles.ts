import {
    CLASS_DROPDOWN_ARROW,
    CLASS_DROPDOWN_BUTTON,
    CLASS_DROPDOWN_CHECKBOX,
    CLASS_DROPDOWN_CONTAINER,
    CLASS_DROPDOWN_EMPTY,
    CLASS_DROPDOWN_LABEL,
    CLASS_DROPDOWN_MENU,
    CLASS_DROPDOWN_OPEN,
    CLASS_DROPDOWN_OPTION,
    CLASS_DROPDOWN_OPTION_CONTENT,
    CLASS_DROPDOWN_OPTION_DESCRIPTION,
    CLASS_DROPDOWN_OPTION_LABEL,
    CLASS_DROPDOWN_OPTION_SELECTED,
    CLASS_DROPDOWN_SEARCH,
    CLASS_DROPDOWN_SEARCH_INPUT,
    CLASS_DROPDOWN_SELECTION,
} from '@/utils/values/ids';

/**
 * Provides default dropdown CSS styles as a string.
 * Styles are scoped to dropdown classnames for isolation.
 */
export class DropdownStyles {
    static get defaultDropdownStyle(): string {
        return `
            .${CLASS_DROPDOWN_CONTAINER} {
                position: relative;
                display: inline-block;
            }
            .${CLASS_DROPDOWN_BUTTON} {
                display: flex;
                align-items: center;
                gap: 6px;
                border: 1px solid;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.15s ease;
                font: inherit;
                min-width: 120px;
            }
            .${CLASS_DROPDOWN_BUTTON}:focus {
                outline: 2px solid rgba(59, 130, 246, 0.5);
                outline-offset: 1px;
            }
            .${CLASS_DROPDOWN_BUTTON}--open {
                border-color: #3b82f6;
            }
            .${CLASS_DROPDOWN_LABEL} {
                color: #6b7280;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-right: 4px;
            }
            .${CLASS_DROPDOWN_SELECTION} {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .${CLASS_DROPDOWN_ARROW} {
                font-size: 10px;
                color: #6b7280;
                transition: transform 0.15s ease;
            }
            .${CLASS_DROPDOWN_OPEN} .${CLASS_DROPDOWN_ARROW} {
                transform: rotate(180deg);
            }
            .${CLASS_DROPDOWN_MENU} {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: 4px;
                min-width: 100%;
                max-height: 0;
                overflow: hidden;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
                opacity: 0;
                transform: translateY(-8px);
                transition: all 0.2s ease;
                pointer-events: none;
                z-index: 1000;
                border: 1px solid;
            }
            .${CLASS_DROPDOWN_OPEN} .${CLASS_DROPDOWN_MENU} {
                max-height: 300px;
                overflow-y: auto;
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }
            .${CLASS_DROPDOWN_SEARCH} {
                padding: 8px;
                border-bottom: 1px solid #f3f4f6;
            }
            .${CLASS_DROPDOWN_SEARCH_INPUT} {
                width: 100%;
                padding: 6px 8px;
                border: 1px solid;
                border-radius: 4px;
                font: inherit;
                font-size: 13px;
            }
            .${CLASS_DROPDOWN_SEARCH_INPUT}:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
            }
            .${CLASS_DROPDOWN_OPTION} {
                padding: 8px 12px;
                cursor: pointer;
                transition: background 0.1s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .${CLASS_DROPDOWN_CHECKBOX} {
                width: 16px;
                height: 16px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                position: relative;
                flex-shrink: 0;
            }
            .${CLASS_DROPDOWN_OPTION_SELECTED} .${CLASS_DROPDOWN_CHECKBOX} {
                background: #3b82f6;
                border-color: #3b82f6;
            }
            .${CLASS_DROPDOWN_OPTION_SELECTED} .${CLASS_DROPDOWN_CHECKBOX}::after {
                content: "";
                position: absolute;
                top: 2px;
                left: 5px;
                width: 4px;
                height: 8px;
                border-right: 2px solid white;
                border-bottom: 2px solid white;
                transform: rotate(45deg);
            }
            .${CLASS_DROPDOWN_OPTION_CONTENT} {
                flex: 1;
                min-width: 0;
            }
            .${CLASS_DROPDOWN_OPTION_LABEL} {
                font-weight: 500;
            }
            .${CLASS_DROPDOWN_OPTION_DESCRIPTION} {
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
            }
            .${CLASS_DROPDOWN_EMPTY} {
                padding: 16px;
                text-align: center;
                color: #6b7280;
                font-style: italic;
            }
            
            /* Toolbar-specific dropdown styles */
            .${CLASS_DROPDOWN_SELECTION}--tags-selected {
                color: #3b82f6;
                font-weight: 500;
            }
            
            .dropdown-color-indicator {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
                flex-shrink: 0;
            }
            
            .dropdown-color-indicator--large {
                width: 16px;
                height: 16px;
                border: 1px solid rgba(0, 0, 0, 0.1);
                margin-right: 6px;
            }
            
            .dropdown-option-flex {
                display: flex;
                align-items: center;
                width: 100%;
                flex: 1;
            }
            
            .dropdown-option-label {
                flex: 1;
            }
        `;
    }
}
