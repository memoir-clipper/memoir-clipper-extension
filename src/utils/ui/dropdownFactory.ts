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
    CLASS_DROPDOWN_OPTION_FOCUSED,
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
    private button: HTMLElement;
    private menu: HTMLElement;
    private searchInput?: HTMLInputElement;

    private isOpen = false;
    private filteredOptions: DropdownOption[] = [];
    private selectedOptions = new Set<string>();
    private searchTerm = '';
    private focusedIndex = -1;

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
        this.options = [...options];
        this.applyFilter();
        this.updateMenuItems();

        const validIds = new Set(options.map(opt => opt.id));
        const invalidSelections = Array.from(this.selectedOptions).filter(id => !validIds.has(id));
        invalidSelections.forEach(id => {
            this.selectedOptions.delete(id);
        });

        this.updateButtonContent();
        this.resetFocusedIndex();
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

        this.resetFocusedIndex();
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

        this.filteredOptions.forEach((option, index) => {
            const optionElement = this.createOptionElement(option, index);
            this.menu.appendChild(optionElement);
        });

        this.highlightFocusedOption();
    }

    private createOptionElement(option: DropdownOption, index: number): HTMLElement {
        const optionElement = DOM_UTILS.createElement(TAGS.DIV, CLASS_DROPDOWN_OPTION);
        optionElement.setAttribute(ATTRS.ROLE, ATTRS.OPTION);
        optionElement.setAttribute(ATTRS.DATA_OPTION_INDEX, index.toString());

        if (this.selectedOptions.has(option.id)) {
            optionElement.classList.add(CLASS_DROPDOWN_OPTION_SELECTED);
        }

        optionElement.innerHTML = option.render ? option.render(option) : this.createDefaultOptionContent(option);

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

    // --- Focus Management ---

    private resetFocusedIndex(): void {
        this.focusedIndex = -1;
        this.highlightFocusedOption();
    }

    private setInitialFocus(): void {
        // Focus on the first selected option, or first option if none selected
        if (this.filteredOptions.length === 0) {
            this.focusedIndex = -1;
            return;
        }

        // Find first selected option
        const selectedIndex = this.filteredOptions.findIndex(opt => this.selectedOptions.has(opt.id));
        this.focusedIndex = selectedIndex !== -1 ? selectedIndex : 0;
        this.highlightFocusedOption();
    }

    private highlightFocusedOption(): void {
        const options = this.menu.querySelectorAll(`.${CLASS_DROPDOWN_OPTION}`);
        options.forEach((option, index) => {
            if (index === this.focusedIndex) {
                option.classList.add(CLASS_DROPDOWN_OPTION_FOCUSED);
                option.setAttribute(ATTRS.ARIA_SELECTED, TRUE);
            } else {
                option.classList.remove(CLASS_DROPDOWN_OPTION_FOCUSED);
                option.setAttribute(ATTRS.ARIA_SELECTED, FALSE);
            }
        });
    }

    private handleArrowNavigation(key: string): void {
        if (this.filteredOptions.length === 0) return;

        if (key === KEYS.ARROW_DOWN) {
            this.focusedIndex = (this.focusedIndex + 1) % this.filteredOptions.length;
        } else if (key === KEYS.ARROW_UP) {
            this.focusedIndex = this.focusedIndex <= 0 ? this.filteredOptions.length - 1 : this.focusedIndex - 1;
        }

        this.highlightFocusedOption();
        this.scrollToFocusedOption();
    }

    /** Scrolls the focused option into view if needed. */
    private scrollToFocusedOption(): void {
        const focusedElement = this.menu.querySelector(`.${CLASS_DROPDOWN_OPTION_FOCUSED}`);
        if (focusedElement) {
            focusedElement.scrollIntoView({ block: 'nearest' });
        }
    }

    /** Selects the currently focused option. */
    private selectFocusedOption(): void {
        if (this.focusedIndex >= 0 && this.focusedIndex < this.filteredOptions.length) {
            const focusedOption = this.filteredOptions[this.focusedIndex];
            this.selectOption(focusedOption);
        }
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
            this.resetFocusedIndex();
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
        this.resetFocusedIndex();
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

    /** Opens the dropdown and manages focus. */
    private open(): void {
        if (this.isOpen) return;

        this.isOpen = true;
        this.container?.classList.add(CLASS_DROPDOWN_OPEN);
        this.button.setAttribute(ATTRS.ARIA_EXPANDED, TRUE);
        this.setInitialFocus();

        // Smart focus: search input if available and searchable, otherwise keep on button
        if (this.searchInput && this.config.searchable) {
            requestAnimationFrame(() => {
                this.searchInput?.focus();
            });
        } else {
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

    /** Registers all event handlers for dropdown interaction. */
    private setupEvents(): void {
        this.eventManager.addEventHandlers([
            {
                target: this.button,
                event: EVENTS.CLICK,
                handler: this.handleButtonClick,
            },
            {
                target: this.container!,
                event: EVENTS.KEYDOWN,
                handler: this.handleContainerKeydown,
            },
            {
                target: this.menu,
                event: EVENTS.CLICK,
                handler: this.handleMenuClick,
            },
            {
                target: this.menu,
                event: EVENTS.MOUSEDOWN,
                handler: this.handleMenuMousedown,
            },
            {
                target: document,
                event: EVENTS.MOUSEDOWN,
                handler: this.handleDocumentMousedown,
            },
        ]);

        if (this.searchInput) {
            this.eventManager.addEventHandlers([
                {
                    target: this.searchInput,
                    event: EVENTS.INPUT,
                    handler: this.handleSearchInput,
                },
                {
                    target: this.searchInput,
                    event: EVENTS.KEYDOWN,
                    handler: this.handleSearchKeydown,
                },
                {
                    target: this.searchInput,
                    event: EVENTS.BLUR,
                    handler: this.handleSearchBlur,
                },
            ]);
        }
    }

    private handleButtonClick = (e: Event): void => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
    };

    private handleContainerKeydown = (e: Event): void => {
        const keyEvent = e as KeyboardEvent;

        if (keyEvent.key === KEYS.ENTER) {
            e.preventDefault();
            e.stopPropagation();

            if (this.isOpen) {
                // Don't handle if we're typing in search input
                if (this.searchInput && document.activeElement === this.searchInput) {
                    return;
                }
                this.selectFocusedOption();
            } else {
                this.toggleDropdown();
            }
        } else if (keyEvent.key === KEYS.ESCAPE) {
            if (this.isOpen) {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            }
        } else if (keyEvent.key === KEYS.ARROW_DOWN || keyEvent.key === KEYS.ARROW_UP) {
            if (this.isOpen) {
                // Don't handle if we're typing in search input
                if (this.searchInput && document.activeElement === this.searchInput) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                this.handleArrowNavigation(keyEvent.key);
            }
        }

        // Handle keyboard shortcuts
        if (this.config.keyboardShortcuts) {
            const optionId = this.config.keyboardShortcuts[keyEvent.key.toUpperCase()];
            if (optionId) {
                e.preventDefault();
                e.stopPropagation();
                const option = this.options.find(opt => opt.id === optionId);
                if (option) {
                    this.selectOption(option);
                }
            }
        }
    };

    private handleMenuClick = (e: Event): void => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        const optionElement = target.closest(`.${CLASS_DROPDOWN_OPTION}`);

        if (optionElement) {
            e.preventDefault();
            const optionIndex = parseInt(optionElement.getAttribute(ATTRS.DATA_OPTION_INDEX) ?? MINUS_ONE);
            if (optionIndex >= 0 && optionIndex < this.filteredOptions.length) {
                this.focusedIndex = optionIndex;
                this.highlightFocusedOption();
                const option = this.filteredOptions[optionIndex];
                this.selectOption(option);
            }
        }
    };

    private handleMenuMousedown = (e: Event): void => {
        e.stopPropagation();
    };

    private handleDocumentMousedown = (e: Event): void => {
        if (!this.container?.contains(e.target as Node) && this.isOpen) {
            this.close();
        }
    };

    private handleSearchInput = (): void => {
        this.searchTerm = this.searchInput!.value;
        this.applyFilter();
    };

    private handleSearchKeydown = (event: Event): void => {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === KEYS.ENTER && this.config.allowCustom) {
            event.preventDefault();
            event.stopPropagation();
            this.handleCustomCreate();
        } else if (keyEvent.key === KEYS.ESCAPE) {
            event.preventDefault();
            event.stopPropagation();
            this.close();
        } else if (keyEvent.key === KEYS.ARROW_DOWN || keyEvent.key === KEYS.ARROW_UP) {
            event.preventDefault();
            event.stopPropagation();
            this.handleArrowNavigation(keyEvent.key);
        }
    };

    /** Handles blur event for search input, closes dropdown if focus leaves. */
    private handleSearchBlur = (e: Event): void => {
        const blurEvent = e as FocusEvent;
        const relatedTarget = blurEvent.relatedTarget as Element | null;
        if (relatedTarget && this.container?.contains(relatedTarget)) return;
        setTimeout(() => {
            if (this.isOpen && !this.isDropdownFocused()) {
                this.close();
            }
        }, 0);
    };

    /** Returns true if any element within the dropdown currently has focus. */
    private isDropdownFocused(): boolean {
        const activeElement = document.activeElement;
        return !!(activeElement && this.container?.contains(activeElement));
    }
}
