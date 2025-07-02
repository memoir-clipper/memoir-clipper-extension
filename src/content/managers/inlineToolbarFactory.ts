import type { TextModel } from '@/models/textModel';
import {
    CLASS_INLINE_TOOLBAR,
    CLASS_INLINE_TOOLBAR_VISIBLE,
    ID_STYLE_INLINE_TOOLBAR,
    CLASS_INLINE_TOOLBAR_SHORTCUT,
} from '@/utils/values/ids';
import { KEYS, EVENTS } from '@/utils/values/enums';
import { ATTRS } from '@/utils/values/htmlAttributes';
import { ACTION_TOOLBAR_CLOSE, ACTION_TOOLBAR_COPY, ACTION_TOOLBAR_SAVE } from '@/utils/values/actions';
import { TAGS } from '@/utils/values/htmlTags';
import { DOM_UTILS } from '@/utils/helpers/domUtils';
import { DropdownFactory, type DropdownInstance } from '@/utils/ui/dropdownFactory';
import { ToggleFactory, type ToggleInstance } from '@/utils/ui/toggleFactory';
import { ButtonFactory, type ButtonInstance } from '@/utils/ui/buttonFactory';
import { InlineToolbarStyles } from '@/styles/inlineToolbarStyles';
import { BaseFactory, BaseInstance } from '@/utils/ui/baseFactory';
import type {
    DropdownOption,
    DropdownSelection,
    DropdownConfig,
    InlineToolbarConfig,
    ToolbarSelectedData,
} from '@/utils/ui/uiConfig';
import { logger } from '@/utils/helpers/logger';
import {
    TOOLBAR_SPACE_NAMES,
    TOOLBAR_COLOR_NAMES,
    TOOLBAR_TAG_NAMES,
    TOOLBAR_AI_ACTION_NAMES,
    TOOLBAR_AI_ACTION_DESCRIPTIONS,
} from '@/utils/values/strings';

/**
 * SVG markup for the copy icon.
 */
export const ICON_COPY = `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
</svg>`;

/**
 * UI options and static data for the inline toolbar.
 */
export const UI_OPTIONS = {
    ANIMATION: { DURATION_MS: 200, EASING: 'ease' },
    VISIBILITY: {
        AUTO_HIDE_DELAY_MS: 10000000,
        ENABLE_AUTO_HIDE: true,
    },
    TIMING: { FOCUS_DELAY: 10 },
} as const;

/**
 * Static data for the inline toolbar, including spaces, colors, tags, and AI actions.
 */
export const TOOLBAR_DATA = {
    spaces: [
        { id: 'personal', name: TOOLBAR_SPACE_NAMES.PERSONAL },
        { id: 'work', name: TOOLBAR_SPACE_NAMES.WORK },
        { id: 'research', name: TOOLBAR_SPACE_NAMES.RESEARCH },
        { id: 'projects', name: TOOLBAR_SPACE_NAMES.PROJECTS },
    ],
    colors: [
        { id: 'blue', name: TOOLBAR_COLOR_NAMES.BLUE, value: '#3b82f6', shortcut: KEYS.B },
        { id: 'yellow', name: TOOLBAR_COLOR_NAMES.YELLOW, value: '#eab308', shortcut: KEYS.Y },
        { id: 'purple', name: TOOLBAR_COLOR_NAMES.PURPLE, value: '#8b5cf6', shortcut: KEYS.P },
        { id: 'orange', name: TOOLBAR_COLOR_NAMES.ORANGE, value: '#f97316', shortcut: KEYS.O },
        { id: 'green', name: TOOLBAR_COLOR_NAMES.GREEN, value: '#22c55e', shortcut: KEYS.G },
    ],
    tags: [
        { id: 'important', name: TOOLBAR_TAG_NAMES.IMPORTANT, color: '#ef4444' },
        { id: 'idea', name: TOOLBAR_TAG_NAMES.IDEA, color: '#8b5cf6' },
        { id: 'quote', name: TOOLBAR_TAG_NAMES.QUOTE, color: '#06b6d4' },
        { id: 'reference', name: TOOLBAR_TAG_NAMES.REFERENCE, color: '#10b981' },
    ],
    aiActions: [
        {
            id: 'summarize',
            name: TOOLBAR_AI_ACTION_NAMES.SUMMARIZE,
            description: TOOLBAR_AI_ACTION_DESCRIPTIONS.SUMMARIZE,
        },
        { id: 'explain', name: TOOLBAR_AI_ACTION_NAMES.EXPLAIN, description: TOOLBAR_AI_ACTION_DESCRIPTIONS.EXPLAIN },
        {
            id: 'translate',
            name: TOOLBAR_AI_ACTION_NAMES.TRANSLATE,
            description: TOOLBAR_AI_ACTION_DESCRIPTIONS.TRANSLATE,
        },
        { id: 'improve', name: TOOLBAR_AI_ACTION_NAMES.IMPROVE, description: TOOLBAR_AI_ACTION_DESCRIPTIONS.IMPROVE },
    ],
} as const;

/**
 * Factory for creating inline toolbar instances.
 */
export class InlineToolbarFactory extends BaseFactory {
    public static create(textModel: TextModel, config: InlineToolbarConfig = {}): InlineToolbarInstance {
        this.ensureStyles(ID_STYLE_INLINE_TOOLBAR, InlineToolbarStyles.defaultToolbarStyle);
        return new InlineToolbarInstance(textModel, config);
    }

    public static createWithInteractions(
        textModel: TextModel,
        onAction: (action: string) => void,
    ): InlineToolbarInstance {
        return this.create(textModel, {
            onSave: () => onAction(ACTION_TOOLBAR_SAVE),
            onCopy: () => onAction(ACTION_TOOLBAR_COPY),
            onClose: () => onAction(ACTION_TOOLBAR_CLOSE),
        });
    }
}

/**
 * Represents a single inline toolbar UI instance.
 */
export class InlineToolbarInstance extends BaseInstance {
    private focusableElements: HTMLElement[] = [];
    private currentFocusIndex = 0;
    private escapeCount = 0;
    private selectedData: ToolbarSelectedData = {
        spaceId: TOOLBAR_DATA.spaces[0].id,
        colorId: TOOLBAR_DATA.colors[0].id,
        tags: [],
        preserveFormatting: true,
    };

    private dropdownInstances: DropdownInstance[] = [];
    private toggleInstances: ToggleInstance[] = [];
    private buttonInstances: ButtonInstance[] = [];

    constructor(
        private textModel: TextModel,
        private config: InlineToolbarConfig,
    ) {
        logger.debug('InlineToolbarInstance: Constructor called', { config });

        super();
        this.container = this.createToolbar();
        this.setupGlobalKeyboardShortcuts();

        logger.debug('InlineToolbarInstance: Constructor completed', {
            containerClass: this.container.className,
        });
    }

    public getElement(): HTMLElement {
        return this.container;
    }

    public show(): void {
        this.container.classList.add(CLASS_INLINE_TOOLBAR_VISIBLE);
        this.delayedFocus();
    }

    public hide(onComplete?: () => void): void {
        this.container.classList.remove(CLASS_INLINE_TOOLBAR_VISIBLE);
        setTimeout(() => {
            onComplete?.();
        }, UI_OPTIONS.ANIMATION.DURATION_MS);
    }

    public cleanup(): void {
        this.dropdownInstances.forEach(dropdown => dropdown.cleanup());
        this.toggleInstances.forEach(toggle => toggle.cleanup());
        this.buttonInstances.forEach(button => button.cleanup());

        this.dropdownInstances = [];
        this.toggleInstances = [];
        this.buttonInstances = [];
        this.focusableElements = [];
        this.currentFocusIndex = 0;

        super.cleanup();
    }

    // --- Toolbar Creation and Component Generation ---

    private createToolbar(): HTMLElement {
        const toolbar = DOM_UTILS.createElement(TAGS.DIV, CLASS_INLINE_TOOLBAR);
        this.addToolbarAttrs(toolbar);

        const components = this.generateToolbarComponents();
        components.forEach(component => toolbar.appendChild(component));

        this.setupToolbarInteractions(toolbar);
        return toolbar;
    }

    private addToolbarAttrs(toolbar: HTMLElement): void {
        toolbar.setAttribute(ATTRS.ROLE, ATTRS.TOOLBAR);
        toolbar.setAttribute(ATTRS.ARIA_LABEL, 'Snippet management toolbar');
    }

    private generateToolbarComponents(): HTMLElement[] {
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

    // --- Toolbar Interactions and Navigation ---

    private setupToolbarInteractions(toolbar: HTMLElement): void {
        this.setupToolbarKeyboardNavigation(toolbar);
        this.setupOutsideClickHandler(toolbar);
    }

    private delayedFocus(): void {
        setTimeout(() => {
            if (this.focusableElements.length > 0) {
                this.focusableElements[0].focus();
            }
        }, UI_OPTIONS.TIMING.FOCUS_DELAY);
    }

    private setupToolbarKeyboardNavigation(toolbar: HTMLElement): void {
        this.eventManager.addEventHandler(toolbar, EVENTS.KEYDOWN, (e: Event) => {
            const keyEvent = e as KeyboardEvent;
            const { key, shiftKey } = keyEvent;

            const keyHandlers: Record<string, () => void> = {
                [KEYS.TAB]: () => {
                    e.preventDefault();
                    this.navigateFocus(shiftKey ? -1 : 1);
                },
                [KEYS.ENTER]: () => {
                    if (shiftKey) {
                        e.preventDefault();
                        this.config.onSave?.(this.selectedData);
                        this.config.onClose?.();
                    }
                },
                [KEYS.ESCAPE]: () => {
                    e.preventDefault();
                    this.handleEscapeKey();
                },
                [KEYS.F]: () => {
                    if (shiftKey) {
                        e.preventDefault();
                        this.toggleInstances[0]?.toggle();
                    }
                },
            };

            keyHandlers[key]?.();
        });
    }

    private handleEscapeKey(): void {
        const hasOpenDropdown = this.dropdownInstances.some(dropdown =>
            dropdown.getElement().classList.contains('dropdown-factory-container--open'),
        );

        if (hasOpenDropdown) {
            this.dropdownInstances.forEach(dropdown => dropdown.close());
            this.escapeCount = 0;
        } else {
            this.escapeCount++;
            if (this.escapeCount >= 2 && this.config.onClose) {
                this.config.onClose();
            }
        }
    }

    private setupGlobalKeyboardShortcuts(): void {
        this.eventManager.addEventHandler(document, EVENTS.KEYDOWN, (e: Event) => {
            const keyEvent = e as KeyboardEvent;
            if (keyEvent.ctrlKey && keyEvent.shiftKey && keyEvent.key === KEYS.C) {
                e.preventDefault();
                this.buttonInstances
                    .find(button =>
                        button
                            .getElement()
                            .querySelector('button')
                            ?.classList.contains('button-factory-button--secondary'),
                    )
                    ?.click();
            }
        });
    }

    private navigateFocus(direction: number): void {
        this.currentFocusIndex += direction;

        if (this.currentFocusIndex >= this.focusableElements.length) {
            this.currentFocusIndex = 0;
        } else if (this.currentFocusIndex < 0) {
            this.currentFocusIndex = this.focusableElements.length - 1;
        }

        this.focusableElements[this.currentFocusIndex]?.focus();
    }

    private setupOutsideClickHandler(toolbar: HTMLElement): void {
        const isClickOutsideToolbar = (event: Event): boolean => {
            if (toolbar.contains(event.target as Node)) return false;
            return !this.dropdownInstances.some(dropdown => dropdown.getElement().contains(event.target as Node));
        };

        const handleDocumentClick = (event: Event): void => {
            if (isClickOutsideToolbar(event)) {
                this.hide(this.config.onClose);
            }
        };

        setTimeout(() => {
            this.eventManager.addEventHandler(document, EVENTS.MOUSEDOWN, handleDocumentClick);
        }, 0);
    }

    // --- Toolbar Component Creators ---

    private createSpacesDropdown(): HTMLElement {
        const options: DropdownOption[] = TOOLBAR_DATA.spaces.map(space => ({
            id: space.id,
            label: space.name,
        }));

        const dropdown = DropdownFactory.create(options, {
            label: 'Space',
            placeholder: 'Select space',
            tooltip: 'Select a space',
            closeOnSelect: true,
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.spaceId = selection.single?.id;
            },
        });

        dropdown.setSelection(TOOLBAR_DATA.spaces[0].id);
        this.dropdownInstances.push(dropdown);
        this.focusableElements.push(dropdown.getElement().querySelector('button')!);
        return dropdown.getElement();
    }

    private createColorDropdown(): HTMLElement {
        const options: DropdownOption[] = TOOLBAR_DATA.colors.map(color => ({
            id: color.id,
            label: color.name,
            additionalData: { value: color.value, shortcut: color.shortcut },
            render: (option: DropdownOption) => `
                <span style="
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background-color: ${(option.additionalData as { value: string; shortcut: string }).value};
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    margin-right: 8px;
                "></span>
                <span style="flex: 1;">${option.label}</span>
                <kbd class="${CLASS_INLINE_TOOLBAR_SHORTCUT}">${(option.additionalData as { value: string; shortcut: string }).shortcut}</kbd>
            `,
        }));

        const keyboardShortcuts: Record<string, string> = {};
        TOOLBAR_DATA.colors.forEach(color => {
            keyboardShortcuts[color.shortcut.toUpperCase()] = color.id;
        });

        const dropdown = DropdownFactory.create(options, {
            label: 'Color',
            placeholder: 'Select color',
            tooltip: 'Select color (use hotkeys B/Y/P/O/G)',
            closeOnSelect: true,
            keyboardShortcuts,
            renderButton: (config: DropdownConfig, selection: DropdownSelection) => {
                const selectedOption = selection.single;
                const colorValue =
                    (selectedOption?.additionalData as { value: string; shortcut: string })?.value ?? '#gray';
                const colorName = selectedOption?.label ?? 'Select color';

                return `
                    <span class="dropdown-factory-label">${config.label}</span>
                    <span style="
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background-color: ${colorValue};
                        border: 1px solid rgba(0, 0, 0, 0.1);
                        margin-right: 6px;
                    "></span>
                    <span class="dropdown-factory-selection">${colorName}</span>
                    <span class="dropdown-factory-arrow">▼</span>
                `;
            },
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.colorId = selection.single?.id;
            },
        });

        dropdown.setSelection(TOOLBAR_DATA.colors[0].id);
        this.dropdownInstances.push(dropdown);
        this.focusableElements.push(dropdown.getElement().querySelector('button')!);
        return dropdown.getElement();
    }

    private createTagsDropdown(): HTMLElement {
        const options: DropdownOption[] = TOOLBAR_DATA.tags.map(tag => ({
            id: tag.id,
            label: tag.name,
            additionalData: { color: tag.color },
            render: (option: DropdownOption) => `
                <span style="
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: ${(option.additionalData as { color: string }).color};
                    margin-right: 8px;
                "></span>
                <span style="flex: 1;">${option.label}</span>
            `,
        }));

        const dropdown = DropdownFactory.create(options, {
            label: 'Tags',
            placeholder: 'Add tags...',
            tooltip: 'Select or create tags',
            multiSelect: true,
            allowCustom: true,
            customInputPlaceholder: 'Create new tag...',
            closeOnSelect: false,
            renderButton: (config: DropdownConfig, selection: DropdownSelection) => {
                const count = selection.count;
                const displayText = count > 0 ? this.formatTagCount(count) : config.placeholder;

                return `
                    <span class="dropdown-factory-label">${config.label}</span>
                    <span class="dropdown-factory-selection" style="${count > 0 ? 'color: #3b82f6; font-weight: 500;' : ''}">${displayText}</span>
                    <span class="dropdown-factory-arrow">▼</span>
                `;
            },
            onCustomCreate: (tagName: string) => {
                const newTag: DropdownOption = {
                    id: this.generateTagId(),
                    label: tagName,
                    additionalData: { color: this.generateRandomColor() },
                };
                return newTag;
            },
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.tags = selection.multiple?.map(tag => tag.id) ?? [];
            },
        });

        this.dropdownInstances.push(dropdown);
        this.focusableElements.push(dropdown.getElement().querySelector('button')!);
        return dropdown.getElement();
    }

    private createAIActionsDropdown(): HTMLElement {
        const options: DropdownOption[] = [
            { id: '', label: 'None' },
            ...TOOLBAR_DATA.aiActions.map(action => ({
                id: action.id,
                label: action.name,
                description: action.description,
            })),
        ];

        const dropdown = DropdownFactory.create(options, {
            label: 'AI Action',
            placeholder: 'Select action',
            tooltip: 'Select AI action to apply',
            closeOnSelect: true,
            onSelect: (selection: DropdownSelection) => {
                this.selectedData.aiActionId = selection.single?.id ?? undefined;
            },
        });

        dropdown.setSelection('');
        this.dropdownInstances.push(dropdown);
        this.focusableElements.push(dropdown.getElement().querySelector('button')!);
        return dropdown.getElement();
    }

    private createFormattingToggle(): HTMLElement {
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

        this.toggleInstances.push(toggle);
        this.focusableElements.push(toggle.getElement().querySelector('button')!);
        return toggle.getElement();
    }

    private createSaveButton(): HTMLElement {
        const button = ButtonFactory.create({
            label: 'Save',
            primary: true,
            tooltip: 'Save this snippet (Enter)',
            onClick: () => this.config.onSave?.(this.selectedData),
        });

        this.buttonInstances.push(button);
        this.focusableElements.push(button.getElement().querySelector('button')!);
        return button.getElement();
    }

    private createCopyButton(): HTMLElement {
        const button = ButtonFactory.create({
            label: 'Copy',
            primary: false,
            tooltip: 'Copy as HTML (Ctrl+Shift+C)',
            icon: ICON_COPY,
            onClick: () => this.config.onCopy?.(this.textModel.html),
        });

        this.buttonInstances.push(button);
        this.focusableElements.push(button.getElement().querySelector('button')!);
        return button.getElement();
    }

    // --- Utility Methods ---

    private generateTagId(): string {
        return `tag-${Date.now()}`;
    }

    private generateRandomColor(): string {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }

    private formatTagCount(count: number): string {
        return `${count} tag${count > 1 ? 's' : ''} selected`;
    }
}
