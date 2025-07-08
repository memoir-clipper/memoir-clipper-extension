/**
 * Configuration for a dropdown menu.
 */
export interface DropdownConfig {
    label?: string;
    placeholder?: string;
    tooltip?: string;
    multiSelect?: boolean;
    closeOnSelect?: boolean;
    allowCustom?: boolean;
    searchable?: boolean;
    customInputPlaceholder?: string;
    keyboardShortcuts?: Record<string, string>; // key -> optionId
    buttonTemplateCallback?: (config: DropdownConfig, selection: DropdownSelection) => string;
    onSelect?: (selection: DropdownSelection) => void;
    onCustomCreate?: (value: string) => DropdownOption | null;
}

/**
 * Represents a single option in a dropdown menu.
 */
export interface DropdownOption {
    id: string;
    label: string;
    description?: string;
    additionalData?: unknown;
    render?: (option: DropdownOption) => string;
}

/**
 * Represents the current selection state of a dropdown.
 */
export interface DropdownSelection {
    single?: DropdownOption;
    multiple?: DropdownOption[];
    isEmpty: boolean;
    count: number;
}

/**
 * Configuration for a button in the UI.
 */
export interface ButtonConfig {
    label: string;
    primary?: boolean;
    tooltip?: string;
    icon?: string;
    onClick?: () => void;
}

/**
 * Configuration for a toggle switch in the UI.
 */
export interface ToggleConfig {
    label: string;
    initialState?: boolean;
    tooltip?: string;
    shortcutKey?: string;
    shortcutModifier?: string;
    onChange?: (state: boolean) => void;
}

/**
 * Configuration for the inline toolbar, exposing only essential callbacks.
 */
export interface InlineToolbarConfig {
    onSave?: (data: ToolbarSelectedData) => void;
    onClose?: () => void;
    onCopy?: (data: string) => void;
}

/**
 * Data collected from user interactions with the toolbar.
 */
export type ToolbarSelectedData = {
    spaceId?: string;
    colorId?: string;
    tags: string[];
    aiActionId?: string;
    preserveFormatting: boolean;
};

/**
 * Supported variants for dropdown, toggle, and button components.
 */
export type DropdownVariant = 'default';
export type ToggleVariant = 'default';
export type ButtonVariant = 'default';
