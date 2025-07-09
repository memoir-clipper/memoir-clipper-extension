import { InlineToolbarStyles } from '@/styles/inlineToolbarStyles';
import { DOM_UTILS } from '../helpers/domUtils';
import { logger } from '../helpers/logger';
import {
    TOOLBAR_COLORS,
    TOOLBAR_AI_ACTIONS_OPTIONS,
    TOOLBAR_SPACES_DEFAULT_OPTIONS,
    TOOLBAR_TAGS_DEFAULT_OPTIONS,
} from '../values/constants';
import { KEYS, EVENTS } from '../values/enums';
import { ATTRS } from '../values/htmlAttributes';
import { TAGS } from '../values/htmlTags';
import {
    ID_STYLE_INLINE_TOOLBAR,
    CLASS_DROPDOWN_LABEL,
    CLASS_DROPDOWN_SELECTION,
    CLASS_DROPDOWN_ARROW,
    CLASS_INLINE_TOOLBAR_SHORTCUT,
    CLASS_INLINE_TOOLBAR_VISIBLE,
    CLASS_INLINE_TOOLBAR,
    CLASS_DROPDOWN_COLOR_INDICATOR,
    CLASS_DROPDOWN_COLOR_INDICATOR_LARGE,
    CLASS_DROPDOWN_OPTION_FLEX,
    CLASS_DROPDOWN_OPTION_LABEL_FLEX,
} from '../values/ids';
import { BaseFactory, BaseInstance } from './baseFactory';
import { ButtonFactory } from './buttonFactory';
import { DropdownFactory, type DropdownInstance } from './dropdownFactory';
import { ToggleFactory, type ToggleInstance } from './toggleFactory';
import type {
    InlineToolbarConfig,
    DropdownConfig,
    DropdownSelection,
    DropdownOption,
    ToolbarSelectedData,
} from './uiConfig';

// --- InlineToolbarFactory ---

export class InlineToolbarFactory extends BaseFactory {
    protected static readonly TAG = '[InlineToolbarFactory]';

    /** Creates an InlineToolbarInstance and ensures styles are applied. */
    public static create(config: InlineToolbarConfig = {}): InlineToolbarInstance {
        this.ensureStyles(ID_STYLE_INLINE_TOOLBAR, InlineToolbarStyles.defaultToolbarStyle);
        return new InlineToolbarInstance(config);
    }

    public static html = {
        tagsDropdownButton: (config: DropdownConfig, selection: DropdownSelection): string => {
            const count = selection.count;
            const displayText = count > 0 ? `${count} tag${count > 1 ? 's' : ''} selected` : config.placeholder;
            const selectionClass =
                count > 0
                    ? `${CLASS_DROPDOWN_SELECTION} ${CLASS_DROPDOWN_SELECTION}--tags-selected`
                    : CLASS_DROPDOWN_SELECTION;
            return `
                <span class="${CLASS_DROPDOWN_LABEL}">${config.label}</span>
                <span class="${selectionClass}">${displayText}</span>
                <span class="${CLASS_DROPDOWN_ARROW}">▼</span>
            `;
        },

        tagsDropdownOption: (option: DropdownOption) => {
            const color = (option.additionalData as { color: string }).color;
            return `
                <div class="${CLASS_DROPDOWN_OPTION_FLEX}">
                    <span class="${CLASS_DROPDOWN_COLOR_INDICATOR}" style="background-color: ${color};"></span>
                    <span class="${CLASS_DROPDOWN_OPTION_LABEL_FLEX}">${option.label}</span>
                </div>
            `;
        },

        colorDropdownOption: (option: DropdownOption) => {
            const { value, shortcut } = option.additionalData as { value: string; shortcut: string };
            return `
                <div class="${CLASS_DROPDOWN_OPTION_FLEX}">
                    <span class="${CLASS_DROPDOWN_COLOR_INDICATOR} ${CLASS_DROPDOWN_COLOR_INDICATOR_LARGE}" style="background-color: ${value};"></span>
                    <span class="${CLASS_DROPDOWN_OPTION_LABEL_FLEX}">${option.label}</span>
                    <kbd class="${CLASS_INLINE_TOOLBAR_SHORTCUT}">${shortcut}</kbd>
                </div>
            `;
        },

        colorsDropdownButton: (config: DropdownConfig, selection: DropdownSelection): string => {
            const selectedOption = selection.single;
            const colorValue =
                (selectedOption?.additionalData as { value: string; shortcut: string })?.value ?? '#gray';
            const colorName = selectedOption?.label ?? 'Select color';
            return `
                <span class="${CLASS_DROPDOWN_LABEL}">${config.label}</span>
                <span class="${CLASS_DROPDOWN_COLOR_INDICATOR} ${CLASS_DROPDOWN_COLOR_INDICATOR_LARGE}" style="background-color: ${colorValue};"></span>
                <span class="${CLASS_DROPDOWN_SELECTION}">${colorName}</span>
                <span class="${CLASS_DROPDOWN_ARROW}">▼</span>
            `;
        },

        copyIcon: `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
        </svg>`,
    };
}

// --- InlineToolbarInstance ---

export class InlineToolbarInstance extends BaseInstance {
    private static readonly TAG = '[InlineToolbarInstance]';

    private static readonly componentIds = {
        SPACES: 'dropdown-spaces',
        COLORS: 'dropdown-colors',
        TAGS: 'dropdown-tags',
        AI_ACTIONS: 'dropdown-ai-actions',
        FORMATTING: 'toggle-formatting',
        SAVE: 'button-save',
        COPY: 'button-copy',
    } as const;

    // --- Component State ---

    private componentMap = new Map<string, BaseInstance>();
    private focusOrder: string[] = [];
    private currentFocusIndex = 0;

    private selectedData: ToolbarSelectedData;
    private spaceOptions: DropdownOption[] = [];
    private tagOptions: DropdownOption[] = [];

    // --- Component Ids Getters ---

    private get spaceId() {
        return InlineToolbarInstance.componentIds.SPACES;
    }
    private get colorId() {
        return InlineToolbarInstance.componentIds.COLORS;
    }
    private get tagId() {
        return InlineToolbarInstance.componentIds.TAGS;
    }
    private get aiActionId() {
        return InlineToolbarInstance.componentIds.AI_ACTIONS;
    }
    private get formattingId() {
        return InlineToolbarInstance.componentIds.FORMATTING;
    }
    private get dropdownIds() {
        return [this.spaceId, this.colorId, this.tagId, this.aiActionId];
    }

    constructor(private config: InlineToolbarConfig) {
        super();
        this.initializeDefaultOptions();
        this.selectedData = this.getDefaultSelectedData();
        this.container = this.createToolbar();
        this.setupToolbarKeyboardNavigation();
    }

    override getElement(): HTMLElement | null {
        return this.container;
    }

    // --- Public API: Options Management ---

    /** Sets the available space options and updates the dropdown. */
    public setSpaceOptions(options: DropdownOption[]): void {
        this.spaceOptions = [...options];
        this.updateDropdownOptions(this.spaceId, this.spaceOptions);
        logger.debug(`${InlineToolbarInstance.TAG}: Updated space options`, { count: options.length });
    }

    /** Sets the available tag options and updates the dropdown. */
    public setTagOptions(options: DropdownOption[]): void {
        this.tagOptions = [...options];
        this.updateDropdownOptions(this.tagId, this.tagOptions);
        logger.debug(`${InlineToolbarInstance.TAG}: Updated tag options`, { count: options.length });
    }

    public getSpaceOptions(): DropdownOption[] {
        return [...this.spaceOptions];
    }

    public getTagOptions(): DropdownOption[] {
        return [...this.tagOptions];
    }

    /** Adds a new space option if it doesn't already exist. */
    public addSpaceOption(option: DropdownOption): void {
        if (this.spaceOptions.some(existing => existing.id === option.id)) return;
        this.spaceOptions.push(option);
        this.updateDropdownOptions(this.spaceId, this.spaceOptions);
        logger.debug(`${InlineToolbarInstance.TAG}: Added space option`, { id: option.id, label: option.label });
    }

    /** Adds a new tag option if it doesn't already exist. */
    public addTagOption(option: DropdownOption): void {
        if (this.tagOptions.some(existing => existing.id === option.id)) return;
        this.tagOptions.push(option);
        this.updateDropdownOptions(this.tagId, this.tagOptions);
        logger.debug(`${InlineToolbarInstance.TAG}: Added tag option`, { id: option.id, label: option.label });
    }

    /** Removes a space option and resets selection if needed. */
    public removeSpaceOption(optionId: string): void {
        this.spaceOptions = this.spaceOptions.filter(option => option.id !== optionId);
        this.updateDropdownOptions(this.spaceId, this.spaceOptions);

        if (this.selectedData.spaceId === optionId) {
            this.selectedData.spaceId = this.spaceOptions[0]?.id;
            this.resetDropdown(this.spaceId, this.selectedData.spaceId);
        }
        logger.debug(`${InlineToolbarInstance.TAG}: Removed space option`, { id: optionId });
    }

    /** Removes a tag option and updates selection if needed. */
    public removeTagOption(optionId: string): void {
        this.tagOptions = this.tagOptions.filter(option => option.id !== optionId);
        this.updateDropdownOptions(this.tagId, this.tagOptions);

        if (this.selectedData.tags.includes(optionId)) {
            this.selectedData.tags = this.selectedData.tags.filter(tagId => tagId !== optionId);
            this.resetDropdown(this.tagId, this.selectedData.tags);
        }
        logger.debug(`${InlineToolbarInstance.TAG}: Removed tag option`, { id: optionId });
    }

    /** Updates a space option by id. */
    public updateSpaceOption(optionId: string, updatedOption: DropdownOption): void {
        const index = this.spaceOptions.findIndex(option => option.id === optionId);
        if (index === -1) return;
        this.spaceOptions[index] = { ...updatedOption };
        this.updateDropdownOptions(this.spaceId, this.spaceOptions);
        logger.debug(`${InlineToolbarInstance.TAG}: Updated space option`, {
            id: optionId,
            label: updatedOption.label,
        });
    }

    /** Updates a tag option by id. */
    public updateTagOption(optionId: string, updatedOption: DropdownOption): void {
        const index = this.tagOptions.findIndex(option => option.id === optionId);
        if (index === -1) return;
        this.tagOptions[index] = { ...updatedOption };
        this.updateDropdownOptions(this.tagId, this.tagOptions);
        logger.debug(`${InlineToolbarInstance.TAG}: Updated tag option`, { id: optionId, label: updatedOption.label });
    }

    /** Resets all selection data to defaults and resets dropdowns/toggles. */
    public resetSelectionData(): void {
        this.selectedData = this.getDefaultSelectedData();
        const defaultSpaceId = this.spaceOptions[0]?.id ?? '';
        this.selectedData.spaceId = defaultSpaceId;
        this.resetDropdown(this.spaceId, defaultSpaceId);
        this.resetDropdown(this.colorId, 'blue');
        this.resetDropdown(this.tagId, []);
        this.resetDropdown(this.aiActionId, '');
        this.resetToggle(this.formattingId, true);
        logger.debug(`${InlineToolbarInstance.TAG}: Reset selection data`);
    }

    // --- Public API: Toolbar Visibility & State ---

    /** Shows the toolbar and resets selection. */
    public show(): void {
        if (!this.container?.parentNode) {
            logger.warn(`${InlineToolbarInstance.TAG}: Cannot show - element not in DOM`);
            return;
        }
        this.resetSelectionData();
        this.container.classList.add(CLASS_INLINE_TOOLBAR_VISIBLE);
        this.focus(0);
    }

    /** Hides the toolbar. */
    public hide(): void {
        this.container?.classList.remove(CLASS_INLINE_TOOLBAR_VISIBLE);
    }

    /** Returns true if any dropdown is open. */
    public hasOpenDropdowns(): boolean {
        return this.dropdownIds.some(id => {
            const component = this.componentMap.get(id);
            return (component as DropdownInstance)?.isOpened?.();
        });
    }

    /** Handles Escape key to close all open dropdowns. */
    public handleEscapeKey(): void {
        logger.debug(`${InlineToolbarInstance.TAG}: Escape key pressed: ONCE - closing all open dropdowns`);
        this.closeAllOpenDropdowns();
    }

    /** Cleans up all components and event handlers. */
    public cleanup(): void {
        this.componentMap.forEach(component => {
            if ('isOpened' in component && (component as DropdownInstance).isOpened?.()) {
                (component as DropdownInstance).close();
            }
            component.cleanup();
        });
        this.componentMap.clear();
        this.focusOrder = [];
        this.currentFocusIndex = 0;
        super.cleanup();
    }

    // --- Toolbar Construction ---

    /** Creates the toolbar container and registers all components. */
    private createToolbar(): HTMLElement {
        const toolbar = DOM_UTILS.createElement(TAGS.DIV, CLASS_INLINE_TOOLBAR);
        toolbar.setAttribute(ATTRS.ROLE, 'toolbar');
        toolbar.setAttribute(ATTRS.ARIA_LABEL, 'Inline text selection toolbar');
        this.getComponentEntries().forEach(({ id, instance }) => this.registerComponent(toolbar, id, instance));
        return toolbar;
    }

    /** Returns an array of all toolbar component entries. */
    private getComponentEntries(): { id: string; instance: BaseInstance | null }[] {
        return [
            this.createSpacesDropdown(),
            this.createColorDropdown(),
            this.createTagsDropdown(),
            this.createAIActionsDropdown(),
            this.createFormattingToggle(),
            this.createSaveButton(),
            this.createCopyButton(),
        ];
    }

    /** Registers a component in the toolbar and focus order. */
    private registerComponent(toolbar: HTMLElement, id: string, instance: BaseInstance | null): void {
        if (!instance) return;

        const element = instance.getElement();
        if (!element) return;
        this.componentMap.set(id, instance);
        this.focusOrder.push(id);
        toolbar.appendChild(element);

        this.setupMouseFocusSync(element, id);
    }

    /** Sets up comprehensive focus management for mouse and keyboard interactions. */
    private setupMouseFocusSync(element: HTMLElement, componentId: string): void {
        const focusableElement = element.querySelector(TAGS.BUTTON) as HTMLElement;
        if (!focusableElement) return;

        // FOCUS EVENT: Triggered by any focus source (mouse, keyboard, programmatic)
        this.eventManager.addEventHandler(focusableElement, 'focus', () => {
            this.handleFocusChange(componentId);
        });

        // MOUSEDOWN EVENT: Immediate mouse response
        this.eventManager.addEventHandler(focusableElement, 'mousedown', (e: Event) => {
            e.preventDefault();
            this.handleMouseInteraction(componentId, focusableElement);
        });

        // BLUR EVENT: Manage dropdown closing
        this.eventManager.addEventHandler(focusableElement, 'blur', (e: Event) => {
            this.handleBlurEvent(componentId, e as FocusEvent);
        });
    }

    /** Centralized focus change handler for all interaction types. */
    private handleFocusChange(componentId: string): void {
        const index = this.focusOrder.indexOf(componentId);
        if (index !== -1) {
            this.currentFocusIndex = index;
        }

        const component = this.componentMap.get(componentId);
        if (component && 'isOpened' in component) {
            this.closeOtherDropdowns(componentId);
        } else {
            this.closeAllOpenDropdowns();
        }
    }

    /** Handles mouse interaction with immediate visual feedback. */
    private handleMouseInteraction(componentId: string, focusableElement: HTMLElement): void {
        const index = this.focusOrder.indexOf(componentId);
        if (index !== -1) {
            this.currentFocusIndex = index;
        }

        const component = this.componentMap.get(componentId);
        if (component && 'isOpened' in component) {
            this.closeOtherDropdowns(componentId);

            requestAnimationFrame(() => {
                focusableElement.focus();
            });
        } else {
            this.closeAllOpenDropdowns();
            focusableElement.focus();
        }
    }

    /** Handles blur events to manage dropdown visibility. */
    private handleBlurEvent(componentId: string, event: FocusEvent): void {
        const component = this.componentMap.get(componentId);
        if (!(component && 'isOpened' in component)) return;

        const dropdown = component as DropdownInstance;
        if (!dropdown.isOpened?.()) return;

        const relatedTarget = event.relatedTarget as Element | null;

        // Don't close if focus is moving within the same dropdown
        if (relatedTarget && component.getElement()?.contains(relatedTarget)) {
            return;
        }

        // Don't close if focus is moving to another toolbar component
        if (relatedTarget && this.container?.contains(relatedTarget)) {
            return;
        }

        // Close dropdown when focus moves outside the component and toolbar
        setTimeout(() => {
            if (dropdown.isOpened?.() && !this.isComponentFocused(componentId)) {
                dropdown.close();
            }
        }, 0);
    }

    /** Checks if any element within a component currently has focus. */
    private isComponentFocused(componentId: string): boolean {
        const component = this.componentMap.get(componentId);
        const element = component?.getElement();
        const activeElement = document.activeElement;
        return !!(activeElement && element?.contains(activeElement));
    }

    // --- Component Creators ---

    /** Creates the spaces dropdown component. */
    private createSpacesDropdown(): { id: string; instance: BaseInstance | null } {
        const id = this.spaceId;
        const dropdown = DropdownFactory.create(this.spaceOptions, {
            label: 'Space',
            placeholder: 'Select space',
            tooltip: 'Select a space',
            closeOnSelect: true,
            allowCustom: true,
            customInputPlaceholder: 'Create new space...',
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.spaceId = selection.single?.id;
            },
            onCustomCreate: (spaceName: string) => {
                const newSpace: DropdownOption = {
                    id: this.generateId(spaceName),
                    label: spaceName.trim(),
                };
                this.addSpaceOption(newSpace);
                return newSpace;
            },
        });
        const defaultSpaceId = this.spaceOptions[0]?.id ?? '';
        if (defaultSpaceId) {
            dropdown.setSelection(defaultSpaceId);
            this.selectedData.spaceId = defaultSpaceId;
        }
        return { id, instance: dropdown };
    }

    /** Creates the tags dropdown component. */
    private createTagsDropdown(): { id: string; instance: BaseInstance | null } {
        const id = this.tagId;
        const dropdown = DropdownFactory.create(this.tagOptions, {
            label: 'Tags',
            placeholder: 'Add tags...',
            tooltip: 'Select or create tags',
            multiSelect: true,
            allowCustom: true,
            customInputPlaceholder: 'Create new tag...',
            closeOnSelect: false,
            buttonTemplateCallback: InlineToolbarFactory.html.tagsDropdownButton,
            onCustomCreate: (tagName: string) => {
                const newTag: DropdownOption = {
                    id: this.generateId(tagName),
                    label: tagName.trim(),
                    additionalData: { color: this.generateRandomColor() },
                    render: InlineToolbarFactory.html.tagsDropdownOption,
                };
                this.addTagOption(newTag);
                return newTag;
            },
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.tags = selection.multiple?.map(tag => tag.id) ?? [];
            },
        });
        return { id, instance: dropdown };
    }

    /** Creates the color dropdown component. */
    private createColorDropdown(): { id: string; instance: BaseInstance | null } {
        const id = this.colorId;
        const options: DropdownOption[] = TOOLBAR_COLORS.map(color => ({
            id: color.id,
            label: color.name,
            additionalData: { value: color.value, shortcut: color.shortcut },
            render: InlineToolbarFactory.html.colorDropdownOption,
        }));
        const keyboardShortcuts: Record<string, string> = {};
        TOOLBAR_COLORS.forEach(color => {
            keyboardShortcuts[color.shortcut.toUpperCase()] = color.id;
        });
        const dropdown = DropdownFactory.create(options, {
            label: 'Color',
            placeholder: 'Select color',
            tooltip: 'Select color (use hotkeys B/Y/P/O/G)',
            closeOnSelect: true,
            keyboardShortcuts,
            buttonTemplateCallback: InlineToolbarFactory.html.colorsDropdownButton,
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.colorId = selection.single?.id;
            },
        });
        dropdown.setSelection(options[0]?.id ?? '');
        return { id, instance: dropdown };
    }

    /** Creates the AI actions dropdown component. */
    private createAIActionsDropdown(): { id: string; instance: BaseInstance | null } {
        const id = this.aiActionId;
        const dropdown = DropdownFactory.create(TOOLBAR_AI_ACTIONS_OPTIONS, {
            label: 'AI Action',
            placeholder: 'Select action',
            tooltip: 'Select AI action to apply',
            closeOnSelect: true,
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.aiActionId = selection.single?.id ?? undefined;
            },
        });
        dropdown.setSelection('');
        return { id, instance: dropdown };
    }

    /** Creates the formatting toggle component. */
    private createFormattingToggle(): { id: string; instance: BaseInstance | null } {
        const id = this.formattingId;
        const toggle = ToggleFactory.create({
            label: 'Preserve Formatting',
            initialState: true,
            tooltip: 'Keep original text formatting (Shift+F)',
            shortcutKey: KEYS.F,
            shortcutModifier: 'Shift',
            onChange: (state: boolean) => {
                this.selectedData.preserveFormatting = state;
            },
        });
        return { id, instance: toggle };
    }

    /** Creates the save button component. */
    private createSaveButton(): { id: string; instance: BaseInstance | null } {
        const id = InlineToolbarInstance.componentIds.SAVE;
        const button = ButtonFactory.create({
            label: 'Save',
            primary: true,
            tooltip: 'Save this snippet (Enter)',
            onClick: () => this.config.onSave?.(this.selectedData),
        });
        return { id, instance: button };
    }

    /** Creates the copy button component. */
    private createCopyButton(): { id: string; instance: BaseInstance | null } {
        const id = InlineToolbarInstance.componentIds.COPY;
        const button = ButtonFactory.create({
            label: 'Copy',
            primary: false,
            tooltip: 'Copy as HTML (Ctrl+Shift+C)',
            icon: InlineToolbarFactory.html.copyIcon,
            // onClick: () => this.config.onCopy?.(this.selectedData),
        });
        return { id, instance: button };
    }

    // --- Utility Methods ---

    /** Initializes default options for spaces and tags if not set. */
    private initializeDefaultOptions(): void {
        this.spaceOptions ||= TOOLBAR_SPACES_DEFAULT_OPTIONS;
        this.tagOptions ||= TOOLBAR_TAGS_DEFAULT_OPTIONS;
    }

    /** Updates the options for a dropdown by id. */
    private updateDropdownOptions(id: string, options: DropdownOption[]): void {
        const dropdown = this.componentMap.get(id) as DropdownInstance | undefined;
        if (dropdown && typeof dropdown.setOptions === 'function') {
            dropdown.setOptions(options);
        }
    }

    /** Resets a dropdown's selection by id. */
    private resetDropdown(id: string, value: string | string[]): void {
        const component = this.componentMap.get(id);
        if (component && 'setSelection' in component) {
            (component as DropdownInstance).setSelection(value);
        }
    }

    /** Resets a toggle's state by id. */
    private resetToggle(id: string, state: boolean): void {
        const component = this.componentMap.get(id);
        if (component && 'setState' in component) {
            (component as ToggleInstance).setState(state);
        }
    }

    /** Generates a unique id based on a value and timestamp. */
    private generateId(value: string): string {
        return `${value}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /** Generates a random HSL color string. */
    private generateRandomColor(): string {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }

    /** Returns the default selected data for the toolbar. */
    private getDefaultSelectedData(): ToolbarSelectedData {
        return {
            spaceId: this.spaceOptions[0]?.id ?? '',
            colorId: 'blue',
            tags: [],
            preserveFormatting: true,
        };
    }

    // --- Keyboard Navigation & Focus ---

    /** Sets up keyboard navigation for the toolbar. */
    private setupToolbarKeyboardNavigation(): void {
        this.eventManager.addEventHandler(this.container!, EVENTS.KEYDOWN, (e: Event) => {
            const keyEvent = e as KeyboardEvent;
            if (this.handleToolbarKey(keyEvent)) {
                e.preventDefault();
            }
        });
    }

    /** Handles key events for toolbar navigation and actions. */
    private handleToolbarKey(e: KeyboardEvent): boolean {
        const { key, shiftKey, ctrlKey } = e;

        if (key === KEYS.TAB) {
            this.navigateFocus(shiftKey ? -1 : 1);
            return true;
        }
        if (shiftKey && key === KEYS.ENTER) {
            this.config.onSave?.(this.selectedData);
            this.config.onClose?.();
            return true;
        }
        if (shiftKey && key === KEYS.F) {
            const component = this.componentMap.get(this.formattingId);
            if (component && 'toggle' in component) {
                (component as ToggleInstance).toggle();
            }
            return true;
        }
        if (ctrlKey && shiftKey && key === KEYS.C) {
            // this.config.onCopy?.(this.selectedData);
            return true;
        }
        return false;
    }

    /** Enhanced focus method with interaction type awareness. */
    private focus(index: number, viaKeyboard: Boolean = true): void {
        if (index < 0 || index >= this.focusOrder.length) return;

        const componentId = this.focusOrder[index];
        const focusableElement = this.componentMap
            .get(componentId)
            ?.getElement()
            ?.querySelector('button') as HTMLElement;

        if (!focusableElement) return;

        this.currentFocusIndex = index;
        if (viaKeyboard) this.closeAllOpenDropdowns();
        requestAnimationFrame(() => {
            focusableElement.focus();
        });
    }

    /** Enhanced keyboard navigation with proper focus management. */
    private navigateFocus(direction: number): void {
        const total = this.focusOrder.length;
        if (total === 0) return;

        const newIndex = (this.currentFocusIndex + direction + total) % total;
        this.focus(newIndex, true);
    }

    /** Closes all dropdowns except the specified component. */
    private closeOtherDropdowns(excludeComponentId: string): void {
        this.dropdownIds.forEach(id => {
            if (id === excludeComponentId) return;

            const component = this.componentMap.get(id);
            if (component && 'isOpened' in component && 'close' in component) {
                const dropdown = component as DropdownInstance;
                if (dropdown.isOpened?.()) {
                    dropdown.close();
                }
            }
        });
    }

    /** Closes all open dropdowns in the toolbar. */
    private closeAllOpenDropdowns(): void {
        this.dropdownIds.forEach(id => {
            const component = this.componentMap.get(id);
            if (component && 'isOpened' in component && 'close' in component) {
                const dropdown = component as DropdownInstance;
                if (dropdown.isOpened?.()) {
                    dropdown.close();
                }
            }
        });
    }
}
