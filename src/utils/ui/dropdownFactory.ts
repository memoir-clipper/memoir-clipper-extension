import { DOM_UTILS } from '@/utils/helpers/domUtils';
import { TAGS } from '@/utils/values/htmlTags';
import { ATTRS } from '@/utils/values/htmlAttributes';
import { MINUS_ONE, TRUE, FALSE } from '@/utils/values/constants';
import { EVENTS } from '@/utils/values/enums';
import { BaseFactory, BaseInstance } from './baseFactory';
import type { DropdownOption, DropdownConfig, DropdownSelection, DropdownVariant } from './uiConfig';
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
    ID_DROPDOWN_STYLES,
} from '../values/ids';
import { DropdownStyles } from '@/styles/dropdownStyles';
import { KEYS } from '../values/enums';

// --- DropdownFactory ---

export class DropdownFactory extends BaseFactory {
    private static stylesMap: Record<DropdownVariant, string> = {
        default: DropdownStyles.defaultDropdownStyle,
    };

    public static html = {
        label: (label: string) => `<span class="${CLASS_DROPDOWN_LABEL}">${label}</span>`,
        selection: (text: string) => `<span class="${CLASS_DROPDOWN_SELECTION}">${text}</span>`,
        arrow: () => `<span class="${CLASS_DROPDOWN_ARROW}">▼</span>`,
        checkbox: () => `<div class="${CLASS_DROPDOWN_CHECKBOX}"></div>`,
        optionLabel: (label: string) => `<div class="${CLASS_DROPDOWN_OPTION_LABEL}">${label}</div>`,
        optionDescription: (desc?: string) =>
            desc ? `<div class="${CLASS_DROPDOWN_OPTION_DESCRIPTION}">${desc}</div>` : '',
        optionContent: (label: string, desc?: string) =>
            `<div class="${CLASS_DROPDOWN_OPTION_CONTENT}">
                ${DropdownFactory.html.optionLabel(label)}
                ${DropdownFactory.html.optionDescription(desc)}
            </div>`,
        empty: (text: string) => `<div class="${CLASS_DROPDOWN_EMPTY}">${text}</div>`,
    };

    public static create(
        options: DropdownOption[],
        config: DropdownConfig = {},
        variant: DropdownVariant = 'default',
    ): DropdownInstance {
        const styles = DropdownFactory.getStylesForVariant(
            variant,
            this.stylesMap,
            DropdownStyles.defaultDropdownStyle,
        );
        DropdownFactory.ensureStyles(ID_DROPDOWN_STYLES, styles);
        return new DropdownInstance(options, config);
    }
}

// --- DropdownInstance ---

export class DropdownInstance extends BaseInstance {
    // --- State ---
    private button: HTMLElement;
    private menu: HTMLElement;
    private searchInput?: HTMLInputElement;

    private isOpen = false;
    private filteredOptions: DropdownOption[] = [];
    private selectedOptions = new Set<string>();
    private searchTerm = '';

    constructor(
        private options: DropdownOption[],
        private config: DropdownConfig,
    ) {
        super();
        this.filteredOptions = [...options];
        this.container = this.createContainer();
        this.button = this.createButton();
        this.menu = this.createMenu();

        this.container.appendChild(this.button);
        this.container.appendChild(this.menu);

        this.setupEvents();
        this.updateButtonContent();
    }

    // --- Public API ---

    override getElement(): HTMLElement | null {
        return this.container;
    }

    public isOpened(): boolean {
        return this.isOpen;
    }

    public getSelection(): DropdownSelection {
        if (this.selectedOptions.size === 0) {
            return this.config.multiSelect
                ? { multiple: [], isEmpty: true, count: 0 }
                : { single: undefined, isEmpty: true, count: 0 };
        }
        if (this.config.multiSelect) {
            const multiple = this.options.filter(opt => this.selectedOptions.has(opt.id));
            return {
                multiple,
                isEmpty: multiple.length === 0,
                count: multiple.length,
            };
        } else {
            const single = this.options.find(opt => this.selectedOptions.has(opt.id));
            return {
                single,
                isEmpty: !single,
                count: single ? 1 : 0,
            };
        }
    }

    /** Sets the selected option(s) by id and updates the UI. */
    public setSelection(optionIds: string | string[]): void {
        this.selectedOptions.clear();
        const ids = Array.isArray(optionIds) ? optionIds : [optionIds];
        if (this.config.multiSelect) {
            ids.forEach(id => {
                if (this.options.find(opt => opt.id === id)) {
                    this.selectedOptions.add(id);
                }
            });
        } else if (ids.length > 0) {
            const id = ids[0];
            if (this.options.find(opt => opt.id === id)) {
                this.selectedOptions.add(id);
            }
        }
        this.updateButtonContent();
        this.updateMenuItems();
    }

    /** Replaces all dropdown options and updates selection/filter state. */
    public setOptions(options: DropdownOption[]): void {
        this.options = [...options]; // Defensive copy
        this.applyFilter(); // Reapply current filter
        this.updateMenuItems(); // Update the DOM

        // Validate current selection - remove invalid selections
        const validIds = new Set(options.map(opt => opt.id));
        const invalidSelections = Array.from(this.selectedOptions).filter(id => !validIds.has(id));
        invalidSelections.forEach(id => {
            this.selectedOptions.delete(id);
        });

        // Update button content to reflect any selection changes
        this.updateButtonContent();
    }

    /** Adds a single option to the dropdown and updates the menu. */
    public addOption(option: DropdownOption): void {
        this.options.push(option);
        this.applyFilter();
        this.updateMenuItems();
    }

    /** Enhanced close method with proper focus restoration. */
    public close(): void {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.container?.classList.remove(CLASS_DROPDOWN_OPEN);
        this.button.setAttribute(ATTRS.ARIA_EXPANDED, FALSE);

        // Clear search state
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchTerm = '';
            this.applyFilter();
        }

        // Restore focus to button for continued navigation
        requestAnimationFrame(() => {
            this.button.focus();
        });
    }

    // --- DOM Creation & Rendering ---

    private createContainer(): HTMLElement {
        const container = DOM_UTILS.createElement(TAGS.DIV, CLASS_DROPDOWN_CONTAINER);
        if (this.config.tooltip) {
            container.setAttribute(ATTRS.TOOLTIP, this.config.tooltip);
        }
        return container;
    }

    private createButton(): HTMLElement {
        const button = DOM_UTILS.createElement(TAGS.BUTTON, CLASS_DROPDOWN_BUTTON);
        button.setAttribute(ATTRS.ROLE, ATTRS.COMBOBOX);
        button.setAttribute(ATTRS.ARIA_HASPOPUP, ATTRS.LISTBOX);
        button.setAttribute(ATTRS.ARIA_EXPANDED, FALSE);
        return button;
    }

    private createMenu(): HTMLElement {
        const menu = DOM_UTILS.createElement(TAGS.DIV, CLASS_DROPDOWN_MENU);
        menu.setAttribute(ATTRS.ROLE, ATTRS.LISTBOX);
        menu.setAttribute(ATTRS.TABINDEX, MINUS_ONE);
        if (this.config.multiSelect) {
            menu.setAttribute(ATTRS.ARIA_MULTISELECTABLE, TRUE);
        }
        if (this.config.searchable) {
            this.createSearchInput(menu);
        }
        return menu;
    }

    private createSearchInput(menu: HTMLElement): void {
        const searchContainer = DOM_UTILS.createElement(TAGS.DIV, CLASS_DROPDOWN_SEARCH);
        this.searchInput = DOM_UTILS.createElement(TAGS.INPUT, CLASS_DROPDOWN_SEARCH_INPUT) as HTMLInputElement;
        this.searchInput.type = 'text';
        this.searchInput.placeholder = this.config.customInputPlaceholder ?? 'Search...';
        searchContainer.appendChild(this.searchInput);
        menu.appendChild(searchContainer);

        this.eventManager.addEventHandler(this.searchInput, EVENTS.INPUT, () => {
            this.searchTerm = this.searchInput!.value;
            this.applyFilter();
        });

        this.eventManager.addEventHandler(this.searchInput, EVENTS.KEYDOWN, (event: Event) => {
            const keyEvent = event as KeyboardEvent;
            if (keyEvent.key === KEYS.ENTER && this.config.allowCustom) {
                event.preventDefault();
                this.handleCustomCreate();
            } else if (keyEvent.key === KEYS.ESCAPE) {
                event.preventDefault();
                this.close();
            }
        });
    }

    private updateButtonContent(): void {
        const selection = this.getSelection();
        if (this.config.buttonTemplateCallback) {
            this.button.innerHTML = this.config.buttonTemplateCallback(this.config, selection);
            return;
        }
        let content = '';
        if (this.config.label) {
            content += DropdownFactory.html.label(this.config.label);
        }
        let selectionText = this.config.placeholder ?? 'Select...';
        if (!selection.isEmpty) {
            if (this.config.multiSelect && selection.multiple) {
                selectionText = `${selection.count} selected`;
            } else if (selection.single) {
                selectionText = selection.single.label;
            }
        }
        content += DropdownFactory.html.selection(selectionText);
        content += DropdownFactory.html.arrow();
        this.button.innerHTML = content;
    }

    /** Removes all menu items and re-renders the filtered options. */
    private updateMenuItems(): void {
        const removableElements = this.menu.querySelectorAll(`.${CLASS_DROPDOWN_OPTION}, .${CLASS_DROPDOWN_EMPTY}`);
        removableElements.forEach(element => element.remove());

        if (this.filteredOptions.length === 0) {
            const emptyElement = DOM_UTILS.createElement(TAGS.DIV, CLASS_DROPDOWN_EMPTY);
            emptyElement.textContent = this.searchTerm ? 'No results found' : 'No options available';
            this.menu.appendChild(emptyElement);
            return;
        }

        this.filteredOptions.forEach(option => {
            const optionElement = this.createOptionElement(option);
            this.menu.appendChild(optionElement);
        });
    }

    private createOptionElement(option: DropdownOption): HTMLElement {
        const optionElement = DOM_UTILS.createElement(TAGS.DIV, CLASS_DROPDOWN_OPTION);
        optionElement.setAttribute(ATTRS.ROLE, ATTRS.OPTION);
        optionElement.setAttribute(ATTRS.ID, option.id);

        if (this.selectedOptions.has(option.id)) {
            optionElement.classList.add(CLASS_DROPDOWN_OPTION_SELECTED);
        }

        optionElement.innerHTML = option.render ? option.render(option) : this.createDefaultOptionContent(option);

        this.eventManager.addEventHandler(optionElement, EVENTS.CLICK, (event: Event) => {
            event.stopPropagation();
            this.selectOption(option);
        });

        return optionElement;
    }

    private createDefaultOptionContent(option: DropdownOption): string {
        let content = '';
        if (this.config.multiSelect) {
            content += DropdownFactory.html.checkbox();
        }
        content += DropdownFactory.html.optionContent(option.label, option.description);
        return content;
    }

    // --- Selection, Filtering, and Custom Option ---

    /** Handles selection logic for single/multi-select and invokes callbacks. */
    private selectOption(option: DropdownOption): void {
        const { multiSelect, closeOnSelect = true, onSelect } = this.config;

        if (multiSelect) {
            if (this.selectedOptions.has(option.id)) {
                this.selectedOptions.delete(option.id);
            } else {
                this.selectedOptions.add(option.id);
            }
        } else {
            this.selectedOptions.clear();
            this.selectedOptions.add(option.id);
            if (closeOnSelect) {
                this.close();
            }
        }

        this.updateButtonContent();
        this.updateMenuItems();
        onSelect?.(this.getSelection());
    }

    /** Filters options based on the current search term. */
    private applyFilter(): void {
        const term = this.searchTerm.trim().toLowerCase();
        if (!term) {
            this.filteredOptions = this.options;
            this.updateMenuItems();
            return;
        }

        const startsWith: DropdownOption[] = [];
        const includes: DropdownOption[] = [];
        const descIncludes: DropdownOption[] = [];

        for (let i = 0, len = this.options.length; i < len; i++) {
            const option = this.options[i];
            const labelLower = option.label.toLowerCase();

            if (labelLower.startsWith(term)) {
                startsWith.push(option);
                continue;
            }
            if (labelLower.includes(term)) {
                includes.push(option);
                continue;
            }
            if (option.description?.toLowerCase().includes(term)) {
                descIncludes.push(option);
            }
        }

        this.filteredOptions = startsWith.concat(includes, descIncludes);
        this.updateMenuItems();
    }

    /** Handles creation and selection of a custom option from the search term. */
    private handleCustomCreate(): void {
        const { allowCustom, onCustomCreate } = this.config;
        const searchTerm = this.searchTerm.trim();
        if (!allowCustom || !onCustomCreate || !searchTerm) return;

        const newOption = onCustomCreate(searchTerm);
        if (!newOption) return;

        this.addOption(newOption);
        this.selectOption(newOption);

        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.searchTerm = '';
        this.applyFilter();
    }

    // --- Dropdown Open/Close & Event Handling ---

    /** Enhanced open method with smart focus management. */
    private open(): void {
        if (this.isOpen) return;

        this.isOpen = true;
        this.container?.classList.add(CLASS_DROPDOWN_OPEN);
        this.button.setAttribute(ATTRS.ARIA_EXPANDED, TRUE);

        // Smart focus: search input if available and searchable, otherwise button
        if (this.searchInput && this.config.searchable) {
            requestAnimationFrame(() => {
                this.searchInput?.focus();
            });
        } else {
            // Keep focus on button for immediate keyboard navigation
            requestAnimationFrame(() => {
                this.button.focus();
            });
        }
    }

    /** Toggles the dropdown open/close state. */
    private toggleDropdown(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /** Sets up all event handlers for dropdown interaction. */
    private setupEvents(): void {
        // Mouse click handling
        this.eventManager.addEventHandler(this.button, EVENTS.CLICK, (_e: Event) => {
            this.toggleDropdown();
        });

        // Keyboard navigation for button
        this.eventManager.addEventHandler(this.button, EVENTS.KEYDOWN, (e: Event) => {
            const keyEvent = e as KeyboardEvent;

            if (keyEvent.key === KEYS.ENTER || keyEvent.key === KEYS.SPACE) {
                e.preventDefault();
                this.toggleDropdown();
            } else if (keyEvent.key === KEYS.ESCAPE) {
                e.preventDefault();
                if (this.isOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                }
            }

            // Handle keyboard shortcuts
            if (this.config.keyboardShortcuts) {
                const optionId = this.config.keyboardShortcuts[keyEvent.key.toUpperCase()];
                if (optionId) {
                    e.preventDefault();
                    const option = this.options.find(opt => opt.id === optionId);
                    if (option) {
                        this.selectOption(option);
                    }
                }
            }
        });

        this.eventManager.addEventHandler(this.menu, EVENTS.CLICK, (e: Event) => {
            e.stopPropagation();
        });

        // Option click handling
        this.menu.addEventListener('click', (e: Event) => {
            const target = e.target as Element;
            const optionElement = target.closest(`.${CLASS_DROPDOWN_OPTION}`);

            if (optionElement) {
                const optionId = optionElement.getAttribute('data-option-id');
                if (optionId) {
                    const option = this.options.find(opt => opt.id === optionId);
                    if (option) {
                        this.selectOption(option);
                    }
                }
            }
        });

        // Search input handling - preserve selection
        if (this.searchInput) {
            this.eventManager.addEventHandler(this.searchInput, 'blur', (e: Event) => {
                const blurEvent = e as FocusEvent;
                const relatedTarget = blurEvent.relatedTarget as Element | null;

                // Don't close if focus moves within the dropdown
                if (relatedTarget && this.container?.contains(relatedTarget)) {
                    return;
                }

                setTimeout(() => {
                    if (this.isOpen && !this.isDropdownFocused()) {
                        this.close();
                    }
                }, 0);
            });
        }

        // Global click outside handler - this won't trigger for toolbar clicks now
        this.eventManager.addEventHandler(document, EVENTS.MOUSEDOWN, (e: Event) => {
            if (!this.container?.contains(e.target as Node) && this.isOpen) {
                this.close();
            }
        });
    }

    /** Checks if any element within the dropdown currently has focus. */
    private isDropdownFocused(): boolean {
        const activeElement = document.activeElement;
        return !!(activeElement && this.container?.contains(activeElement));
    }
}
